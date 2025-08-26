import type { CustomReportMetadata } from '@lxr/core/models/custom-report-metadata'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import type { ReadEntry } from 'tar'
import { createReadStream, existsSync, mkdirSync, openAsBlob, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { URL } from 'node:url'
import { createBundle, deleteWorkspaceReportById, fetchWorkspaceReports, getAccessToken, getLaunchUrl, readLxrJson, uploadBundle, validateDocument } from '@lxr/core/index'
import appRoot from 'app-root-path'
import { t as tarT } from 'tar'
import ProxyServer from 'transparent-proxy'

const LXR_JSON_PATH = resolve(appRoot.path, 'lxr.json')

const getDummyReportMetadata = (): CustomReportMetadata => ({
  id: 'net.testReport',
  name: 'custom-report-name',
  title: 'Test Report',
  version: '0.1.0',
  description: 'Custom Report Description',
  author: 'John Doe',
  defaultConfig: {}
})

describe('the lxr core package', () => {
  let proxy: Server
  let proxyPort: number = 0
  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      proxy = new ProxyServer()
      proxy.listen(() => {
        proxyPort = (proxy.address() as AddressInfo).port
        resolve()
      })
    })
  })
  afterAll(async () => {
    proxy.close()
  })

  it('validate "lxr.json" and "lxreport.json" against document schemas', async () => {
    const validMetadataDocument = getDummyReportMetadata()
    const invalidMetadataDocument = { ...validMetadataDocument, id: undefined }

    await expect(validateDocument(validMetadataDocument, 'lxreport.json')).resolves.not.toThrow()
    await expect(async () => await validateDocument(invalidMetadataDocument, 'lxreport.json')).rejects.toThrow()
    await expect(validateDocument({ host: 'demo-us.leanix.net', apitoken: 'token' }, 'lxr.json')).resolves.not.toThrow()
    await expect(async () => await validateDocument({ host: 'demo-us.leanix.net' }, 'lxr.json')).rejects.toThrow()
  })

  it('readLxrJson throws error if json file doesn\'t have all required fields', async () => {
    await readLxrJson(LXR_JSON_PATH)
  })

  it('getAccessToken returns a token', async () => {
    const credentials = await readLxrJson(LXR_JSON_PATH)
    const accessToken = await getAccessToken(credentials)
    expect(typeof accessToken.accessToken).toBe('string') // accessToken is a string
    expect(accessToken.accessToken).toBeTruthy()
    expect(typeof accessToken.expired).toBe('boolean')
    expect(accessToken.expired).toBe(false)
    expect(typeof accessToken.expiresIn).toBe('number')
    expect(accessToken.expiresIn > 0).toBe(true)
    expect(typeof accessToken.scope).toBe('string')
    expect(accessToken.tokenType).toBe('bearer')
  })

  it('getAccessToken with proxy returns a token', async () => {
    const credentials = await readLxrJson(LXR_JSON_PATH)
    credentials.proxyURL = `http://127.0.0.1:${proxyPort}`
    const accessToken = await getAccessToken(credentials)
    expect(typeof accessToken.accessToken).toBe('string') // accessToken is a string
    expect(accessToken.accessToken).toBeTruthy()
    expect(typeof accessToken.expired).toBe('boolean')
    expect(accessToken.expired).toBe(false)
    expect(typeof accessToken.expiresIn).toBe('number')
    expect(accessToken.expiresIn > 0).toBe(true)
    expect(typeof accessToken.scope).toBe('string')
    expect(accessToken.tokenType).toBe('bearer')
  })

  it('getLaunchUrl returns a url', async () => {
    const devServerUrl = 'https://localhost:8080'
    const expectedInstanceUrl = 'https://app.leanix.net'
    const expectedWorkspaceName = 'bernharddemo'
    const bearerToken = 'eyJraWQiOiI0MDJjODg3NTBjZmJhOGQzZTQ0NjE0YzQ5YjBlYzg3NiIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJwYXVsb0BmYXplbmRhZG9zb2Z0d2FyZS5jb20iLCJwcmluY2lwYWwiOnsiaWQiOiIyN2U0MjQyZS0xNWJiLTRlNDQtYjQxYi1hMDViYzFhMTEyMjIiLCJ1c2VybmFtZSI6InBhdWxvQGZhemVuZGFkb3NvZnR3YXJlLmNvbSIsInJvbGUiOiJBQ0NPVU5UVVNFUiIsInN0YXR1cyI6IkFDVElWRSIsImFjY291bnQiOnsiaWQiOiIzYWZhMjE2YS1hZTMxLTRjOWUtYTcyZi1hOTVjYzE4NDAxMmQiLCJuYW1lIjoiZmF6ZW5kYWRvc29mdHdhcmUifSwicGVybWlzc2lvbiI6eyJpZCI6ImQ0YmI0MTk5LTgxMmEtNDE2Ny05ZTlmLThmMGI3NWYxMTg0NCIsIndvcmtzcGFjZUlkIjoiZDBhMGEwNDQtMGQ5Ny00ZDhiLTllMmQtYzkzYTBiMTdhMWJhIiwid29ya3NwYWNlTmFtZSI6ImJlcm5oYXJkZGVtbyIsInJvbGUiOiJBRE1JTiIsImN1c3RvbWVyUm9sZXMiOm51bGwsImFjY2Vzc0NvbnRyb2xFbnRpdGllcyI6WyJCTFVFIl0sInN0YXR1cyI6IkFDVElWRSIsImFzVXNlciI6bnVsbH19LCJpc3MiOiJodHRwczovL2V1LXN2Yy5sZWFuaXgubmV0IiwianRpIjoiMTkyMGY1NzktMTU5MS00OTE2LTkzZTktYWQ5NWQyZDFkNzNkIiwiZXhwIjoxNjI5NjgwMzYwLCJpbnN0YW5jZVVybCI6Imh0dHBzOi8vYXBwLmxlYW5peC5uZXQifQ.UswqJIfuT6EG5haAt9WiOG8qRBybV62eHqIbvahZK38AafQ93QETVMbYxf3AySSAYtrElpl3N4mZHtfqJTEygVlQw9uxUQioaT6US-lR6DJK0a7HIK-ec7LHtaQXVu2IOEGgrc7frLYFJcL1zoQqxCuxzNGtgngZbVkSKInm5sQXMueTPkew20Km762a11Us0ralnzmXduIB-JGvjt-nrEgl7t7MpRD2wN9WjN-b3Yw-2sDLj8___bcVPChH93P-p6XMRne5hiHmr-JaY3w2HHQ6PLqU2cG1BMdnA6DpmStM8MRVSciBGPtgy0ovbUrxw862wK1na8F2nrFZpsf9dw'
    const launchUrl = getLaunchUrl(devServerUrl, bearerToken)
    expect(typeof launchUrl).toBe('string')
    const url = new URL(launchUrl)
    expect(url.origin).toBe(expectedInstanceUrl)
    expect(url.pathname).toBe(`/${expectedWorkspaceName}/reporting/dev`)
    expect(url.searchParams.get('url')).toBe(devServerUrl)
    expect(url.hash).toBe(`#access_token=${bearerToken}`)
  })

  it('createProjectBundle returns a readable stream', async () => {
    const outDir = resolve(__dirname, '../.temp/createProjectBundle')

    if (existsSync(outDir)) {
      rmSync(outDir, { recursive: true })
    }
    mkdirSync(outDir, { recursive: true })

    const projectFiles = {
      'index.js': 'console.log("hello world")',
      'index.html': '<html><body>Hello world</body></html>'
    }

    Object.entries(projectFiles)
      .forEach(([filename, content]) => { writeFileSync(resolve(outDir, filename), content) })

    const expectedMetadata = getDummyReportMetadata()

    const bundlePath = await createBundle(expectedMetadata, outDir)
    const fileStream = createReadStream(bundlePath)

    const bundleFiles = await new Promise<Set<string>>((resolve, reject) => {
      const entries: ReadEntry[] = []
      fileStream.on('open', () => fileStream.pipe(tarT()).on('entry', entry => entries.push(entry)))
      fileStream.on('error', (err) => {
        reject(err)
      })
      fileStream.on('end', () => {
        resolve(new Set(entries.map(({ path }) => path)))
      })
    })

    const requiredFiles = new Set([...Object.keys(projectFiles), 'lxreport.json'])

    const bundleHasAllFiles = (): boolean => {
      for (const file of requiredFiles) {
        if (!bundleFiles.has(file)) {
          return false
        }
      }
      return true
    }

    expect(bundleFiles.size === requiredFiles.size).toBe(true)
    expect(bundleHasAllFiles()).toBe(true)

    rmSync(outDir, { recursive: true })
  })

  it('uploadBundle', async () => {
    const credentials = await readLxrJson(LXR_JSON_PATH)
    const outDir = resolve(__dirname, '../.temp/uploadBundle')
    const metadata = getDummyReportMetadata()
    if (!existsSync(outDir)) {
      mkdirSync(outDir, { recursive: true })
    }
    writeFileSync(resolve(outDir, 'index.html'), '<html><body>Hi from demo project</body></html>')
    writeFileSync(resolve(outDir, 'index.js'), 'console.log("hello world")')
    const { accessToken: bearerToken } = await getAccessToken(credentials)
    const reports = await fetchWorkspaceReports(bearerToken)
    const hasTestReportInWorkspace = reports.find(({ id, version }) => id === metadata.id && version === metadata.version)
    if (hasTestReportInWorkspace !== undefined) {
      await deleteWorkspaceReportById(hasTestReportInWorkspace.id, bearerToken)
    }
    const bundlePath = await createBundle(metadata, outDir)
    const bundle = await openAsBlob(bundlePath)
    const reportUploadResponseData = await uploadBundle({ bundle, bearerToken })
    expect(reportUploadResponseData.status).toBe('OK')
    expect(reportUploadResponseData.type).toBe('ReportUploadResponseData')
    expect(typeof reportUploadResponseData.data.id).toBe('string')
    const status = await deleteWorkspaceReportById(reportUploadResponseData.data.id, bearerToken)
    expect(status).toBe(204)
    rmSync(outDir, { recursive: true })
  }, 60000)
})
