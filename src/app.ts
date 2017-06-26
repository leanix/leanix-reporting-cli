import * as program from 'commander';
const pkg = require('../package.json');

console.log(`This is @leanix/reporting-cli ${pkg.version}`);

program
  .version(pkg.version)
  .command('init')
  .description('initialize new project')
  .action(() => {
    console.log('Initializing...');
  });

program.parse(process.argv);