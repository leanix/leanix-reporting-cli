import * as chalk from 'chalk';
import { exec } from 'child_process';
import { PathHelper } from './path-helper';
import * as path from 'path';
import * as rimraf from 'rimraf';
import { promisify } from 'util';

const execAsync = promisify(exec);
const rimrafAsync = promisify(rimraf);

export class Builder {

  private projectDir = new PathHelper().getProjectDirectory();

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
    const packageJson = require(path.resolve(this.projectDir, 'package.json')); // eslint-disable-line @typescript-eslint/no-var-requires
    const leanixReportingCli = packageJson.leanixReportingCli || {};

    return {
      distPath: leanixReportingCli.distPath ?? './dist',
      buildCommand: leanixReportingCli.buildCommand ?? 'node_modules/.bin/webpack'
    }
  }

  private removeDistDir(distPath: string) {
    const distDir = path.resolve(this.projectDir, distPath);
    return rimrafAsync(distDir);
  }

  private doBuild(buildCommand: string) {
    const webpackCmd = path.resolve(this.projectDir, buildCommand);
    return execAsync(webpackCmd);
  }
}
