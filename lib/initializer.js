"use strict";
exports.__esModule = true;
var chalk = require("chalk");
var Initializer = (function () {
    function Initializer() {
    }
    Initializer.prototype.init = function () {
        console.log(chalk.green('Initializing new project...'));
    };
    return Initializer;
}());
exports.Initializer = Initializer;
