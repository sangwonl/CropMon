module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
  webpackFinal: (config, {configType}) => {
    const path  = require('path');

    // remove built-in css-loader
    config.module.rules.splice(7, 1)

    config.module.rules.push({
      test: /\.global\.(c|sc|sa)ss$/,
      use: [
        {
          loader: 'style-loader',
        },
        {
          loader: 'css-loader',
          options: {
            sourceMap: true,
          },
        },
        {
          loader: 'sass-loader',
        },
      ],
    });

    config.module.rules.push({
      test: /^((?!\.global).)*\.(c|sc|sa)ss$/,
      use: [
        {
          loader: 'style-loader',
        },
        {
          loader: 'css-modules-typescript-loader',
        },
        {
          loader: 'css-loader',
          options: {
            modules: {
              localIdentName: '[name]__[local]__[hash:base64:5]',
            },
            sourceMap: true,
            importLoaders: 1,
          },
        },
        {
          loader: 'sass-loader',
        },
      ],
    });

    return config;
  }
}
