import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginReact from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tanstackQuery from '@tanstack/eslint-plugin-query'

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['dist', 'out', 'node_modules'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@tanstack/query': tanstackQuery
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'quotes': ['error', 'single'],
      'semi': ['error', 'never'],
      'object-curly-spacing': ['error', 'always'],
      'no-multi-spaces': ['error'],
      'func-call-spacing': ['error', 'never'],
      'space-in-parens': ['error', 'never'],
      'arrow-spacing': ['error', {
        before: true,
        after: true
      }],
      'no-multiple-empty-lines': [1, { 'max': 1 }],
      'comma-dangle': ['error', 'never'],
      'jsx-quotes': ['error', 'prefer-single'],
      'react/jsx-tag-spacing': ['error', {
        beforeSelfClosing: 'always',
        afterOpening: 'never',
        beforeClosing: 'never'
      }],
      'react/jsx-equals-spacing': ['error', 'never'],
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { 'allowShortCircuit': true }
      ],
      'no-console': ['warn', {
        allow: ['warn', 'error', 'info']
      }]
    }
  }
]