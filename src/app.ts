import * as program from 'commander';
import { Initializer } from './initializer';
import { DevStarter } from './dev-starter';
import { Uploader } from './uploader';
import * as chalk from 'chalk';

const pkg = require('../package.json');

program
  .version(pkg.version);

program
  .command('init')
  .description('Initializes a new project')
  .action(() => {
    new Initializer().init();
  });


program
  .command('start')
  .description('Start developing and testing your report')
  .action(() => {
    new DevStarter().start();
  });


program
  .command('upload')
  .description('Upload your report')
  .action(() => {
    new Uploader().upload().catch(err => {
      console.error(chalk.red(err));
    });
  });

program.parse(process.argv);

// no commands specified
if (process.argv.length === 2) {
  console.log(chalk.cyan('  LeanIX Reporting CLI'));
  console.log(chalk.cyan('  ===================='));
  console.log('');
  console.log(chalk.cyan('  version: ' + pkg.version));
  console.log(chalk.cyan('  github: https://github.com/leanix/leanix-reporting-cli'));
  console.log('');
  program.outputHelp();
}
