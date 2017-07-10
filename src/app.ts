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
