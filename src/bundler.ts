import * as tar from 'tar';
import * as fs from 'fs';
import { join } from 'path';
import { writeFileAsync } from './async.helpers';
import { loadPackageJson } from './file.helpers';

export class Bundler {
  public async bundle(srcPath: string, distPath: string): Promise<void> {
    await this.writeMetadataFile(distPath);
    await this.createTarFromSrcFolderAndAddToDist(srcPath, distPath);
    await this.createTarFromDistFolder(distPath);
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
}
