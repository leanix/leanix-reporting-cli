import * as chalk from 'chalk';
import { exec } from 'child_process';
import { PathHelper } from './path-helper';
import * as path from 'path';
import * as rimraf from 'rimraf';
import { promisify } from 'util';

const execAsync = promisify(exec);
const rimrafAsync = promisify(rimraf);

/**
 * Builds the project using webpack into 'dist' folder.
 */
export class Builder {

  private projectDir = new PathHelper().getProjectDirectory();

  public async build(): Promise<void> {
    console.log(chalk.yellow(chalk.italic('Building...')));

    try {
      await this.removeDistDir();
      const { stdout } = await this.buildWithWebpack();

      console.log(stdout);
      console.log(chalk.green('\u2713 Project successfully build!'));
    } catch (error) {
      console.error(error);
    }
  }

  private removeDistDir() {
    const distDir = path.resolve(this.projectDir, 'dist');
    return rimrafAsync(distDir);
  }

  private buildWithWebpack() {
    const webpackCmd = path.resolve(this.projectDir, 'node_modules/.bin/webpack');
    return execAsync(webpackCmd);
  }
}
