import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/common/(.*)$': '<rootDir>/common/$1',
    '^@auth/(.*)$': '<rootDir>/modules/auth/$1',
    '^@auth-domain/(.*)$': '<rootDir>/modules/auth/domain/$1',
    '^@auth-services/(.*)$': '<rootDir>/modules/auth/services/$1',
    '^@auth-repositories/(.*)$': '<rootDir>/modules/auth/repositories/$1',
    '^@auth-policies/(.*)$': '<rootDir>/modules/auth/policies/$1',
    '^@auth-events/(.*)$': '<rootDir>/modules/auth/events/$1',
    '^@infrastructure/(.*)$': '<rootDir>/infrastructure/$1',
  },
};

export default config;
