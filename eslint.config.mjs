import { fixupConfigRules } from '@eslint/compat';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default [
  {
    ignores: [
      '**/.env',
      '**/env-config.js',
      '**/env.sh',
      '**/.d.ts',
      'scripts/*.js',
      'build/**',
      'webpack/*',
      'public/**'
    ]
  },
  {
    files: ['**/*.{js,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  // eslint-plugin-react 7.37.5 does not support ESLint 10 natively; remove the
  // fixup (and the package.json peer override) once an ESLint 10 release ships.
  ...fixupConfigRules({
    ...reactPlugin.configs.flat.recommended,
    files: ['**/*.{js,ts,tsx}']
  }),
  prettierRecommended,
  {
    files: ['**/*.{js,ts,tsx}'],
    plugins: {
      'react-hooks': reactHooksPlugin
    },
    rules: {
      'no-multi-spaces': ['warn'],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/prop-types': 0,
      'react/react-in-jsx-scope': 0
    }
  }
];
