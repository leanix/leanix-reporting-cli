import * as chalk from 'chalk';
import { exec, execSync } from 'child_process';
import { PathHelper } from './path-helper';
import * as path from 'path';
import * as fs from 'fs';
import * as tar from 'tar';
import * as rp from 'request-promise-native';
import { ApiTokenResolver } from './api-token-resolver';

export class Uploader {

  private pathHelper = new PathHelper();
  private projectDir = new PathHelper().getProjectDirectory();

  public upload() {
    console.log(chalk.green('Bundling and uploading your project...'));

    return this.buildWithWebpack()
    .then(() => this.writeMetadataFile())
    .then(() => this.createTarFromSrcFolderAndAddToDist())
    .then(() => this.createTarFromDistFolder())
    .then(() => this.executeUpload());
  }

  private buildWithWebpack() {
    return new Promise((resolve, reject) => {
      // remove dist folder
      execSync('rm -rf ' + path.resolve(this.projectDir, 'dist'));

      const webpackCmd = path.resolve(this.projectDir, 'node_modules/.bin/webpack');
      exec(webpackCmd, (err, stdout) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log(stdout);
          console.log(chalk.green('\u2713 Project successfully build!'));
          resolve();
        }
      });
    });
  }

  private writeMetadataFile() {
    return new Promise((resolve, reject) => {
      const packageJson = require(path.resolve(this.projectDir, 'package.json'));
      const metadataFile = path.resolve(this.projectDir, 'dist/lxreport.json');

      const metadata = Object.assign({}, {
        name: packageJson.name,
        version: packageJson.version,
        author: packageJson.author,
        description: packageJson.description,
        documentationLink: packageJson.documentationLink
      }, packageJson.leanixReport);

      fs.writeFile(metadataFile, JSON.stringify(metadata), function(err) {
        if(err) {
          console.log(err);
          reject(err);
        } else {
          resolve(metadataFile);
        }
      });
    });
  }

  private createTarFromSrcFolderAndAddToDist() {
    const files = fs.readdirSync(path.resolve(this.projectDir, 'src'));
    return tar.c({ gzip: true, cwd: 'src', file: 'dist/src.tgz' }, files);
  }

  private createTarFromDistFolder() {
    const files = fs.readdirSync(path.resolve(this.projectDir, 'dist'));
    return tar.c({ gzip: true, cwd: 'dist', file: 'bundle.tgz' }, files);
  }

  private executeUpload() {
    const lxrConfig = require(this.pathHelper.getLxrConfigPath());
    console.log(chalk.italic(`Uploading to ${lxrConfig.host} ...`));
    const host = 'https://' + lxrConfig.host;
    const apitoken = lxrConfig.apitoken;

    return ApiTokenResolver.getAccessToken(host, apitoken)
    .then(accessToken => {
      const options = {
        url: host + '/services/pathfinder/v1/reports/upload',
        headers: {
          'Authorization': 'Bearer ' + accessToken
        },
        formData: {
          file: fs.createReadStream(path.resolve(this.projectDir, 'bundle.tgz'))
        }
      };

      return rp.post(options)
      .then(response => {
        const responseJson = JSON.parse(response);
        if (responseJson.status === 'OK') {
          console.log(chalk.green('\u2713 Project successfully uploaded!'));
          return true;
        } else if (responseJson.status === 'ERROR') {
          console.log(chalk.red('ERROR: ' + responseJson.errorMessage));
          return false;
        }
      }).catch(err => {
        const responseBody = err.response.toJSON().body;
        const errorJson = JSON.parse(responseBody);
        if (errorJson.errorMessage) {
          console.log(chalk.red('ERROR: ' + errorJson.errorMessage));
        } else {
          console.log(chalk.red('ERROR: ' + responseBody));
        }
        return false;
      });
    });
  }
}
