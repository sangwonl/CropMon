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
