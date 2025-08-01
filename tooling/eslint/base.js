import eslintConfig from '@pixpilot/dev-config/eslint';
import jestConfig from '@pixpilot/dev-config/eslint-jest';

const config = /** @type {any} */ ([
  {
    ignores: [
      '**/*.config.*',
      '.rollup.cache/**',
      '.cache/**',
      'dist/**',
      'coverage/**',
      'node_modules/**',
    ],
  },

  ...eslintConfig,
  ...jestConfig,

  {
    files: ['**/*.js', '**/*.ts', '**/*.tsx'],
  },
]);

export default config;
