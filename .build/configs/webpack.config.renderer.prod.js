/**
 * Build config for electron renderer process
 */

const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const baseConfig = require('./webpack.config.base');
const CheckNodeEnv = require('../scripts/CheckNodeEnv');
const DeleteSourceMaps = require('../scripts/DeleteSourceMaps');

CheckNodeEnv('production');
DeleteSourceMaps();

const devtoolsConfig = process.env.DEBUG_PROD === 'true' ? {
  devtool: 'source-map'
} : {};

module.exports = merge(baseConfig, {
  ...devtoolsConfig,

  mode: 'production',

  target: 'electron-renderer',

  entry: {
    'renderer.ui': [
      'core-js',
      'regenerator-runtime/runtime',
      require.resolve('../../src/adapters/ui/widgets/index.tsx'),
    ],
    'renderer.recorder': [
      'core-js',
      'regenerator-runtime/runtime',
      require.resolve('../../src/adapters/recorder/rec-delegate/delegate.ts'),
    ],
    'renderer.recorder.worker': [
      'core-js',
      'regenerator-runtime/runtime',
      require.resolve('../../src/adapters/recorder/rec-delegate/worker.ts'),
    ],
  },

  output: {
    path: path.join(__dirname, '../../src/dist'),
    publicPath: './dist/',
    filename: '[name].prod.js',
  },

  module: {
    rules: [
      {
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
      },
      // SASS support - compile all other .scss files and pipe it to style.css
      {
        test: /^((?!\.global).)*\.(c|sc|sa)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // `./dist` can't be inerhited for publicPath for styles. Otherwise generated paths will be ./dist/dist
              publicPath: './',
            },
          },
          // Shouldn't use style-loader with mini-css-extract-plugin
          // https://github.com/webpack-contrib/mini-css-extract-plugin/issues/173#issuecomment-398144318
          // {
          //   loader: 'style-loader',
          // },
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
      },
      // WOFF Font
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff',
          },
        },
      },
      // WOFF2 Font
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff',
          },
        },
      },
      // OTF Font
      {
        test: /\.otf(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'font/otf',
          },
        },
      },
      // TTF Font
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/octet-stream',
          },
        },
      },
      // EOT Font
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: 'file-loader',
      },
      // SVG Font
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'image/svg+xml',
          },
        },
      },
      // Common Image Formats
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
        use: 'url-loader',
      },
    ],
  },

  optimization: {
    minimize: true,
    minimizer:
      [
        new TerserPlugin({
          parallel: true,
        }),
        new CssMinimizerPlugin(),
      ],
  },

  plugins: [
    new Dotenv({
      path: path.join(__dirname, '../../.env'),
      allowEmptyValues: true
    }),

    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      DEBUG_PROD: false,
    }),

    new MiniCssExtractPlugin({
      filename: '[name].style.css',
    }),

    new BundleAnalyzerPlugin({
      analyzerMode:
        process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true',
    }),
  ],
});
