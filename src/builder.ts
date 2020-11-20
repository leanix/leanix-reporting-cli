import * as chalk from 'chalk';
import { exec } from 'child_process';
import { loadPackageJson } from './file.helpers';
import * as rimraf from 'rimraf';
import { promisify } from 'util';
import { PackageJson } from './interfaces';

export class Builder {

  public static create(): Builder {
    return new Builder(loadPackageJson, promisify(rimraf), promisify(exec), console);
  }

  constructor (
    private loadPackageJson: () => PackageJson,
    private rimraf: (path: string) => Promise<void>,
    private exec: (command: string) => Promise<{ stdout: string, stderr: string }>,
    private console: { log(string: string): void, error(string: string): void }
  ) {}

  public async build(): Promise<void> {
    this.console.log(chalk.yellow(chalk.italic('Building...')));

    const buildConfig = this.getBuildConfig();

    try {
      await this.rimraf(buildConfig.distPath);
      const { stdout } = await this.exec(buildConfig.buildCommand);

      this.console.log(stdout);
      this.console.log(chalk.green('\u2713 Project successfully build!'));
    } catch (error) {
      this.console.error(error);
    }
  }

  private getBuildConfig() {
    const packageJson = this.loadPackageJson();
    const leanixReportingCli = packageJson.leanixReportingCli || {};

    return {
      distPath: leanixReportingCli.distPath ?? './dist',
      buildCommand: leanixReportingCli.buildCommand ?? './node_modules/.bin/webpack'
    }
  }
}
