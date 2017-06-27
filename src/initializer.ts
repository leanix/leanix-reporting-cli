import * as chalk from 'chalk';
import * as path from 'path';
import * as process from 'process';
import * as inquirer from 'inquirer';
import { spawn } from 'child_process';
import { TemplateExtractor } from './template-extractor';

export class Initializer {

  private extractor = new TemplateExtractor();

  public init(): Promise<any> {
    console.log(chalk.green('Initializing new project...'));

    return inquirer.prompt(this.getInquirerQuestions())
    .then(answers => {
      this.extractor.extractTemplateFiles(answers);
      return this.installViaNpm();
    });

  }

  private getInquirerQuestions(): inquirer.Questions {
    // The name properties correspond to the variables in the package.json template file
    return [
      {
        type: 'input',
        name: 'name',
        message: 'Name of your project for package.json'
      },
      {
        type: 'input',
        name: 'id',
        message: 'Unique id for this report in Java package notation (e.g. net.leanix.barcharts)'
      },
      {
        type: 'input',
        name: 'author',
        message: 'Who is the author of this report (e.g. LeanIX GmbH)'
      },
      {
        type: 'input',
        name: 'title',
        message: 'A title to be shown in LeanIX when report is installed'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description of your project'
      }
    ];
  }

  private installViaNpm(): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log(chalk.green('Installing project dependencies via npm...'));
      const installProc = spawn('npm', ['install']);
/*
      installProc.stdout.on('data', (data) => {
        console.log(chalk.yellow(data.toString()));
      });
*/
      installProc.on('close', (exitCode) => {
        if (exitCode === 0) {
          console.log(chalk.green('npm install successful!'));
          resolve();
        } else {
          console.log(chalk.red('npm install failed!'));
          reject();
        }
      });
    });
  }
}
