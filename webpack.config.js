//@ts-check

import { resolve } from 'path';
import { monkey } from 'webpack-monkey';
import Base from './webpack.config.base.js';

/**
 * @param {Record<string,string|boolean>} env
 * @param {{ mode: 'production' | 'development' | 'none' | undefined; }} argv
 * @returns { Promise<import('webpack').Configuration> }
 */
export default async function (env, argv) {
  const mode = argv.mode || 'development';
  /**@type {Parameters<(typeof import('webpack-monkey').monkey)>[0]}*/
  const base = await Base(env, argv);
  base.monkey = {
    debug: mode === 'development',
    meta: {
      resolve: () => resolve('meta.js'),
      async load({ file }) {
        /**@type {import('./meta.js').default & {match: string | string[]}} */
        const res = (await import(file)).default;
        if (typeof res.match === 'string') res.match = [res.match];
        return res;
      }
    },
    beautify: { prettier: false }
  };
  base.entry = resolve('src/index');
  base.output = { path: resolve('dist') };
  return monkey(base);
}
