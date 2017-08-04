# %readme_title%

%description%

## Table of Contents

- [Project setup](#project-setup)
- [Available scripts](#available-scripts)

## Project setup

This project was bootstrapped with [leanix-reporting-cli](https://github.com/leanix/leanix-reporting-cli).

1. `npm install -g @leanix/reporting-cli`
1. `npm install` in project directory
1. create a `lxr.json` file in project directory (please see [Getting started](https://github.com/leanix/leanix-reporting-cli#getting-started))

## Available scripts

In the project directory, one can run:

`npm start`

This command will start the local development server. Please make sure you have properly configured `lxr.json` first.
It will take the specified API Token from `lxr.json` and automatically do a login to the workspace.

`npm run upload`

Uploads the report to the workspace configured in `lxr.json`.
Please see [Uploading to LeanIX workspace](https://github.com/leanix/leanix-reporting-cli#uploading-to-leanix-workspace).
