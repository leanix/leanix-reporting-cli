import * as chalk from 'chalk';
import { exec } from 'child_process';
import { getProjectDirectoryPath } from './path.helpers';
import { loadPackageJson } from './file.helpers';
import * as rimraf from 'rimraf';
import { promisify } from 'util';

const execAsync = promisify(exec);
const rimrafAsync = promisify(rimraf);

export class Builder {

  public async build(): Promise<void> {
    console.log(chalk.yellow(chalk.italic('Building...')));

    const buildConfig = this.getBuildConfig();

    try {
      await this.removeDistDir(buildConfig.distPath);
      const { stdout } = await this.doBuild(buildConfig.buildCommand);

      console.log(stdout);
      console.log(chalk.green('\u2713 Project successfully build!'));
    } catch (error) {
      console.error(error);
    }
  }

  private getBuildConfig() {
    const packageJson = loadPackageJson();
    const leanixReportingCli = packageJson.leanixReportingCli || {};

    return {
      distPath: leanixReportingCli.distPath ?? './dist',
      buildCommand: leanixReportingCli.buildCommand ?? 'node_modules/.bin/webpack'
    }
  }

  private removeDistDir(distPath: string) {
    const distDir = getProjectDirectoryPath(distPath);
    return rimrafAsync(distDir);
  }

  private doBuild(buildCommand: string) {
    const webpackCmd = getProjectDirectoryPath(buildCommand);
    return execAsync(webpackCmd);
  }
}
