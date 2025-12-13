module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/server/controllers/_tests_/',
    '/server/test-resources/'
  ],
  testMatch: [
    '**/server/**/_tests_/**/*.test.js'
  ],
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/server.js',
    '!server/controllers/_tests_/**',
    '!server/test-resources/**'
  ]
};

