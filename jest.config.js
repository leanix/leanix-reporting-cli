module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '.spec.ts$',
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  }
};
