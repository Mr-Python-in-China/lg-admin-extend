import * as props from 'react/jsx-runtime';
import rehypeReact from 'rehype-react';
import rehypeHighlight from 'rehype-highlight';
import { visit, SKIP } from 'unist-util-visit';
import luoguMarkdownProcessor from 'lg-markdown-processor';
import { Element, ElementContent, Text } from 'hast';

function checkClass(element: Element, target: string) {
  let className = element.properties['className'];
  if (className === undefined || className === null) return false;
  if (typeof className === 'number' || typeof className === 'boolean')
    element.properties['className'] = className = className.toString();
  if (typeof className === 'string')
    element.properties['className'] = className = className.split(' ');
  return className.includes(target);
}

const rehypeReactConfig: import('hast-util-to-jsx-runtime').Options = {
  Fragment: 'article',
  // @ts-expect-error
  jsx: props.jsx,
  // @ts-expect-error
  jsxs: props.jsxs
};

export default function getProcessor() {
  return luoguMarkdownProcessor({
    rehypePlugins: [hastHighlightSpace, rehypeHighlight]
  })
    .use(rehypeReact, rehypeReactConfig)
    .freeze();
}

namespace CharTest {
  export const ChineseChar = /\p{sc=Han}/u;
  export const Punctuation = /\p{P}/u;
  export const EnglishChar = /[a-zA-Z]/;
}
namespace HighlightElement {
  export const Space: Element = {
    type: 'element',
    tagName: 'span',
    properties: { className: ['articleHighlight', 'Space'] },
    children: [{ type: 'text', value: ' ' }]
  };
  export const NeedSpaceBetweenEnglishCharAndChineseChar: Element = {
    type: 'element',
    tagName: 'span',
    properties: {
      className: [
        'articleHighlight',
        'NeedSpaceBetweenPunctuationAndChineseChar'
      ]
    },
    children: [
      {
        type: 'element',
        tagName: 'div',
        properties: {},
        children: []
      }
    ]
  };
}
function hastHighlightSpace() {
  return (tree: import('hast').Root) =>
    visit(tree, 'element', element => {
      if (element.tagName === 'code') return SKIP;
      if (checkClass(element, 'katex') || checkClass(element, 'katex-display'))
        return SKIP;
      if (checkClass(element, 'articleHighlight')) return SKIP;
      const tmp = element.children
        .flatMap<Exclude<ElementContent, Text> | string>(child =>
          child.type === 'text' ? Array.from(child.value) : child
        )
        .flatMap<Exclude<ElementContent, Text> | string>((child, idx, arr) => {
          if (typeof child !== 'string') return child;
          if (child === ' ') return HighlightElement.Space;
          const prevElement = idx !== 0 ? arr[idx - 1] : undefined;
          if (
            typeof prevElement === 'string' &&
            ((CharTest.ChineseChar.test(prevElement) &&
              CharTest.EnglishChar.test(child)) ||
              (CharTest.EnglishChar.test(prevElement) &&
                CharTest.ChineseChar.test(child)))
          )
            return [
              HighlightElement.NeedSpaceBetweenEnglishCharAndChineseChar,
              child
            ];
          return child;
        });
      element.children = [];
      const chars = new Array<string>();
      for (const child of tmp) {
        if (typeof child === 'string') chars.push(child);
        else {
          if (chars.length > 0) {
            element.children.push({ type: 'text', value: chars.join('') });
            chars.length = 0;
          }
          element.children.push(child);
        }
      }
      if (chars.length > 0)
        element.children.push({ type: 'text', value: chars.join('') });
    });
}
