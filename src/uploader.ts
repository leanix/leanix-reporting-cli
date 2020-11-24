import * as chalk from 'chalk';
import * as rp from 'request-promise-native';
import * as tar from 'tar';
import * as fs from 'fs';
import { ApiTokenResolver } from './api-token-resolver';
import { loadPackageJson } from './file.helpers';
import { getProjectDirectoryPath } from './path.helpers';

/**
 * Builds and uploads the project.
 */
export class Uploader {
  public async upload(url: string, apitoken: string, tokenhost: string, proxy?: string): Promise<boolean> {
    await this.writeMetadataFile();
    await this.createTarFromSrcFolderAndAddToDist();
    await this.createTarFromDistFolder();
    const accessToken = await ApiTokenResolver.getAccessToken(`https://${tokenhost}`, apitoken, proxy);
    return await this.executeUpload(url, accessToken, proxy);
  }

  private writeMetadataFile() {
    return new Promise((resolve, reject) => {
      const packageJson = loadPackageJson();
      const metadataFile = getProjectDirectoryPath('dist/lxreport.json');

      const metadata = Object.assign(
        {},
        {
          name: packageJson.name,
          version: packageJson.version,
          author: packageJson.author,
          description: packageJson.description,
          documentationLink: packageJson.documentationLink
        },
        packageJson.leanixReport
      );

      fs.writeFile(metadataFile, JSON.stringify(metadata), function (err) {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(metadataFile);
        }
      });
    });
  }

  private createTarFromSrcFolderAndAddToDist() {
    const files = fs.readdirSync(getProjectDirectoryPath('src'));
    return tar.c({ gzip: true, cwd: 'src', file: 'dist/src.tgz' }, files);
  }

  private createTarFromDistFolder() {
    const files = fs.readdirSync(getProjectDirectoryPath('dist'));
    return tar.c({ gzip: true, cwd: 'dist', file: 'bundle.tgz' }, files);
  }

  private async executeUpload(url: string, accessToken: string, proxy?: string) {
    console.log(chalk.yellow(chalk.italic(`Uploading to ${url} ${proxy ? `through a proxy` : ``}...`)));

    const options = {
      url,
      headers: {
        Authorization: 'Bearer ' + accessToken
      },
      formData: {
        file: fs.createReadStream(getProjectDirectoryPath('bundle.tgz'))
      }
    };

    try {
      const response = await rp.post({ ...options, proxy });
      const responseJson = JSON.parse(response);
      if (responseJson.status === 'OK') {
        console.log(chalk.green('\u2713 Project successfully uploaded!'));
        return true;
      } else if (responseJson.status === 'ERROR') {
        console.log(chalk.red('ERROR: ' + responseJson.errorMessage));
        return false;
      }
    } catch (err) {
      const responseBody = err.response.toJSON().body;
      const errorJson = JSON.parse(responseBody);
      if (errorJson.errorMessage) {
        console.log(chalk.red('ERROR: ' + errorJson.errorMessage));
      } else {
        console.log(chalk.red('ERROR: ' + responseBody));
      }
      return false;
    }
  }
}
