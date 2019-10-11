"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var program = require("commander");
var chalk = require("chalk");
var initializer_1 = require("./initializer");
var dev_starter_1 = require("./dev-starter");
var uploader_1 = require("./uploader");
var builder_1 = require("./builder");
var path_helper_1 = require("./path-helper");
var pkg = require('../package.json');
program
    .version(pkg.version);
program
    .command('init')
    .description('Initializes a new project')
    .action(function () {
    new initializer_1.Initializer().init().catch(handleError);
});
program
    .command('start')
    .description('Start developing and testing your report')
    .action(function () {
    new dev_starter_1.DevStarter().start().catch(handleError);
});
program
    .command('build')
    .description('Builds the report into a folder named "dist"')
    .action(function () {
    new builder_1.Builder().build().catch(function (err) {
        console.error(chalk.red(err));
    });
});
program
    .command('upload')
    .description('Bundles and uploads the report to the configured workspace')
    .action(function () {
    console.log(chalk.yellow(chalk.italic('Bundling and uploading your project...')));
    var lxrConfig = require(new path_helper_1.PathHelper().getLxrConfigPath());
    var url = "https://" + lxrConfig.host + "/services/pathfinder/v1/reports/upload";
    new uploader_1.Uploader()
        .upload(url, lxrConfig.apitoken, lxrConfig.host, lxrConfig.proxyUrl)
        .catch(handleError);
});
program
    .command('store-upload <id> <apitoken>')
    .description('Bundles and uploads the report to the LeanIX Store')
    .option('--host <host>', 'Which store to use (default: store.leanix.net)')
    .option('--tokenhost <tokenhost>', 'Where to resolve the apitoken (default: app.leanix.net)')
    .action(function (id, apitoken, options) {
    var host = options.host || 'store.leanix.net';
    var tokenhost = options.tokenhost || 'app.leanix.net';
    var msg = "Bundling and uploading your project to the LeanIX Store (" + host + ")...";
    console.log(chalk.yellow(chalk.italic(msg)));
    var url = "https://" + host + "/services/torg/v1/assetversions/" + id + "/payload";
    new uploader_1.Uploader()
        .upload(url, apitoken, tokenhost)
        .catch(handleError);
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
function handleError(err) {
    console.error(chalk.red(err.message));
}
