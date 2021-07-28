import * as chalk from 'chalk';
import { spawn } from 'cross-spawn';
import * as jwtDecode from 'jwt-decode';
import * as _ from 'lodash';
import * as opn from 'opn';
import { ApiTokenResolver } from './api-token-resolver';
import { loadLxrConfig } from './file.helpers';
import { LxrConfig } from './interfaces';

interface DevServerStartResult {
  launchUrl: string;
  localhostUrl: string;
}

export class DevStarter {
  public start(): Promise<void> {
    const config = loadLxrConfig();
    return this.getAccessToken(config)
      .then((accessToken) => this.startLocalServer(config, accessToken))
      .then((result) => {
        if (result) {
          this.openUrlInBrowser(result.launchUrl);
          console.log(chalk.green(`Open the following url to test your report:\n${result.launchUrl}`) + '\n');
          console.log(
            chalk.yellow(
              `If your report is not being loaded, please check if it opens outside of LeanIX via this url:\n${result.localhostUrl}`
            )
          );
        }
      });
  }

  private async startLocalServer(config: LxrConfig, accessToken?: string): Promise<DevServerStartResult> {
    const port = config.localPort || 8080;
    const localhostUrl = `https://localhost:${port}`;
    const urlEncoded = encodeURIComponent(localhostUrl);
    const host = 'https://' + config.host;

    const accessTokenHash = accessToken ? `#access_token=${accessToken}` : '';
    const workspace = accessToken ? this.getWorkspaceFromAccesToken(accessToken) : config.workspace;

    if (_.isEmpty(workspace)) {
      console.error(chalk.red("Workspace not specified. The local server can't be started."));
      return new Promise(null);
    }
    console.log(chalk.green(`Your workspace is ${workspace}`));

    const baseLaunchUrl = `${host}/${workspace}/reports/dev?url=${urlEncoded}`;
    const launchUrl = baseLaunchUrl + accessTokenHash;
    console.log(chalk.green('Starting development server and launching with url: ' + baseLaunchUrl));

    const args = ['--https', '--port', '' + port];
    if (config.ssl && config.ssl.cert && config.ssl.key) {
      args.push('--cert=' + config.ssl.cert);
      args.push('--key=' + config.ssl.key);
    }

    console.log('' + args.join(' '));

    const wpMajorVersion = await this.getCurrentWebpackMajorVersion();

    const serverProcess =
      wpMajorVersion === 5 ? spawn('node_modules/.bin/webpack', ['serve', ...args]) : spawn('node_modules/.bin/webpack-dev-server', args);

    serverProcess.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    // output errors from webpack
    serverProcess.stderr.on('data', (data) => {
      console.error(chalk.red(data.toString()));
    });

    return new Promise<{ launchUrl: string; localhostUrl: string }>((resolve) => {
      let projectRunning = false;
      serverProcess.on('error', (err) => {
        console.error(err);
      });

      serverProcess.stdout.on('data', async (data) => {
        const output: string = data.toString();

        if (output.indexOf('Project is running') >= 0) {
          projectRunning = true;
        }
        if (projectRunning && output.indexOf('Compiled successfully') >= 0) {
          resolve({ launchUrl, localhostUrl });
        }
      });
    });
  }

  private getCurrentWebpackMajorVersion(): Promise<number> {
    return new Promise((resolve) => {
      const webpackVersion = spawn('node_modules/.bin/webpack', ['-v']);
      webpackVersion.stdout.on('data', (data) => {
        const output: string = data.toString();
        const matches = output.match(/\d+\.\d+\.\d+/gm);
        const majorVersion = matches[0].match(/\d+/gm)[0];
        resolve(Number.parseInt(majorVersion));
      });
    });
  }

  private getWorkspaceFromAccesToken(accessToken: string) {
    const claims = jwtDecode(accessToken);
    return claims.principal.permission.workspaceName;
  }

  private getAccessToken(config: LxrConfig): Promise<string> {
    if (!_.isEmpty(config.apitoken)) {
      return ApiTokenResolver.getAccessToken('https://' + config.host, config.apitoken, config.proxyURL);
    } else {
      return Promise.resolve(null);
    }
  }

  private openUrlInBrowser(url: string) {
    try {
      opn(url);
    } catch (err) {
      console.error('Unable to open your browser: ' + err);
    }
  }
}
