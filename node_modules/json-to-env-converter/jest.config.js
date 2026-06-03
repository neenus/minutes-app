/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'], // Point Jest to the source folder
  moduleFileExtensions: ['ts', 'js'],
  testRegex: '.*\\.test\\.ts$', // Match test files ending with .test.ts
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};
