# leanix-reporting-cli
[![npm version](https://badge.fury.io/js/%40leanix%2Freporting-cli.svg)](https://badge.fury.io/js/%40leanix%2Freporting-cli)

Command line interface to initialise, develop and publish custom reports for LeanIX EAM Tool.
Please also have a look at the corresponding reporting library: https://github.com/leanix/leanix-reporting

## Documentation
For information on how to create a custom report, please refer to our [documentation](http://dev.leanix.net/docs/how-to-build-custom-reports).

# For reporting-cli developers

## Publish new version
* Create new release by following git-flow
  * Create release branch
  * Bump version in `package.json` (decide whether patch, minor, major update)
  * Merge release branch to develop & master
* Make sure you have logged in to publish to npm registry in scope `@leanix` (`npm login` - see: https://docs.npmjs.com/cli/adduser)
* Execute `npm publish --access public` on the master branch
