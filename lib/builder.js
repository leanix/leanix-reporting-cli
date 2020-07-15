"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chalk = require("chalk");
var child_process_1 = require("child_process");
var path_helper_1 = require("./path-helper");
var path = require("path");
var rimraf = require("rimraf");
/**
 * Builds the project using webpack into 'dist' folder.
 */
var Builder = /** @class */ (function () {
    function Builder() {
        this.pathHelper = new path_helper_1.PathHelper();
        this.projectDir = new path_helper_1.PathHelper().getProjectDirectory();
    }
    Builder.prototype.build = function () {
        console.log(chalk.yellow(chalk.italic('Building...')));
        return this.buildWithWebpack();
    };
    Builder.prototype.buildWithWebpack = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            // remove dist folder
            rimraf(path.resolve(_this.projectDir, 'dist'), function () {
                var webpackCmd = path.resolve(_this.projectDir, 'node_modules/.bin/webpack');
                child_process_1.exec(webpackCmd, function (err, stdout) {
                    if (err) {
                        console.error(err);
                        reject(err);
                    }
                    else {
                        console.log(stdout);
                        console.log(chalk.green('\u2713 Project successfully build!'));
                        resolve();
                    }
                });
            });
        });
    };
    return Builder;
}());
exports.Builder = Builder;
