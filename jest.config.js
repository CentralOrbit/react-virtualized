module.exports = {
  moduleDirectories: ['node_modules', __dirname],
  setupFilesAfterEnv: ['./source/test-utils.js'],
  roots: ['./source'],
  coverageReporters: ['lcov'],
  collectCoverageFrom: [
    'source/**/*.js',
    '!source/vendor/**',
    '!source/demo/**',
    '!source/jest-*.js',
    '!**/*.example.js',
  ],
  testRegex: '\\.(jest|e2e|ssr).js$',
  verbose: true,
  testEnvironment: 'jest-environment-jsdom',
};
