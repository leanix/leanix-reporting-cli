import { AxiosError } from 'axios'
import chalk from 'chalk'
import { Command } from 'commander'
import { Builder } from './builder'
import { Bundler } from './bundler'
import { DevStarter } from './dev-starter'
import { loadCliConfig, loadLxrConfig } from './file.helpers'
import { Initializer } from './initializer'
import { Uploader } from './uploader'
import { version } from './version'

const program = new Command()

program.version(version)

program
  .command('init')
  .description('Initializes a new project')
  .action(() => {
    new Initializer().init().catch(handleError)
  })

program
  .command('start')
  .description('Start developing and testing your report')
  .action(() => {
    new DevStarter().start().catch(handleError)
  })

program
  .command('build')
  .description(`Builds the report`)
  .on('--help', () => {
    console.log(`
By default, the report will be built by running "node_modules/.bin/webpack".
Before the build, the dist folder ("dist" by default) will be deleted to
ensure a clean build.

These defaults can be changed by setting "distPath" and "buildCommand" in the
"leanixReportingCli" section of package.json:

{
  "leanixReportingCli": {
    "distPath": "output",
    "buildCommand": "make"
  }
}

Please note that the value provided for "distPath" needs to be aligned with
configuration of the given build command. E.g., in the example above, "make"
would need to configured in a way that it writes the report artefacts to the
"output" folder.`)
  })
  .action(async () => {
    const cliConfig = loadCliConfig()
    const builder = new Builder(console)

    try {
      await builder.build(cliConfig.distPath, cliConfig.buildCommand)
    }
    catch (error) {
      console.error(chalk.red(error))
    }
  })

program
  .command('upload')
  .description('Uploads the report to the configured workspace')
  .on('--help', () => {
    console.log(`
Before uploading, the report will be built – see "lxr help build" for details.

The report will be uploaded to the workspace associated with the "apitoken" on
the "host" given in lxr.json.`)
  })
  .action(async () => {
    const cliConfig = loadCliConfig()
    const lxrConfig = loadLxrConfig()
    const { host: tokenhost, apitoken, proxyURL } = lxrConfig

    const builder = new Builder(console)
    const bundler = new Bundler()
    const uploader = new Uploader()

    console.log(chalk.yellow(chalk.italic('Bundling and uploading your project...')))

    try {
      await builder.build(cliConfig.distPath, cliConfig.buildCommand)
      await bundler.bundle(cliConfig.distPath)
      await uploader.upload({ tokenhost, apitoken, proxyURL })
    }
    catch (error) {
      handleError(error)
    }
  })

program
  .command('store-upload <id> <apitoken>')
  .description('Uploads the report to the LeanIX Store')
  .requiredOption('--tokenhost <tokenhost>', 'Where to resolve the apitoken (default: app.leanix.net)')
  .option('--host <host>', 'Which store to use (default: store.leanix.net)')
  .action(async (assetVersionId: string, apitoken: string, options: { host: string, tokenhost: string }) => {
    const cliConfig = loadCliConfig()

    const host = options.host || 'store.leanix.net'

    const builder = new Builder(console)
    const bundler = new Bundler()
    const uploader = new Uploader()

    console.log(chalk.yellow(`Bundling and uploading your project to the LeanIX Store (${host})...`))

    try {
      await builder.build(cliConfig.distPath, cliConfig.buildCommand)
      await bundler.bundle(cliConfig.distPath)
      await uploader.upload({ apitoken, tokenhost: options.tokenhost, store: { assetVersionId, host } })
    }
    catch (error) {
      handleError(error)
    }
  })

program.parse(process.argv)

// no commands specified
if (process.argv.length === 2) {
  console.log(chalk.cyan('  LeanIX Reporting CLI'))
  console.log(chalk.cyan('  ===================='))
  console.log('')
  console.log(chalk.cyan(`  version: ${version}`))
  console.log(chalk.cyan('  github: https://github.com/leanix/leanix-reporting-cli'))
  console.log('')
  program.outputHelp()
}

function handleError(err: unknown) {
  if (err instanceof AxiosError) {
    if (err.status) {
      if (err.status === 401) {
        console.error('Invalid API token')
      }
      else {
        console.error(`${err.status}: ${JSON.stringify(err.response.data)}`)
      }
    }
    else {
      console.error(`${err.cause}: ${err.code}`)
    }
  }
  else if (err instanceof Error) {
    console.error(chalk.red(err.message))
  }
  else {
    console.error(chalk.red(err))
  }
}
