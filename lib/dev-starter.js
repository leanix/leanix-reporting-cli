"use strict";
exports.__esModule = true;
var chalk = require("chalk");
var DevStarter = (function () {
    function DevStarter() {
    }
    DevStarter.prototype.start = function () {
        console.log(chalk.green('Starting development server...'));
    };
    return DevStarter;
}());
exports.DevStarter = DevStarter;
