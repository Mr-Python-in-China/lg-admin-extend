/*
 * Copyright © 2024 by Luogu
 */

import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkMath from './remarkMath.js';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeReact from 'rehype-react';
import { visit } from 'unist-util-visit';
import parsePath from 'parse-path';
import * as props from 'react/jsx-runtime';

const rehypeReactConfig: import('hast-util-to-jsx-runtime').Options = {
  Fragment: 'article',
  // @ts-expect-error
  jsx: props.jsx,
  // @ts-expect-error
  jsxs: props.jsxs
};

export default function getProcessor() {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(hastBilibili)
    .use(rehypeHighlight)
    .use(rehypeReact, rehypeReactConfig)
    .freeze();
}

function hastBilibili() {
  return (tree: import('hast').Root) =>
    visit(tree, 'element', function (element) {
      if (element.tagName !== 'img' || !element.properties) return;
      const src = element.properties.src;
      if (typeof src !== 'string') return;
      if (!src.startsWith('bilibili:')) return;
      const parsedUrl = parsePath(src);
      if ((parsedUrl.protocol as string) !== 'bilibili') return;
      const query = parsedUrl.query;
      const r: {
        aid?: string;
        bvid?: string;
        page?: string;
        danmaku: string;
        autoplay: string;
        playlist: string;
        high_quality: string;
      } = {
        danmaku: '0',
        autoplay: '0',
        playlist: '0',
        high_quality: '1'
      };
      const pathname = parsedUrl.pathname;
      const match = pathname.match(/^(av)?(\d+)$/);
      if (match) r.aid = match[2];
      else if (pathname.toLowerCase().startsWith('bv')) r.bvid = pathname;
      else r.bvid = 'bv' + pathname;

      const page = Number(query.t || '');
      if (page) r.page = String(page);

      element.tagName = 'div';
      element.properties.style = 'position: relative; padding-bottom: 62.5%';

      element.children = [
        {
          type: 'element',
          tagName: 'iframe',
          properties: {
            src:
              'https://www.bilibili.com/blackboard/webplayer/embed-old.html?' +
              Object.entries(r)
                .filter(([_, value]) => value !== undefined)
                .map(
                  ([key, value]) =>
                    `${encodeURIComponent(String(key))}=${encodeURIComponent(String(value))}`
                )
                .join('&'),
            scrolling: 'no',
            border: 0,
            frameborder: 'no',
            framespacing: 0,
            allowfullscreen: true,
            style:
              'position: absolute; top: 0; left: 0; width: 100%; height: 100%;'
          },
          children: []
        }
      ];
    });
}
