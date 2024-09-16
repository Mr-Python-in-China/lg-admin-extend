import * as props from 'react/jsx-runtime';
import rehypeReact from 'rehype-react';
import rehypeHighlight from 'rehype-highlight';
import { visit, SKIP } from 'unist-util-visit';
import luoguMarkdownProcessor from 'lg-markdown-processor';

const rehypeReactConfig: import('hast-util-to-jsx-runtime').Options = {
  Fragment: 'article',
  // @ts-expect-error
  jsx: props.jsx,
  // @ts-expect-error
  jsxs: props.jsxs
};

export default function getProcessor() {
  return luoguMarkdownProcessor({
    rehypePlugins: [hastHeilightSpace, rehypeHighlight]
  })
    .use(rehypeReact, rehypeReactConfig)
    .freeze();
}
function hastHeilightSpace() {
  const heilightSpaceElement: import('hast').Element = {
    type: 'element',
    tagName: 'span',
    properties: { className: ['articleViewer-heilightSpace'] },
    children: [{ type: 'text', value: ' ' }]
  };
  return (tree: import('hast').Root) =>
    visit(tree, 'element', element => {
      if (element === heilightSpaceElement) return SKIP;
      if (element.tagName === 'code') return SKIP;
      let className = element.properties['className'];
      if (typeof className === 'string') className = [className];
      if (
        Array.isArray(className) &&
        (className.includes('katex') || className.includes('katex-display'))
      )
        return SKIP;
      const newChildren = new Array<import('hast').ElementContent>();
      for (let i of element.children) {
        if (i.type !== 'text') {
          newChildren.push(i);
          continue;
        }
        i.value.split(' ').forEach((s, i) => {
          if (i) newChildren.push(heilightSpaceElement);
          newChildren.push({ type: 'text', value: s });
        });
      }
      element.children = newChildren;
    });
}
