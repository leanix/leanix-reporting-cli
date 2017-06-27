# leanix-reporting-cli

Command line interface to initialise, develop and publish custom reports for LeanIX EAM Tool.

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
`lxr.json` configuration file of your generated project.
