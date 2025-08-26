import type { AccessToken } from '@lxr/core/models/access-token'
import type { CustomReportMetadata } from '@lxr/core/models/custom-report-metadata'
import type { JwtClaims } from '@lxr/core/models/jwt-claims'
import type { LeanIXCredentials } from '@lxr/core/models/leanix-credentials'
import type { PackageJsonLXR } from '@lxr/core/models/package-json'
import type { PathfinderReportUploadError, PathfinderResponseData, ResponseStatus } from '@lxr/core/models/pathfinder-response-data'
import type { RequestInit } from 'node-fetch'
import type { ZodObject } from 'zod'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { URL } from 'node:url'
import { customReportMetadataSchema } from '@lxr/core/models/custom-report-metadata'
import { leanixCredentialsSchema } from '@lxr/core/models/leanix-credentials'
import { packageJsonLxrSchema } from '@lxr/core/models/package-json'
import { FormData } from 'formdata-node'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { jwtDecode } from 'jwt-decode'
import fetch from 'node-fetch'
import { c } from 'tar'

const snakeToCamel = (s: string): string => s.replace(/([-_]\w)/g, g => g[1].toUpperCase())

export const validateDocument = async (document: unknown, name: 'lxr.json' | 'lxreport.json' | 'package.json'): Promise<PackageJsonLXR | LeanIXCredentials | CustomReportMetadata> => {
  let schema: ZodObject<any> | null = null
  let output: PackageJsonLXR | LeanIXCredentials | CustomReportMetadata
  switch (name) {
    case 'package.json':
      schema = packageJsonLxrSchema
      output = document as PackageJsonLXR
      break
    case 'lxr.json':
      schema = leanixCredentialsSchema
      output = document as LeanIXCredentials
      break
    case 'lxreport.json':
      schema = customReportMetadataSchema
      output = document as CustomReportMetadata
      break
    default:
      throw new Error(`unknown document name ${name}`)
  }

  schema.parse(document)
  return output
}

export const readLxrJson = async (path?: string): Promise<LeanIXCredentials> => {
  if ((path ?? '').length === 0) {
    path = join(process.cwd(), 'lxr.json')
  }
  const { host, apitoken, proxyURL = null, store = null } = JSON.parse(path !== undefined ? readFileSync(path).toString() : '{}')
  const credentials: LeanIXCredentials = { host, apitoken }
  if (proxyURL !== null) {
    credentials.proxyURL = proxyURL
  }
  if (store !== null) {
    credentials.store = store
  }
  await validateDocument(credentials, 'lxr.json')
  return credentials
}

export const readMetadataJson = async (path = join(process.cwd(), 'package.json')): Promise<CustomReportMetadata> => {
  const fileContent = readFileSync(path).toString()
  const pkg: PackageJsonLXR = JSON.parse(fileContent)
  await validateDocument(pkg, 'package.json')
  const { name, version, author, description, leanixReport } = pkg
  const metadata: CustomReportMetadata = { name, version, author, description, ...leanixReport }
  await validateDocument(metadata, 'lxreport.json')
  return metadata
}

export const createProxyAgent = (proxyURL: string): HttpsProxyAgent<string> => new HttpsProxyAgent(new URL(proxyURL))

export const getAccessToken = async (credentials: LeanIXCredentials): Promise<AccessToken> => {
  const uri = `https://${credentials.host}/services/mtm/v1/oauth2/token?grant_type=client_credentials`
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': `Basic ${Buffer.from(`apitoken:${credentials.apitoken}`).toString('base64')}`
  }
  const options: RequestInit = { method: 'post', headers }
  if (typeof credentials.proxyURL === 'string' && credentials.proxyURL.length > 0) {
    options.agent = createProxyAgent(credentials.proxyURL)
  }
  const accessToken: AccessToken = await fetch(uri, options)
    .then(async (res) => {
      const content = await res[res.headers.get('content-type') === 'application/json' ? 'json' : 'text']()
      return res.ok ? content : await Promise.reject(res.status)
    })
    .then(accessToken => Object.entries(accessToken as AccessToken)
      .reduce((accumulator, [key, value]) => ({ ...accumulator, [snakeToCamel(key)]: value }), {
        accessToken: '',
        expired: false,
        expiresIn: 0,
        scope: '',
        tokenType: ''
      }))
  return accessToken
}

export const getAccessTokenClaims = (accessToken: AccessToken): JwtClaims => jwtDecode(accessToken.accessToken)

export const getLaunchUrl = (devServerUrl: string, bearerToken: string): string => {
  const decodedToken: JwtClaims = jwtDecode(bearerToken)
  const urlEncoded = devServerUrl === decodeURIComponent(devServerUrl) ? encodeURIComponent(devServerUrl) : devServerUrl
  const baseLaunchUrl = `${decodedToken.instanceUrl}/${decodedToken.principal.permission.workspaceName}/reporting/dev?url=${urlEncoded}#access_token=${bearerToken}`
  return baseLaunchUrl
}

export const createBundle = async (metadata: CustomReportMetadata, outDir: string): Promise<string> => {
  const metaFilename = 'lxreport.json'
  const bundleFilename = 'bundle.tgz'
  const targetFilePath = resolve(outDir, bundleFilename)
  if (!existsSync(outDir)) {
    throw new Error(`could not find outDir: ${outDir}`)
  }
  writeFileSync(resolve(outDir, metaFilename), JSON.stringify(metadata))
  await c({ gzip: true, cwd: outDir, file: targetFilePath, filter: path => path !== bundleFilename }, readdirSync(outDir))

  return targetFilePath
}

type ReportsResponseData = {
  data: CustomReportMetadata[]
  total: number
  endCursor: string
} & PathfinderResponseData

export interface ReportUploadResponseData {
  type: string
  status: ResponseStatus
  data: { id: string }
  errorMessage?: string
  errors?: PathfinderReportUploadError[]
}

export const uploadBundle = async (params: {
  bundle: Blob
  bearerToken: string
  proxyURL?: string
  store?: {
    host?: string
    assetId: string
  }
}): Promise<ReportUploadResponseData> => {
  const { bundle, bearerToken, proxyURL, store } = params
  const storeHost = store?.host ?? 'store.leanix.net'
  const assetId = store?.assetId ?? null
  const decodedToken: JwtClaims = jwtDecode(bearerToken)
  const url = assetId !== null
    ? `https://${storeHost}/services/torg/v1/assetversions/${assetId}/payload`
    : `${decodedToken.instanceUrl}/services/pathfinder/v1/reports/upload`
  const headers = { Authorization: `Bearer ${bearerToken}` }
  const form = new FormData()

  form.append('file', bundle)
  const options: RequestInit = { method: 'post', headers, body: form }
  if (typeof proxyURL === 'string' && proxyURL.length > 0) {
    options.agent = createProxyAgent(proxyURL)
  }
  const reportResponseData: ReportUploadResponseData = await fetch(url, options)
    .then(async (res) => {
      const contentType: string | null = res.headers.get('content-type')
      const content = contentType === 'application/json'
        ? await res.json()
        : await res.text()
      if (!res.ok) {
        throw new Error(JSON.stringify({ status: res.status, message: content }))
      }
      return content as ReportUploadResponseData
    })
  return reportResponseData
}

export const fetchWorkspaceReports = async (bearerToken: string, proxyURL?: string): Promise<CustomReportMetadata[]> => {
  const decodedToken: JwtClaims = jwtDecode(bearerToken)
  const headers = { Authorization: `Bearer ${bearerToken}` }
  const fetchReportsPage = async (cursor: string | null = null): Promise<ReportsResponseData> => {
    const url = new URL(`${decodedToken.instanceUrl}/services/pathfinder/v1/reports?sorting=updatedAt&sortDirection=DESC&pageSize=100`)
    if (cursor !== null) {
      url.searchParams.append('cursor', cursor)
    }
    const options: RequestInit = { method: 'get', headers }
    if (proxyURL !== undefined) {
      options.agent = createProxyAgent(proxyURL)
    }
    const reportsPage: ReportsResponseData = await fetch(url.toString(), options)
      .then(async res => await res.json() as ReportsResponseData)
    return reportsPage
  }
  const reports: CustomReportMetadata[] = []
  let cursor = null
  do {
    const reportResponseData: ReportsResponseData = await fetchReportsPage(cursor)
    if (reportResponseData.status !== 'OK') {
      return await Promise.reject(reportResponseData)
    }
    reports.push(...reportResponseData.data)
    cursor = reports.length < reportResponseData.total ? reportResponseData.endCursor : null
  } while (cursor !== null)
  return reports
}

export const deleteWorkspaceReportById = async (reportId: string, bearerToken: string, proxyURL?: string): Promise<204 | number> => {
  const decodedToken: JwtClaims = jwtDecode(bearerToken)
  const headers = { Authorization: `Bearer ${bearerToken}` }
  const url = new URL(`${decodedToken.instanceUrl}/services/pathfinder/v1/reports/${reportId}`)
  const options: RequestInit = { method: 'delete', headers }
  if (proxyURL !== undefined) {
    options.agent = createProxyAgent(proxyURL)
  }
  const status = await fetch(url.toString(), options)
    .then(({ status }) => status)
  return status === 204 ? await Promise.resolve(status) : await Promise.reject(status)
}
