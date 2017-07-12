import * as chalk from 'chalk';
import { exec, spawn } from 'child_process';
import { PathHelper } from './path-helper';

export class DevStarter {

  private pathHelper = new PathHelper();

  public start() {
    const lxrConfig = require(this.pathHelper.getLxrConfigPath());
    const port = lxrConfig.localPort || 8080;

    const localhostUrl = `https://localhost:${port}`;
    const urlEncoded = encodeURIComponent(localhostUrl);

    const host = 'https://' + lxrConfig.host;
    const launchUrl = `${host}/${lxrConfig.workspace}/reporting/dev?url=${urlEncoded}`;
    console.log(chalk.green('Starting development server and launching with url: ' + launchUrl));

    const args = ['--https', '--port', '' + port];
    if (lxrConfig.ssl && lxrConfig.ssl.cert && lxrConfig.ssl.key) {
      args.push('--cert=' + lxrConfig.ssl.cert);
      args.push('--key=' + lxrConfig.ssl.key);
    }

    console.log('' + args.join(' '));
    const serverProcess = spawn('node_modules/.bin/webpack-dev-server', args);
    serverProcess.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    const serverPromise = new Promise((resolve) => {
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
          resolve();
        }
      });
    });

    serverPromise.then(() => {
      exec('open ' + launchUrl);
      console.log(chalk.green(`Open the following url to test your report: ${launchUrl}`));
      console.log(chalk.yellow(`If your report is not being loaded, please check if it opens outside of LeanIX via this url: ${localhostUrl}`));
    });
  }
}
