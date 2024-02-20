import chalk from 'chalk';
import * as rp from 'request-promise-native';
import * as fs from 'fs';
import { ApiTokenResolver } from './api-token-resolver';
import { getProjectDirectoryPath } from './path.helpers';

export class Uploader {
  public async upload(url: string, apitoken: string, tokenhost: string, proxy?: string): Promise<boolean> {
    const accessToken = await ApiTokenResolver.getAccessToken(`https://${tokenhost}`, apitoken, proxy);
    return await this.executeUpload(url, accessToken, proxy);
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
