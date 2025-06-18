import type { LxrConfig } from './interfaces'
import { join } from 'node:path'
import chalk from 'chalk'
import { spawn } from 'cross-spawn'
import jwtDecode from 'jwt-decode'
import * as _ from 'lodash'
import opn from 'opn'
import { ApiTokenResolver } from './api-token-resolver'
import { loadLxrConfig } from './file.helpers'

interface DevServerStartResult {
  launchUrl: string
  localhostUrl: string
}

export class DevStarter {
  public async start(): Promise<void> {
    const config = loadLxrConfig()
    const accessToken = await this.getAccessToken(config)
    const result = await this.startLocalServer(config, accessToken)
    this.openUrlInBrowser(result.launchUrl)
    console.log(`${chalk.green(`Open the following url to test your report:\n${result.launchUrl}`)}\n`)
    console.log(
      chalk.yellow(
        `If your report is not being loaded, please check if it opens outside of LeanIX via this url:\n${result.localhostUrl}`
      )
    )
  }

  private async startLocalServer(config: LxrConfig, accessToken?: string): Promise<DevServerStartResult> {
    const port = config.localPort || 8080
    const localhostUrl = `https://localhost:${port}`
    const urlEncoded = encodeURIComponent(localhostUrl)
    const host = `https://${config.host}`

    const accessTokenHash = accessToken ? `#access_token=${accessToken}` : ''
    const workspace = accessToken ? this.getWorkspaceFromAccesToken(accessToken) : config.workspace

    if (_.isEmpty(workspace)) {
      console.error(chalk.red('Workspace not specified. The local server can\'t be started.'))
      return new Promise(null)
    }
    console.log(chalk.green(`Your workspace is ${workspace}`))

    const baseLaunchUrl = `${host}/${workspace}/reports/dev?url=${urlEncoded}`
    const launchUrl = baseLaunchUrl + accessTokenHash
    console.log(chalk.green(`Starting development server and launching with url: ${baseLaunchUrl}`))

    const wpMajorVersion = await this.getCurrentWebpackMajorVersion()
    const args = ['--port', `${port}`]
    if (wpMajorVersion < 5) {
      args.push('--https')
    }

    if (config.ssl && config.ssl.cert && config.ssl.key) {
      args.push(`--cert=${config.ssl.cert}`)
      args.push(`--key=${config.ssl.key}`)
    }

    console.log(`${args.join(' ')}`)

    let projectRunning = false

    const webpackCmd = join(
      ...(wpMajorVersion === 5 ? ['node_modules', '.bin', 'webpack'] : ['node_modules', '.bin', 'webpack-dev-server'])
    )

    const serverProcess = wpMajorVersion === 5 ? spawn(webpackCmd, ['serve', ...args]) : spawn(webpackCmd, args)

    serverProcess.stdout.on('data', (data) => {
      console.log(data.toString())
    })
    // output errors from webpack
    serverProcess.stderr.on('data', (data) => {
      const output: string = data.toString()
      if (output.includes('Project is running')) {
        projectRunning = true
      }
      console.error(chalk.red(data.toString()))
    })

    return new Promise<DevServerStartResult>((resolve) => {
      serverProcess.on('error', (err) => {
        console.error(err)
      })

      serverProcess.stdout.on('data', (data) => {
        const output: string = data.toString()
        if (output.includes('Project is running')) {
          projectRunning = true
        }

        if (projectRunning && output.toLowerCase().includes('compiled successfully')) {
          resolve({ launchUrl, localhostUrl })
        }
      })
    })
  }

  private getCurrentWebpackMajorVersion(): Promise<number> {
    return new Promise((resolve) => {
      const webpackVersion = spawn(join(...['node_modules', '.bin', 'webpack']), ['-v'])
      webpackVersion.stdout.on('data', (data) => {
        const output: string = data.toString()
        const matches = output.match(/(\d+)\.\d+\.\d+/)
        const majorVersion = Number.parseInt(matches[0])
        resolve(majorVersion)
      })
    })
  }

  private getWorkspaceFromAccesToken(accessToken: string) {
    const claims = jwtDecode(accessToken)
    return claims.principal.permission.workspaceName
  }

  private async getAccessToken(config: LxrConfig): Promise<string> {
    if (!_.isEmpty(config.apitoken)) {
      const token = await ApiTokenResolver.getAccessToken(`https://${config.host}`, config.apitoken, config.proxyURL)
      return token
    }
    else {
      return Promise.resolve(null)
    }
  }

  private openUrlInBrowser(url: string) {
    try {
      opn(url)
    }
    catch (err) {
      console.error(`Unable to open your browser: ${err}`)
    }
  }
}
