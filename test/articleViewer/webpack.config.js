// @ts-check

import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import Base from '../../webpack.config.base.js';

const dirname = import.meta.dirname;

/**
 * @param {Record<string,string|boolean>} env
 * @param {{ mode: 'production' | 'development' | 'none' | undefined; }} argv
 * @returns { Promise<import('webpack').Configuration> }
 */
export default async function (env, argv) {
  const base = await Base(env, argv);
  (base.plugins || (base.plugins = [])).push(
    new HtmlWebpackPlugin({
      filename: 'index.html'
    })
  );
  base.devServer = {
    port: 22552,
    static: {
      directory: path.join(dirname, 'testcase'),
      publicPath: '/'
    }
  };
  base.entry = path.join(dirname, 'index.tsx');
  return base;
}
