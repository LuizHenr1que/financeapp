module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  testMatch: [
    '**/__tests__/**/*.test.{js,jsx}',
    '**/?(*.)+(spec|test).{js,jsx}'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/__tests__/setup.js',
    '<rootDir>/node_modules/',
    '<rootDir>/android/',
    '<rootDir>/ios/'
  ],
  collectCoverageFrom: [
    'components/**/*.{js,jsx}',
    'context/**/*.{js,jsx}',
    'hooks/**/*.{js,jsx}',
    'services/**/*.{js,jsx}',
    'screens/**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@expo|expo)/)'
  ]
};
