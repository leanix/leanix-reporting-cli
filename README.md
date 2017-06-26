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

