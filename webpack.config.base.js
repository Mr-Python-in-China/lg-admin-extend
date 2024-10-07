//@ts-check

import { resolve } from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import terser from 'terser-webpack-plugin';
import WebpackBarPlugin from 'webpackbar';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

/**
 * @param {Record<string,string|boolean>} env
 * @param {{ mode: 'production' | 'development' | 'none' | undefined; }} argv
 * @returns { Promise<import('webpack').Configuration> }
 */
export default async function (env, argv) {
  const mode = argv.mode || 'development';
  return {
    mode,
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
          test: /.(woff2?|eot|ttf|otf)|(webp|svg)$/,
          type: 'asset/inline'
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json', '.css', '.webp', '.svg'],
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
    plugins: [
      new WebpackBarPlugin(),
      ...(env.analyze ? [new BundleAnalyzerPlugin()] : []),
      new MiniCssExtractPlugin()
    ]
  };
}
