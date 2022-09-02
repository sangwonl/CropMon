module.exports = {
  // https://github.com/electron-react-boilerplate/eslint-config-erb
  extends: ['erb', 'plugin:storybook/recommended'],
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',
    'compat/compat': 'off',
    'class-methods-use-this': 'off',
    'no-unused-vars': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/lines-between-class-members': 'off',
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        printWidth: 80,
      },
    ],
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'index',
          'parent',
          'sibling',
          'unknown',
        ],
        pathGroups: [
          {
            pattern: '@utils/**',
            group: 'external',
            position: 'after',
          },
          {
            pattern: '@di/**',
            group: 'external',
            position: 'after',
          },
          {
            pattern: '@domain/**',
            group: 'external',
            position: 'after',
          },
          {
            pattern: '@application/**',
            group: 'external',
            position: 'after',
          },
          {
            pattern: '@adapters/**',
            group: 'external',
            position: 'after',
          },
          {
            pattern: '@assets/**',
            group: 'external',
            position: 'after',
          },
        ],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        'newlines-between': 'always',
        pathGroupsExcludedImportTypes: ['builtin'],
        warnOnUnassignedImports: true,
      },
    ],
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      webpack: {
        config: require.resolve('./.erb/configs/webpack.config.eslint.js'),
      },
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
};
