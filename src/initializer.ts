import * as chalk from 'chalk';
import * as vr from 'variable-replacer';
import * as path from 'path';
import * as process from 'process';
import { PathHelper } from "./path-helper";

export class Initializer {
  private pathHelper = new PathHelper();

  public init() {
    console.log(chalk.green('Initializing new project...'));
    this.extractTemplateFile('package.json');
  }

  private extractTemplateFile(filename: string) {
    const source = this.pathHelper.getTemplateSourcePath(filename);
    const dest = this.pathHelper.getTargetFolderPath(filename);
    console.log(source, dest);
    vr({
      source,
      dest,
      inlineData: {
        name: 'A_NAME'
      },
      logLevel: 'info' // none
    });
  }
}
