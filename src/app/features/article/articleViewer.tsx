import React from 'react';

import MarkdownIt from 'markdown-it';
import katex from '@vscode/markdown-it-katex';
import highlightjs from 'markdown-it-highlightjs';

import 'katex/dist/katex.css';
import 'highlight.js/styles/base16/tomorrow.css';

const md = new MarkdownIt().use(highlightjs).use(katex);

export function ArctleViewer({
  children: markdown,
  className
}: {
  children: string;
  className?: string;
}) {
  return (
    <article
      dangerouslySetInnerHTML={{ __html: md.render(markdown) }}
      className={className}
    />
  );
}
