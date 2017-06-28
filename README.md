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
This file contains information about your project. Most importantly a name and a version.

There is a section "leanixReport" where you can add additional information for your report.
There must be a "id" field in that section which is used to uniquely identify the report among all reports that are developed for LeanIX.

```
{
  "name": "my-report",
  "version": "1.0.0",
  "leanixReport": {
    "id": "net.leanix.quality-chart"
  }
}
```

### src/index.html
This file is initially loaded by the LeanIX reporting framework and is hence the starting point for the execution of your report within the users browser.

### src/index.js
This file is the starting point for bundling JavaScript into one file. You can use the `import` statement (https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Statements/import) in order to split up your project into multiple files. We use webpack 3.x under the hood to bundle your project.
