"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chalk = require("chalk");
var process = require("process");
var inquirer = require("inquirer");
var _ = require("lodash");
var cross_spawn_1 = require("cross-spawn");
var template_extractor_1 = require("./template-extractor");
var Initializer = /** @class */ (function () {
    function Initializer() {
        this.extractor = new template_extractor_1.TemplateExtractor();
    }
    Initializer.prototype.init = function () {
        var _this = this;
        console.log(chalk.green('Initializing new project...'));
        return inquirer.prompt(this.getInquirerQuestions())
            .then(function (answers) {
            answers = _this.handleDefaultAnswers(answers);
            answers['node_version'] = process.versions.node;
            _this.extractor.extractTemplateFiles(answers);
            console.log(chalk.green('\u2713 Your project is ready!'));
            console.log(chalk.green('Please run `npm install` to install dependencies and then run `npm start` to start developing!'));
            // return this.installViaNpm();
        });
    };
    Initializer.prototype.getInquirerQuestions = function () {
        // The name properties correspond to the variables in the package.json template file
        return [
            {
                type: 'input',
                name: 'name',
                message: 'Name of your project for package.json'
            },
            {
                type: 'input',
                name: 'id',
                message: 'Unique id for this report in Java package notation (e.g. net.leanix.barcharts)'
            },
            {
                type: 'input',
                name: 'author',
                message: 'Who is the author of this report (e.g. LeanIX GmbH <support@leanix.net>)'
            },
            {
                type: 'input',
                name: 'title',
                message: 'A title to be shown in LeanIX when report is installed'
            },
            {
                type: 'input',
                name: 'description',
                message: 'Description of your project'
            },
            {
                type: 'input',
                name: 'licence',
                message: 'Which licence do you want to use for this project? (Default: UNLICENSED)'
            },
            {
                type: 'input',
                name: 'host',
                message: 'Which host do you want to work with? (Default: app.leanix.net)'
            },
            {
                type: 'input',
                name: 'workspace',
                message: 'Which is the workspace you want to test your report in?'
            },
            {
                type: 'input',
                name: 'apitoken',
                message: 'API-Token for Authentication (see: https://dev.leanix.net/docs/authentication#section-generate-api-tokens)'
            },
            {
                type: 'confirm',
                name: 'behindProxy',
                message: 'Are you behind a proxy?',
                default: false
            },
            {
                when: function (answers) { return answers.behindProxy; },
                type: 'input',
                name: 'proxyURL',
                message: 'Proxy URL?'
            }
        ];
    };
    Initializer.prototype.handleDefaultAnswers = function (answers) {
        answers = _.mapValues(answers, function (val) { return val === '' ? undefined : val; });
        return _.defaults(answers, {
            licence: 'UNLICENSED',
            host: 'app.leanix.net',
            apitoken: '',
            workspace: '',
            proxyURL: '',
            'readme_title': answers.title || answers.name
        });
    };
    Initializer.prototype.installViaNpm = function () {
        return new Promise(function (resolve, reject) {
            console.log(chalk.green('Installing project dependencies via npm...'));
            var installProc = cross_spawn_1.spawn('npm', ['install']);
            /*
                  installProc.stdout.on('data', (data) => {
                    console.log(chalk.yellow(data.toString()));
                  });
            */
            installProc.on('close', function (exitCode) {
                if (exitCode === 0) {
                    console.log(chalk.green('npm install successful!'));
                    resolve();
                }
                else {
                    console.log(chalk.red('npm install failed!'));
                    reject();
                }
            });
        });
    };
    return Initializer;
}());
exports.Initializer = Initializer;
