import * as program from 'commander';
import * as chalk from 'chalk';
import { Initializer } from './initializer';
import { DevStarter } from './dev-starter';
import { Uploader } from './uploader';
import { Builder } from './builder';
import { loadCliConfig, loadLxrConfig } from './file.helpers';
import { version } from './version';

program
  .version(version);

program
  .command('init')
  .description('Initializes a new project')
  .action(() => {
    new Initializer().init().catch(handleError);
  });


program
  .command('start')
  .description('Start developing and testing your report')
  .action(() => {
    new DevStarter().start().catch(handleError);
  });


program
  .command('build')
  .description('Builds the report into a folder named "dist"')
  .action(() => {
    const cliConfig = loadCliConfig();
    new Builder(console).build(cliConfig.distPath, cliConfig.buildCommand).catch(err => {
      console.error(chalk.red(err));
    });
  });


program
  .command('upload')
  .description('Bundles and uploads the report to the configured workspace')
  .action(() => {
    console.log(chalk.yellow(chalk.italic('Bundling and uploading your project...')));
    const cliConfig = loadCliConfig();
    const lxrConfig = loadLxrConfig();
    const url = `https://${lxrConfig.host}/services/pathfinder/v1/reports/upload`;
    new Builder(console).build(cliConfig.distPath, cliConfig.buildCommand)
      .then(() => new Uploader().upload(url, lxrConfig.apitoken, lxrConfig.host, lxrConfig.proxyURL))
      .catch(handleError);
  });


program
  .command('store-upload <id> <apitoken>')
  .description('Bundles and uploads the report to the LeanIX Store')
  .option('--host <host>', 'Which store to use (default: store.leanix.net)')
  .option('--tokenhost <tokenhost>', 'Where to resolve the apitoken (default: app.leanix.net)')
  .action((id: string, apitoken: string, options: { host: string, tokenhost: string }) => {
    const cliConfig = loadCliConfig();

    const host = options.host || 'store.leanix.net';
    const tokenhost = options.tokenhost || 'app.leanix.net';
    const msg = `Bundling and uploading your project to the LeanIX Store (${host})...`;
    console.log(chalk.yellow(chalk.italic(msg)));

    const url = `https://${host}/services/torg/v1/assetversions/${id}/payload`;
    new Builder(console).build(cliConfig.distPath, cliConfig.buildCommand)
      .then(() => new Uploader().upload(url, apitoken, tokenhost))
      .catch(handleError);
  });

program.parse(process.argv);

// no commands specified
if (process.argv.length === 2) {
  console.log(chalk.cyan('  LeanIX Reporting CLI'));
  console.log(chalk.cyan('  ===================='));
  console.log('');
  console.log(chalk.cyan('  version: ' + version));
  console.log(chalk.cyan('  github: https://github.com/leanix/leanix-reporting-cli'));
  console.log('');
  program.outputHelp();
}

function handleError(err: Error) {
  console.error(chalk.red(err.message));
}
