#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, mkdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { red } from 'kolorist'
import minimist from 'minimist'
import prompts from 'prompts'
import { canSkipEmptying, emptyDir, isValidPackageName, pkgFromUserAgent, toValidPackageName } from './helpers'
import banner from './utils/banner'
import { deployTemplate } from './utils/deployTemplate'
import { generateLeanIXFiles } from './utils/leanix'

export interface IProjectOptions {
  packageName?: string
  targetDir?: string
  overwrite?: boolean
}

export interface ILeanIXOptions {
  id?: string
  author?: string
  title?: string
  description?: string
  host?: string
  apitoken?: string
  proxyURL?: string
}

export interface IPromptResult extends IProjectOptions, ILeanIXOptions {
  projectName?: string
}

const cwd = process.cwd()

// Fixed template: React with TypeScript
const TEMPLATE = 'react-ts'

const getLeanIXQuestions = (argv: minimist.ParsedArgs): Array<prompts.PromptObject<keyof ILeanIXOptions | 'behindProxy'>> => ([
  {
    type: argv?.id === undefined ? 'text' : null,
    name: 'id',
    message: 'Unique id for this report in Java package notation (e.g. net.leanix.barcharts)'
  },
  {
    type: argv?.author === undefined ? 'text' : null,
    name: 'author',
    message: 'Who is the author of this report (e.g. LeanIX GmbH)'
  },
  {
    type: argv?.title === undefined ? 'text' : null,
    name: 'title',
    message: 'A title to be shown in LeanIX when report is installed'
  },
  {
    type: argv?.description === undefined ? 'text' : null,
    name: 'description',
    message: 'Description of your project'
  },
  {
    type: argv?.host === undefined ? 'text' : null,
    name: 'host',
    initial: 'demo-eu.leanix.net',
    message: 'Which host do you want to work with?'
  },
  {
    type: argv?.apitoken === undefined ? 'text' : null,
    name: 'apitoken',
    message: 'API-Token for Authentication (see: https://dev.leanix.net/docs/authentication#section-generate-api-tokens)'
  },
  {
    type: argv?.proxyURL === undefined ? 'toggle' : null,
    name: 'behindProxy',
    message: 'Are you behind a proxy?',
    initial: false,
    active: 'Yes',
    inactive: 'No'
  },
  {
    type: (prev: boolean) => prev && 'text',
    name: 'proxyURL',
    message: 'Proxy URL?'
  }
])

export const init = async (): Promise<void> => {
  console.log(`\n${banner}\n`)
  const argv = minimist(process.argv.slice(2), {
    string: ['reportId', 'author', 'title', 'description', 'host', 'apitoken', 'proxyUrl'],
    boolean: ['overwrite'],
    default: {
      overwrite: false
    }
  })

  let targetDir = argv?._?.[0] ?? null
  const defaultProjectName = targetDir ?? 'leanix-custom-report'

  // leanix-specific answers
  let { id, author, title, description, host, apitoken, proxyURL, overwrite = false } = argv

  let result: IPromptResult = {}
  try {
    result = await prompts(
      [
        {
          type: targetDir !== null ? null : 'text',
          name: 'projectName',
          message: 'Project name:',
          initial: defaultProjectName,
          onState: state => (targetDir = state.value.trim() ?? defaultProjectName)
        },
        {
          name: 'overwrite',
          type: () => canSkipEmptying(targetDir) || overwrite ? null : 'confirm',
          message: () => {
            const dirForPrompt = targetDir === '.' ? 'Current directory' : `Target directory "${targetDir}"`
            return `${dirForPrompt} is not empty. Remove existing files and continue?`
          }
        },
        {
          name: 'overwriteChecker',
          type: (_, { overwrite }: { overwrite?: boolean }) => {
            if (overwrite === false) {
              throw new Error(`${red('✖')} Operation cancelled`)
            }
            return null
          }
        },
        {
          name: 'packageName',
          type: () => (isValidPackageName(targetDir) ? null : 'text'),
          message: 'Package name:',
          initial: () => toValidPackageName(targetDir),
          validate: dir => isValidPackageName(dir) ?? 'Invalid package.json name'
        },
        ...getLeanIXQuestions(argv)
      ],
      {
        onCancel: () => {
          throw new Error(`${red('✖')} Operation cancelled`)
        }
      }
    )
  }
  catch (cancelled: any) {
    console.log(cancelled?.message)
    return
  }

  // leanix-specific answers
  ({
    id = id,
    author = author,
    title = title,
    description = description,
    host = host,
    apitoken = apitoken,
    proxyURL = proxyURL,
    overwrite = overwrite
  } = result)
  const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent) ?? null
  const pkgManager = (pkgInfo != null) ? pkgInfo.name : 'npm'

  const root = join(cwd, targetDir ?? '')

  console.log(`🚀Scaffolding project in ${root}...`)
  console.log(`Using React + TypeScript template`)

  if (overwrite === true) {
    emptyDir(root)
  }
  else if (!existsSync(root)) {
    mkdirSync(root)
  }

  deployTemplate({ defaultProjectName, targetDir: root, template: TEMPLATE, result: { id, author, title, description, host, apitoken, proxyURL, overwrite } })
  await generateLeanIXFiles({ targetDir: root, result: { packageName: defaultProjectName, id, author, title, description, host, apitoken, proxyURL, overwrite } })

  console.log('\n🔥Done. Now run:\n')
  if (root !== cwd) {
    console.log(`  cd ${relative(cwd, root)}`)
  }
  switch (pkgManager) {
    case 'yarn':
      console.log('  yarn')
      console.log('  yarn dev')
      break
    default:
      console.log(`  ${pkgManager} install`)
      console.log(`  ${pkgManager} run dev`)
      break
  }
  console.log()
}

init().catch((e) => {
  console.error(e)
})

export default init
