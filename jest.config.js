/* eslint-disable @typescript-eslint/no-var-requires */

module.exports = {
  roots: ['<rootDir>/sources'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleNameMapper: {
    '/^di/(.*)$/': '<rootDir>/sources/$1',
  },
};
