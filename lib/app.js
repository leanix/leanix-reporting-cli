"use strict";
exports.__esModule = true;
var program = require("commander");
var initializer_1 = require("./initializer");
var dev_starter_1 = require("./dev-starter");
var uploader_1 = require("./uploader");
var pkg = require('../package.json');
program
    .version(pkg.version);
program
    .command('init')
    .description('Initializes a new project')
    .action(function () {
    new initializer_1.Initializer().init();
});
program
    .command('start')
    .description('Start developing and testing your report')
    .action(function () {
    new dev_starter_1.DevStarter().start();
});
program
    .command('upload')
    .description('Upload your report')
    .action(function () {
    new uploader_1.Uploader().upload();
});
program.parse(process.argv);
