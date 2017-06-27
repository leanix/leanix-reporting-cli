import * as chalk from 'chalk';
import { exec, spawn } from 'child_process';
import { PathHelper } from './path-helper';

export class DevStarter {

  private pathHelper = new PathHelper();

  public start() {
    const lxrConfig = require(this.pathHelper.getLxrConfigPath());
    const port = 8080;

    const urlEncoded = encodeURIComponent(`https://localhost:${port}`);
    const launchUrl = `${lxrConfig.host}/${lxrConfig.workspace}/reporting/dev?url=${urlEncoded}`;
    console.log(chalk.green('Starting development server...'));

    const args = ['--https', '--port', '' + port]; //, '--cert=' + certFile, '--key=' + keyFile];
//    console.log('' + args.join(' '));
    const serverProcess = spawn('node_modules/.bin/webpack-dev-server', args);
    serverProcess.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    const serverPromise = new Promise((resolve) => {
      serverProcess.on('error', (err) => {
        console.error(err);
      });

      serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.indexOf('Project is running') >= 0) {
          resolve();
        }
      });
    });

    serverPromise.then(() => {
      exec('open ' + launchUrl);
      console.log(chalk.green(`Open the following url to test your report: ${launchUrl}`));
    });
  }
}
