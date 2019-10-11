"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chalk = require("chalk");
var path = require("path");
var fs = require("fs");
var varReplace = require("variable-replacer");
var path_helper_1 = require("./path-helper");
var TemplateExtractor = /** @class */ (function () {
    function TemplateExtractor() {
        this.pathHelper = new path_helper_1.PathHelper();
    }
    TemplateExtractor.prototype.extractTemplateFiles = function (answers) {
        console.log(chalk.green('Extracting template files...'));
        var templateDir = this.pathHelper.getTemplateDirectory();
        this.extractTemplateDir(templateDir, answers);
    };
    TemplateExtractor.prototype.extractTemplateDir = function (templateDir, answers) {
        var _this = this;
        fs.readdirSync(templateDir)
            .forEach(function (file) {
            var filePath = path.resolve(templateDir, file);
            var isDir = fs.lstatSync(filePath).isDirectory();
            if (isDir) {
                _this.extractTemplateDir(filePath, answers);
            }
            else {
                _this.extractTemplateFile(filePath, answers);
            }
        });
    };
    TemplateExtractor.prototype.extractTemplateFile = function (source, answers) {
        var dest = source.replace(this.pathHelper.getTemplateDirectory(), this.pathHelper.getProjectDirectory());
        if (path.basename(source) === 'gitignore') {
            dest = path.resolve(this.pathHelper.getProjectDirectory(), '.gitignore');
        }
        console.log(source, dest);
        varReplace({
            source: source,
            dest: dest,
            inlineData: answers,
            logLevel: 'none' // info
        });
    };
    return TemplateExtractor;
}());
exports.TemplateExtractor = TemplateExtractor;
