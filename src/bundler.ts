import * as fs from 'node:fs'
import { join } from 'node:path'
import * as tar from 'tar'
import { writeFileAsync } from './async.helpers'
import { loadPackageJson } from './file.helpers'

export class Bundler {
  public async bundle(distPath: string): Promise<void> {
    await this.writeMetadataFile(distPath)
    await this.createTarFromDistFolder(distPath)
  }

  private writeMetadataFile(distPath: string) {
    const packageJson = loadPackageJson()
    const metadataFile = join(distPath, 'lxreport.json')

    const metadata = Object.assign(
      {},
      {
        name: packageJson.name,
        version: packageJson.version,
        author: this.getReportAuthor(packageJson.author),
        description: packageJson.description,
        documentationLink: packageJson.documentationLink
      },
      packageJson.leanixReport
    )

    return writeFileAsync(metadataFile, JSON.stringify(metadata))
  }

  private getReportAuthor(author: string | { name: string, email: string }): string {
    if (typeof author === 'string') {
      return author.replace('<', '(').replace('>', ')')
    }
    else {
      return `${author.name} (${author.email})`
    }
  }

  private createTarFromDistFolder(distPath: string) {
    const files = fs.readdirSync(distPath)
    return tar.c({ gzip: true, cwd: distPath, file: 'bundle.tgz' }, files)
  }
}
