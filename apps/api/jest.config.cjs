/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  // Strip the .js suffix our ESM source uses on relative imports so ts-jest
  // (running in CommonJS mode) can resolve the .ts sources.
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        // Compile to CommonJS for Jest — avoids needing Node's experimental
        // VM modules flag, which is awkward to set cross-platform.
        tsconfig: {
          module: 'CommonJS',
          moduleResolution: 'Node',
          verbatimModuleSyntax: false,
          isolatedModules: true,
        },
      },
    ],
  },
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/tests/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/index.ts'],
  coverageDirectory: 'coverage',
};
