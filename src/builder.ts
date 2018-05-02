import * as chalk from 'chalk';
import { exec, execSync } from 'child_process';
import { PathHelper } from './path-helper';
import * as path from 'path';
import * as fs from 'fs';
import * as tar from 'tar';
import * as rp from 'request-promise-native';
import * as rimraf from 'rimraf';
import { ApiTokenResolver } from './api-token-resolver';

/**
 * Builds the project using webpack into 'dist' folder.
 */
export class Builder {

  private pathHelper = new PathHelper();
  private projectDir = new PathHelper().getProjectDirectory();

  public build() {
    console.log(chalk.yellow(chalk.italic('Building...')));
    return this.buildWithWebpack();
  }

  private buildWithWebpack() {
    return new Promise((resolve, reject) => {
      // remove dist folder
      rimraf(path.resolve(this.projectDir, 'dist'), () => {
        const webpackCmd = path.resolve(this.projectDir, 'node_modules/.bin/webpack');
        exec(webpackCmd, (err, stdout) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            console.log(stdout);
            console.log(chalk.green('\u2713 Project successfully build!'));
            resolve();
          }
        });
      })
    });
  }

}
