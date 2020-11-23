import * as chalk from 'chalk';
import { exec } from 'child_process';
import { loadCliConfig } from './file.helpers';
import * as rimraf from 'rimraf';
import { promisify } from 'util';
import { CliConfig } from './interfaces';

export class Builder {

  public static create(): Builder {
    return new Builder(loadCliConfig(), promisify(rimraf), promisify(exec), console);
  }

  constructor (
    private cliConfig: CliConfig,
    private rimraf: (path: string) => Promise<void>,
    private exec: (command: string) => Promise<{ stdout: string, stderr: string }>,
    private console: { log(string: string): void, error(string: string): void }
  ) {}

  public async build(): Promise<void> {
    this.console.log(chalk.yellow(chalk.italic('Building...')));

    try {
      await this.rimraf(this.cliConfig.distPath);
      const { stdout } = await this.exec(this.cliConfig.buildCommand);

      this.console.log(stdout);
      this.console.log(chalk.green('\u2713 Project successfully build!'));
    } catch (error) {
      this.console.error(error);
    }
  }
}
