"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var PathHelper = /** @class */ (function () {
    function PathHelper() {
    }
    PathHelper.prototype.getSourceDirectory = function () {
        return path.resolve(__dirname, '..');
    };
    PathHelper.prototype.getProjectDirectory = function () {
        return process.cwd();
    };
    PathHelper.prototype.getLxrConfigPath = function () {
        return path.resolve(this.getProjectDirectory(), 'lxr.json');
    };
    PathHelper.prototype.getTemplateDirectory = function () {
        return path.resolve(__dirname, '../template');
    };
    PathHelper.prototype.getTemplateSourcePath = function (templateFileName) {
        var sourceDir = this.getSourceDirectory();
        return path.resolve(sourceDir, 'template', templateFileName);
    };
    PathHelper.prototype.getTargetFolderPath = function (filename) {
        var targetDir = this.getProjectDirectory();
        return path.resolve(targetDir, filename);
    };
    return PathHelper;
}());
exports.PathHelper = PathHelper;
