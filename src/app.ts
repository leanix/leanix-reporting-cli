import * as chalk from 'chalk';
import * as program from 'commander';
import { Builder } from './builder';
import { DevStarter } from './dev-starter';
import { loadCliConfig, loadLxrConfig } from './file.helpers';
import { Initializer } from './initializer';
import { Uploader } from './uploader';
import { version } from './version';

program.version(version);

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
  .action(async () => {
    const cliConfig = loadCliConfig();
    const builder = new Builder(console);

    try {
      await builder.build(cliConfig.distPath, cliConfig.buildCommand);
    } catch (error) {
      console.error(chalk.red(error));
    }
  });

program
  .command('upload')
  .description('Bundles and uploads the report to the configured workspace')
  .action(async () => {
    const cliConfig = loadCliConfig();
    const lxrConfig = loadLxrConfig();
    const url = `https://${lxrConfig.host}/services/pathfinder/v1/reports/upload`;

    const builder = new Builder(console);
    const uploader = new Uploader();

    console.log(chalk.yellow(chalk.italic('Bundling and uploading your project...')));

    try {
      await builder.build(cliConfig.distPath, cliConfig.buildCommand);
      await uploader.upload(url, lxrConfig.apitoken, lxrConfig.host, lxrConfig.proxyURL);
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('store-upload <id> <apitoken>')
  .description('Bundles and uploads the report to the LeanIX Store')
  .option('--host <host>', 'Which store to use (default: store.leanix.net)')
  .option('--tokenhost <tokenhost>', 'Where to resolve the apitoken (default: app.leanix.net)')
  .action(async (id: string, apitoken: string, options: { host: string; tokenhost: string }) => {
    const cliConfig = loadCliConfig();

    const host = options.host || 'store.leanix.net';
    const tokenhost = options.tokenhost || 'app.leanix.net';
    const msg = `Bundling and uploading your project to the LeanIX Store (${host})...`;
    const url = `https://${host}/services/torg/v1/assetversions/${id}/payload`;

    const builder = new Builder(console);
    const uploader = new Uploader();

    console.log(chalk.yellow(chalk.italic(msg)));

    try {
      await builder.build(cliConfig.distPath, cliConfig.buildCommand);
      await uploader.upload(url, apitoken, tokenhost);
    } catch (error) {
      handleError(error);
    }
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
