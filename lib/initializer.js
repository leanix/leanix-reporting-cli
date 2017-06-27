"use strict";
exports.__esModule = true;
var chalk = require("chalk");
var vr = require("variable-replacer");
var path_helper_1 = require("./path-helper");
var Initializer = (function () {
    function Initializer() {
        this.pathHelper = new path_helper_1.PathHelper();
    }
    Initializer.prototype.init = function () {
        console.log(chalk.green('Initializing new project...'));
        this.extractTemplateFile('package.json');
    };
    Initializer.prototype.extractTemplateFile = function (filename) {
        var source = this.pathHelper.getTemplateSourcePath(filename);
        var dest = this.pathHelper.getTargetFolderPath(filename);
        console.log(source, dest);
        vr({
            source: source,
            dest: dest,
            inlineData: {
                name: 'A_NAME'
            },
            logLevel: 'info' // none
        });
    };
    return Initializer;
}());
exports.Initializer = Initializer;
