"use strict";
exports.__esModule = true;
var chalk = require("chalk");
var Uploader = (function () {
    function Uploader() {
    }
    Uploader.prototype.upload = function () {
        console.log(chalk.green('Uploading your project bundle...'));
    };
    return Uploader;
}());
exports.Uploader = Uploader;
