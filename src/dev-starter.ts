import * as chalk from 'chalk';
import * as opn from 'opn';
import * as jwtDecode from 'jwt-decode';
import { spawn } from 'cross-spawn';
import { PathHelper } from './path-helper';
import { ApiTokenResolver } from './api-token-resolver';

interface DevServerStartResult {
  launchUrl: string;
  localhostUrl: string;
}

export class DevStarter {

  private pathHelper = new PathHelper();
  private lxrConfig = require(this.pathHelper.getLxrConfigPath());

  public start() {
    return this.getApiToken()
    .then(accessToken => this.startLocalServer(accessToken))
    .then(startResult => {
      this.openUrlInBrowser(startResult.launchUrl);
      console.log(chalk.green(`Open the following url to test your report:\n${startResult.launchUrl}`));
      console.log('');
      console.log(chalk.yellow(`If your report is not being loaded, please check if it opens outside of LeanIX via this url:\n${startResult.localhostUrl}`));
    });
  }

  private startLocalServer(accessToken: string): Promise<DevServerStartResult> {
    const port = this.lxrConfig.localPort || 8080;

    const localhostUrl = `https://localhost:${port}`;
    const urlEncoded = encodeURIComponent(localhostUrl);

    const host = 'https://' + this.lxrConfig.host;
    const accessTokenHash = accessToken ? `#access_token=${accessToken}` : '';
    const claims = jwtDecode(accessToken);
    const workspace = claims.principal.permission.workspaceName;
    console.log(chalk.green(`Your workspace is ${workspace}`));
    const baseLaunchUrl = `${host}/${workspace}/reporting/dev?url=${urlEncoded}`;
    const launchUrl = baseLaunchUrl + accessTokenHash;
    console.log(chalk.green('Starting development server and launching with url: ' + baseLaunchUrl));

    const args = ['--https', '--port', '' + port];
    if (this.lxrConfig.ssl && this.lxrConfig.ssl.cert && this.lxrConfig.ssl.key) {
      args.push('--cert=' + this.lxrConfig.ssl.cert);
      args.push('--key=' + this.lxrConfig.ssl.key);
    }

    console.log('' + args.join(' '));
    const serverProcess = spawn('node_modules/.bin/webpack-dev-server', args);
    serverProcess.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    // output errors from webpack
    serverProcess.stderr.on('data', (data) => {
      console.error(chalk.red(data.toString()));
    });

    return new Promise((resolve) => {
      let projectRunning = false;
      serverProcess.on('error', (err) => {
        console.error(err);
      });

      serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.indexOf('Project is running') >= 0) {
          projectRunning = true;
        }
        if (projectRunning && output.indexOf('Compiled successfully') >= 0) {
          resolve({ launchUrl, localhostUrl });
        }
      });
    });
  }

  private getApiToken(): Promise<string> {
    if (this.lxrConfig.apitoken) {
      return ApiTokenResolver.getAccessToken('https://' + this.lxrConfig.host, this.lxrConfig.apitoken, this.lxrConfig.proxyURL);
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
