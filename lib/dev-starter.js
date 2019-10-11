"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chalk = require("chalk");
var opn = require("opn");
var jwtDecode = require("jwt-decode");
var _ = require("lodash");
var cross_spawn_1 = require("cross-spawn");
var path_helper_1 = require("./path-helper");
var api_token_resolver_1 = require("./api-token-resolver");
var DevStarter = /** @class */ (function () {
    function DevStarter() {
        this.pathHelper = new path_helper_1.PathHelper();
    }
    DevStarter.prototype.start = function () {
        var _this = this;
        var config = require(this.pathHelper.getLxrConfigPath());
        return this.getAccessToken(config)
            .then(function (accessToken) { return _this.startLocalServer(config, accessToken); })
            .then(function (result) {
            if (result) {
                _this.openUrlInBrowser(result.launchUrl);
                console.log(chalk.green("Open the following url to test your report:\n" + result.launchUrl) + '\n');
                console.log(chalk.yellow("If your report is not being loaded, please check if it opens outside of LeanIX via this url:\n" + result.localhostUrl));
            }
        });
    };
    DevStarter.prototype.startLocalServer = function (config, accessToken) {
        var port = config.localPort || 8080;
        var localhostUrl = config.hostUrl || "https://localhost:" + port;
        var urlEncoded = encodeURIComponent(localhostUrl);
        var host = 'https://' + config.host;
        var accessTokenHash = accessToken ? "#access_token=" + accessToken : '';
        var workspace = accessToken ? this.getWorkspaceFromAccesToken(accessToken) : config.workspace;
        if (_.isEmpty(workspace)) {
            console.error(chalk.red('Workspace not specified. The local server can\'t be started.'));
            return new Promise(null);
        }
        console.log(chalk.green("Your workspace is " + workspace));
        var baseLaunchUrl = host + "/" + workspace + "/reporting/dev?url=" + urlEncoded;
        var launchUrl = baseLaunchUrl + accessTokenHash;
        console.log(chalk.green('Starting development server and launching with url: ' + baseLaunchUrl));
        var args = ['--https', '--port', '' + port];
        if (config.ssl && config.ssl.cert && config.ssl.key) {
            args.push('--cert=' + config.ssl.cert);
            args.push('--key=' + config.ssl.key);
        }
        console.log('' + args.join(' '));
        var serverProcess = cross_spawn_1.spawn('node_modules/.bin/webpack-dev-server', args, { shell: true });
        serverProcess.stdout.on('data', function (data) {
            console.log(data.toString());
        });
        // output errors from webpack
        serverProcess.stderr.on('data', function (data) {
            console.error(chalk.red(data.toString()));
        });
        return new Promise(function (resolve) {
            var projectRunning = false;
            serverProcess.on('error', function (err) {
                console.error(err);
            });
            serverProcess.stdout.on('data', function (data) {
                var output = data.toString();
                if (output.indexOf('Project is running') >= 0) {
                    projectRunning = true;
                }
                if (projectRunning && output.indexOf('Compiled successfully') >= 0) {
                    resolve({ launchUrl: launchUrl, localhostUrl: localhostUrl });
                }
            });
        });
    };
    DevStarter.prototype.getWorkspaceFromAccesToken = function (accessToken) {
        var claims = jwtDecode(accessToken);
        return claims.principal.permission.workspaceName;
    };
    DevStarter.prototype.getAccessToken = function (config) {
        if (!_.isEmpty(config.apitoken)) {
            return api_token_resolver_1.ApiTokenResolver.getAccessToken('https://' + config.host, config.apitoken, config.proxyURL);
        }
        else {
            return Promise.resolve(null);
        }
    };
    DevStarter.prototype.openUrlInBrowser = function (url) {
        try {
            opn(url);
        }
        catch (err) {
            console.error('Unable to open your browser: ' + err);
        }
    };
    return DevStarter;
}());
exports.DevStarter = DevStarter;
