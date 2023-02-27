/** @type {import('jest').Config} */

const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ["node_modules", "build"],
  modulePathIgnorePatterns: ['<rootDir>/build/'],
};

module.exports = config;