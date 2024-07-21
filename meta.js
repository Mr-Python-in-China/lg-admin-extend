//@ts-check

import { readFileSync } from 'fs';

/**@type {import('./package.json')} */
const package_meta = JSON.parse(readFileSync('./package.json').toString());

const releasePath =
  'https://github.com/Mr-Python-in-China-lg-admin-extend/releases/latest/download/lg-admin-extend.user.js';

/** @type {import("webpack-monkey").Meta} */
const meta = {
  name: package_meta.name,
  version: package_meta.version,
  match: '*://mr-python-in-china.github.io/lg-admin-extend/',
  description: {
    default: package_meta.description,
    'zh-CN': package_meta['description:zh']
  },
  author: package_meta.author,
  updateURL: releasePath,
  downloadURL: releasePath,
  connect: ['www.luogu.com.cn']
};

export default meta;
