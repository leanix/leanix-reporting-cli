import type { AccessToken } from '@lxr/core/models/access-token'
import type { CustomReportMetadata } from '@lxr/core/models/custom-report-metadata'
import type { JwtClaims } from '@lxr/core/models/jwt-claims'
import type { LeanIXCredentials } from '@lxr/core/models/leanix-credentials'
import type { AddressInfo } from 'node:net'
import type { Logger, Plugin, ResolvedConfig } from 'vite'
import { promises as fsp, openAsBlob } from 'node:fs'
import { join } from 'node:path'
import {
  createBundle,
  getAccessToken,
  getAccessTokenClaims,
  getLaunchUrl,
  readLxrJson,
  readMetadataJson,
  uploadBundle
} from '@lxr/core/index'
import { ZodError } from 'zod'
import { resolveHostname } from './helpers'

export interface LeanIXPluginOptions {
  packageJsonPath?: string
}

// https://vitejs.dev/guide/migration.html#automatic-https-certificate-generation
// https://github.com/vitejs/vite-plugin-basic-ssl
export async function getCertificate(cacheDir: string): Promise<any> {
  const cachePath = join(cacheDir, '_cert.pem')

  try {
    const [stat, content] = await Promise.all([
      fsp.stat(cachePath),
      fsp.readFile(cachePath, 'utf8')
    ])

    if (Date.now() - stat.ctime.valueOf() > 30 * 24 * 60 * 60 * 1000) {
      throw new Error('cache is outdated.')
    }

    return content
  }
  catch {
    const content = (await import('./certificate')).createCertificate()
    fsp
      .mkdir(cacheDir, { recursive: true })
      .then(async () => { await fsp.writeFile(cachePath, content) })
      .catch(() => {})
    return content
  }
}

export default function leanixPlugin(pluginOptions?: LeanIXPluginOptions): Plugin[] {
  let logger: Logger
  let accessToken: AccessToken | null = null
  let claims: JwtClaims | null = null
  let shouldUpload: boolean = false
  let loadWorkspaceCredentials: boolean = false
  let credentials: LeanIXCredentials = { host: '', apitoken: '' }
  let viteDevServerUrl: string
  let launchUrl: string

  const defaultCacheDir = 'node_modules/.vite'

  const lxrPlugin: Plugin = {
    name: 'vite-plugin-lxr',
    enforce: 'post',
    apply: undefined,
    async config(config, env) {
      shouldUpload = env.mode === 'upload'
      loadWorkspaceCredentials = env.command === 'serve' || shouldUpload
      if (loadWorkspaceCredentials) {
        const certificate = await getCertificate(`${config.cacheDir ?? defaultCacheDir}/basic-ssl`)
        const https = (): any => ({ cert: certificate, key: certificate })

        // server exposes host and runs in TLS + HTTPS2 mode
        // required for serving the custom report files in LeanIX
        config.base = ''
        config.server = { ...config.server ?? {}, https: https(), host: true, cors: true }
        config.preview = { ...config.preview ?? {}, https: https() }
        if (credentials.proxyURL !== undefined) {
          config.server.proxy = { '*': credentials.proxyURL }
        }
        try {
          credentials = await readLxrJson()
        }
        catch (error) {
          logger = logger ?? console
          const code = (error as { code: string })?.code ?? null
          if (code === 'ENOENT') {
            logger.error('💥 Error: "lxr.json" file not found in your project root')
          }
          else { logger?.error(error as string) }

          process.exit(1)
        }
      }
    },
    async configResolved(resolvedConfig: ResolvedConfig) {
      logger = resolvedConfig.logger
      if (loadWorkspaceCredentials) {
        try {
          if (typeof credentials.proxyURL === 'string' && credentials.proxyURL.length > 0) {
            logger?.info(`👀 vite-plugin is using the following proxy: ${credentials.proxyURL}`)
          }
          accessToken = await getAccessToken(credentials)
          claims = getAccessTokenClaims(accessToken)
          if (claims !== null) {
            logger?.info(`🔥 Your workspace is ${claims.principal.permission.workspaceName}`)
          }
        }
        catch (err) {
          logger?.error(err === 401 ? '💥 Invalid LeanIX API token' : `${err}`)
          process.exit(1)
        }
      }
    },
    configureServer({ config: { server: { host, https = null } }, httpServer }) {
      if (httpServer !== null) {
        httpServer.on('listening', async () => {
          const { port } = httpServer.address() as AddressInfo
          const { name: hostname } = resolveHostname(host)
          const protocol = https !== null ? 'https' : 'http'
          viteDevServerUrl = `${protocol}://${hostname}:${port}`
          if (accessToken !== null) {
            launchUrl = getLaunchUrl(viteDevServerUrl, accessToken.accessToken)
            setTimeout(() => {
              logger?.info(`🚀 Your development server is available here => ${launchUrl}`)
            }, 1)
          }
          else { throw new Error('💥 Could not get launch url, no accessToken...') }
        })
      }
    },
    async writeBundle(options, _outputBundle) {
      let metadata: CustomReportMetadata | undefined
      try {
        metadata = await readMetadataJson(pluginOptions?.packageJsonPath)
      }
      catch (err: any) {
        if (err?.code === 'ENOENT') {
          const path: string = err.patßh
          logger?.error(`💥 Could not find metadata file at "${path}"`)
          logger?.warn('🙋 Have you initialized this project?"')
        }
        else if (err instanceof ZodError) {
          const issues = err.issues
          logger.error(`\n💥 Found ${issues.length} errors while validating metadata`)
          let i = 0
          for (const issue of issues) {
            i++
            if (issue.code === 'invalid_type') {
              const { code, expected, path, message } = issue
              logger?.error(`💥 #${i} ${message} ${path} - ${code}, expected ${expected}`)
            }
            else {
              const { code, path, message } = issue
              logger?.error(`💥 #${i} ${message} ${path} - ${code}`)
            }
          }
        }
        else {
          logger.error(`💥 Unknown error`, err)
        }
        process.exit(1)
      }
      let bundle: Blob
      if (metadata !== undefined && options?.dir !== undefined) {
        const bundlePath = await createBundle(metadata, options?.dir)
        bundle = await openAsBlob(bundlePath)
      }
      else {
        logger?.error('💥 Error while create project bundle file.')
        process.exit(1)
      }
      if (bundle !== undefined && accessToken?.accessToken !== undefined && shouldUpload) {
        try {
          const { accessToken: bearerToken } = accessToken
          const { proxyURL, store } = credentials
          const { id, version } = metadata
          if (claims !== null) {
            if (typeof store?.assetId === 'string') {
              logger.info(`😅 Deploying asset id ${store.assetId} to ${store.host ?? 'store.leanix.net'}...`)
            }
            else { logger.info(`😅 Uploading report ${id} with version "${version}" to workspace "${claims.principal.permission.workspaceName}"...`) }
          }
          const result = await uploadBundle({ bundle, bearerToken, proxyURL, store })
          if (result.status === 'ERROR') {
            logger?.error('💥 Error while uploading project to workpace, check your "package.json" file...')
            logger?.error(JSON.stringify(result, null, 2))
            process.exit(1)
          }
          if (typeof store?.assetId === 'string') {
            logger.info(`😅 Asset id ${store.assetId} has been deployed to ${store.host ?? 'store.leanix.net'}...`)
          }
          else if (claims !== null) {
            logger?.info(`🥳 Report "${id}" with version "${version}" was uploaded to workspace "${claims.principal.permission.workspaceName}"!`)
          }
        }
        catch (err: any) {
          logger?.error('💥 Error while uploading project to workpace...')
          logger?.error(`💣 ${err}`)
          process.exit(1)
        }
      }
    }
  }
  return [lxrPlugin]
}
