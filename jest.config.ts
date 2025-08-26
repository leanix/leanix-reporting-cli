import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  verbose: true,
  testEnvironment: 'node',
  transform: {
    '^.+\\.m?[tj]sx?$': [
      'babel-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json'
      }
    ]
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  projects: [
    {
      displayName: '@lxr/core',
      testMatch: ['<rootDir>/packages/core/src/**/*.spec.ts'],
      // TODO: // line 12 => https://stackoverflow.com/questions/69383514/node-fetch-3-0-0-and-jest-gives-syntaxerror-cannot-use-import-statement-outside
      transformIgnorePatterns: []
    },
    {
      displayName: 'vite-plugin-lxr',
      testMatch: ['<rootDir>/packages/vite-plugin-lxr/src/**/*.spec.ts']
    },
    {
      displayName: 'create-lxr',
      testMatch: ['<rootDir>/packages/create-lxr/src/**/*.spec.ts'],
      // TODO: // line 12 => https://stackoverflow.com/questions/69383514/node-fetch-3-0-0-and-jest-gives-syntaxerror-cannot-use-import-statement-outside
      transformIgnorePatterns: []
    }
  ]
}
export default config
