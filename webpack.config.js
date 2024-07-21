//@ts-check

import { resolve } from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import Webpack from 'webpack';
import { monkey } from 'webpack-monkey';
import terser from 'terser-webpack-plugin';
import WebpackBarPlugin from 'webpackbar';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

export default /**
 * @param {{ mode: 'production' | 'development' | 'none' | undefined; }} argv
 * @returns { Promise<import('webpack').Configuration> }
 */
async function (env, argv) {
  const mode = argv.mode || 'development';
  return monkey({
    mode,
    entry: resolve('src/index'),
    output: { path: resolve('dist') },
    devtool: argv.mode === 'development' && 'eval-source-map',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader'
        },
        {
          test: /\.css$/i,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: { postcssOptions: { plugins: [['postcss-preset-env']] } }
            }
          ]
        },
        {
          test: /.(woff2?|eot|ttf|otf)|(webp)$/,
          type: 'asset/inline'
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json', '.css', '.webp'],
      alias: {
        'luogu-api': resolve('luogu-api-docs', 'luogu-api'),
        assets: resolve('assets')
      }
    },
    optimization:
      mode == 'production'
        ? {
            minimize: true,
            usedExports: true,
            innerGraph: true,
            minimizer: [
              new terser({
                parallel: true,
                terserOptions: {
                  format: { comments: false }
                },
                extractComments: false
              }),
              new CssMinimizerPlugin()
            ]
          }
        : {},
    monkey: {
      debug: mode === 'development',
      meta: {
        resolve: () => resolve('meta.js'),
        async load({ file }) {
          /**@type {import('./meta.js').default & {match: string | string[]}} */
          const res = (await import(file)).default;
          if (typeof res.match === 'string') res.match = [res.match];
          if (mode === 'development') res.match.push('*://localhost/');
          return res;
        }
      },
      beautify: { prettier: false }
    },
    plugins: [
      new WebpackBarPlugin(),
      ...(env.analyze ? [new BundleAnalyzerPlugin()] : []),
      new MiniCssExtractPlugin(),
      new Webpack.DefinePlugin({
        RUN:
          mode == 'development'
            ? () =>
                window.location.hostname !== 'localhost' ||
                window.location.port === '54220'
            : () => true
      })
    ]
  });
}
