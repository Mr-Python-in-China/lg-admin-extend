// @ts-check

import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const dirname = import.meta.dirname;

export default {
  mode: 'development',
  entry: path.join(dirname, 'index.tsx'),
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html'
    }),
    new MiniCssExtractPlugin()
  ],
  devServer: {
    port: 22552,
    static: {
      directory: path.join(dirname, 'testcase'),
      publicPath: '/'
    }
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
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
      }
    ]
  },
  devtool: 'eval-source-map'
};
