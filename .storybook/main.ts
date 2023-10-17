import type { StorybookConfig } from '@storybook/react-webpack5';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  staticDirs: ['../assets'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-onboarding',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  features: {
    storyStoreV7: true, // 👈 Opt out of on-demand story loading
  },
  webpackFinal: (config) => {
    if (!config?.module?.rules) {
      return config;
    }

    config.module.rules.splice(6, 1);
    config.module.rules.push({
      test: /\.global\.(c|sc|sa)ss$/,
      use: [
        { loader: 'style-loader' },
        { loader: 'css-loader', options: { sourceMap: true } },
        { loader: 'sass-loader' }
      ]
    });
    config.module.rules.push({
      test: /^((?!\.global).)*\.(c|sc|sa)ss$/,
      use: [
        { loader: 'style-loader' },
        { loader: 'css-modules-typescript-loader' },
        {
          loader: 'css-loader',
          options: {
            modules: { localIdentName: '[name]__[local]__[hash:base64:5]' },
            sourceMap: true,
            importLoaders: 1
          }
        },
        { loader: 'sass-loader' }
      ]
    });

    return config;
  }
};
export default config;
