import type { StorybookConfig } from '@storybook/svelte-webpack5';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(svelte)'],
  staticDirs: ['../assets'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-svelte-csf',
  ],
  framework: {
    name: '@storybook/svelte-webpack5',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  features: {
    storyStoreV7: false, // 👈 Opt out of on-demand story loading
  },
  webpackFinal: (config) => {
    if (!config?.module?.rules) {
      return config;
    }

    config.module.rules.splice(8, 1);
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
