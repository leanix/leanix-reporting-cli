"use strict";
exports.__esModule = true;
var path = require("path");
var PathHelper = (function () {
    function PathHelper() {
    }
    PathHelper.prototype.getSourceDirectory = function () {
        return path.resolve(__dirname, '..');
    };
    PathHelper.prototype.getTargetDirectory = function () {
        return process.cwd();
    };
    PathHelper.prototype.getTemplateSourcePath = function (templateFileName) {
        var sourceDir = this.getSourceDirectory();
        return path.resolve(sourceDir, 'template', templateFileName);
    };
    PathHelper.prototype.getTargetFolderPath = function (filename) {
        var targetDir = this.getTargetDirectory();
        return path.resolve(targetDir, filename);
    };
    return PathHelper;
}());
exports.PathHelper = PathHelper;
