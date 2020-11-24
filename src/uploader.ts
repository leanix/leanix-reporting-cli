import * as chalk from 'chalk';
import * as rp from 'request-promise-native';
import * as tar from 'tar';
import * as fs from 'fs';
import { join } from 'path';
import { ApiTokenResolver } from './api-token-resolver';
import { writeFileAsync } from './async.helpers';
import { loadPackageJson } from './file.helpers';
import { getProjectDirectoryPath } from './path.helpers';

/**
 * Builds and uploads the project.
 */
export class Uploader {
  public async upload(
    srcPath: string,
    distPath: string,
    url: string,
    apitoken: string,
    tokenhost: string,
    proxy?: string
  ): Promise<boolean> {
    await this.writeMetadataFile(distPath);
    await this.createTarFromSrcFolderAndAddToDist(srcPath, distPath);
    await this.createTarFromDistFolder(distPath);
    const accessToken = await ApiTokenResolver.getAccessToken(`https://${tokenhost}`, apitoken, proxy);
    return await this.executeUpload(url, accessToken, proxy);
  }

  private writeMetadataFile(distPath: string) {
    const packageJson = loadPackageJson();
    const metadataFile = join(distPath, 'lxreport.json');

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

    return writeFileAsync(metadataFile, JSON.stringify(metadata));
  }

  private createTarFromSrcFolderAndAddToDist(srcPath: string, distPath: string) {
    const files = fs.readdirSync(srcPath);
    return tar.c({ gzip: true, cwd: srcPath, file: join(distPath, 'src.tgz') }, files);
  }

  private createTarFromDistFolder(distPath: string) {
    const files = fs.readdirSync(distPath);
    return tar.c({ gzip: true, cwd: distPath, file: 'bundle.tgz' }, files);
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
