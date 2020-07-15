"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk = require("chalk");
var path_helper_1 = require("./path-helper");
var path = require("path");
var fs = require("fs");
var tar = require("tar");
var rp = require("request-promise-native");
var api_token_resolver_1 = require("./api-token-resolver");
var builder_1 = require("./builder");
/**
 * Builds and uploads the project.
 */
var Uploader = /** @class */ (function () {
    function Uploader() {
        this.pathHelper = new path_helper_1.PathHelper();
        this.projectDir = new path_helper_1.PathHelper().getProjectDirectory();
        this.builder = new builder_1.Builder();
    }
    Uploader.prototype.upload = function (url, apitoken, tokenhost, proxy) {
        var _this = this;
        return this.builder.build()
            .then(function () { return _this.writeMetadataFile(); })
            .then(function () { return _this.createTarFromSrcFolderAndAddToDist(); })
            .then(function () { return _this.createTarFromDistFolder(); })
            .then(function () { return api_token_resolver_1.ApiTokenResolver.getAccessToken("https://" + tokenhost, apitoken, proxy); })
            .then(function (accessToken) { return _this.executeUpload(url, accessToken, proxy); });
    };
    Uploader.prototype.writeMetadataFile = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var packageJson = require(path.resolve(_this.projectDir, 'package.json'));
            var metadataFile = path.resolve(_this.projectDir, 'dist/lxreport.json');
            var metadata = Object.assign({}, {
                name: packageJson.name,
                version: packageJson.version,
                author: packageJson.author,
                description: packageJson.description,
                documentationLink: packageJson.documentationLink
            }, packageJson.leanixReport);
            fs.writeFile(metadataFile, JSON.stringify(metadata), function (err) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    resolve(metadataFile);
                }
            });
        });
    };
    Uploader.prototype.createTarFromSrcFolderAndAddToDist = function () {
        var files = fs.readdirSync(path.resolve(this.projectDir, 'src'));
        return tar.c({ gzip: true, cwd: 'src', file: 'dist/src.tgz' }, files);
    };
    Uploader.prototype.createTarFromDistFolder = function () {
        var files = fs.readdirSync(path.resolve(this.projectDir, 'dist'));
        return tar.c({ gzip: true, cwd: 'dist', file: 'bundle.tgz' }, files);
    };
    Uploader.prototype.executeUpload = function (url, accessToken, proxy) {
        console.log(chalk.yellow(chalk.italic("Uploading to " + url + " " + (proxy ? "through a proxy" : "") + "...")));
        var options = {
            url: url,
            headers: {
                'Authorization': 'Bearer ' + accessToken
            },
            formData: {
                file: fs.createReadStream(path.resolve(this.projectDir, 'bundle.tgz'))
            }
        };
        return rp.post(__assign({}, options, { proxy: proxy }))
            .then(function (response) {
            var responseJson = JSON.parse(response);
            if (responseJson.status === 'OK') {
                console.log(chalk.green('\u2713 Project successfully uploaded!'));
                return true;
            }
            else if (responseJson.status === 'ERROR') {
                console.log(chalk.red('ERROR: ' + responseJson.errorMessage));
                return false;
            }
        }).catch(function (err) {
            var responseBody = err.response.toJSON().body;
            var errorJson = JSON.parse(responseBody);
            if (errorJson.errorMessage) {
                console.log(chalk.red('ERROR: ' + errorJson.errorMessage));
            }
            else {
                console.log(chalk.red('ERROR: ' + responseBody));
            }
            return false;
        });
    };
    return Uploader;
}());
exports.Uploader = Uploader;
