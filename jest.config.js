module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '.spec.ts$',
  moduleNameMapper: {
    '^node:url$': '<rootDir>/__mocks__/node.js'
  }
}
