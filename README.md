# leanix-reporting-cli

Command line interface to initialise, develop and publish custom reports for LeanIX EAM Tool.

## Prerequisites
* Node.js >= 6.9 (check with `node -v`)
* npm >= 4 (check with `npm -v`)

## Getting started
Install the package globally via npm:
```
npm install -g @leanix/reporting-cli
````

Initialize a new project:
```
mkdir myreport
cd myreport
lxr init myreport
```

Configure your environment in `lxr.json`:
```
{
  "host": "https://app.leanix.net",
  "workspace": "myworkspace",
  "apitoken": "Jw8MfCqEXDDubry64H95SKYPjJTBKNFhkYD8kSCL"
}
```

Start developing:
```
npm start
```

### Security hint
When you run `npm start` a local webserver is hosted on localhost:8080
that allows connections via HTTPS. But since just a development SSL certificate is created
the browser might show a warning that the connection is not secure.

You could either allow connections to this host anyways, or create your own self-signed
certificate: https://www.tonyerwin.com/2014/09/generating-self-signed-ssl-certificates.html#MacKeyChainAccess

If you have created your certificate you can add the certificate and private key files to the
`lxr.json` configuration file of your generated project:

```
{
  "host": "https://app.leanix.net",
  "workspace": "myworkspace",
  "apitoken": "Jw8MfCqEXDDubry64H95SKYPjJTBKNFhkYD8kSCL",
  "ssl": {
    "cert": "/path/to/cert",
    "key": "/path/to/key"
  }
}
```

## Uploading to LeanIX workspace
In order to upload your report to a LeanIX workspace you can simply run the following command:

```
npm run upload
```

## Important files

### package.json
This file contains information about your project. When uploading the report into LeanIX some of the information is used when displaying your report to the user.

Example `package.json`:
```
{
  "name": "leanix-quality-chart-report",
  "version": "1.0.0",
  "author": "LeanIX GmbH",
  "description": "This report shows the overall quality of your Fact Sheets per Fact Sheet type",
  "leanixReport": {
    "id": "net.leanix.quality-chart",
    "title": "Quality Chart",
    "documentationLink": "https://dev.leanix.net/example-docs",
    "defaultConfig": {
      "factSheetTypes": ["Application"]
    }
  }
}
```

Description of the properties that we extract from `package.json` when uploading your report to LeanIX:
* `name`: Name for your report project
* `version`: Version of your report
* `author`: Creator of the report (optional)
* `description`: Description of your reports use case (optional)
* `leanixReport`: Additional properties used by LeanIX
  * `id`: Unique ID for your report, we encourage you to follow Java package naming convention to force uniqueness(https://docs.oracle.com/javase/tutorial/java/package/namingpkgs.html)
  * `title`: Title for your report that is displayed in the GUI (optional)
  * `documentationLink`: Link to a documentation of your report (optional)
  * `defaultConfig`: Default configuration object, that can be adapted by the user (optional if your report is not configurable)

### src/index.html
This file is initially loaded by the LeanIX reporting framework and is hence the starting point for the execution of your report within the users browser.

### src/index.js
This file is the starting point for bundling JavaScript into one file. You can use the `import` statement (https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Statements/import) in order to split up your project into multiple files. We use webpack 3.x under the hood to bundle your project.
