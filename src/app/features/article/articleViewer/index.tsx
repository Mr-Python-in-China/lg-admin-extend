import React, { createElement, memo } from 'react';
import getProcessor from './getProcessor';
import * as HighlightElement from './highlightElement';

import 'katex/dist/katex.css';
import 'highlight.js/styles/base16/tomorrow.css';
import './style.css';
import './highlightFormatIssue.css';

const processor = getProcessor();

const ArticlerRenderer = memo(
  ({ children: markdown }: { children: string }) =>
    processor.processSync(markdown).result
);

export default function ArticleViewer({
  markdown,
  addCommit
}: {
  markdown: string;
  addCommit: (content: string) => void;
}) {
  return (
    <article
      onClick={e => {
        const target = e.target as HTMLElement;
        if (
          target.parentElement?.classList.contains(
            'NeedSpaceBetweenPunctuationAndChineseChar'
          )
        ) {
          addCommit(
            HighlightElement.NeedSpaceBetweenEnglishCharAndChineseCharNote
          );
          return;
        }
      }}
    >
      <ArticlerRenderer>{markdown}</ArticlerRenderer>
    </article>
  );
}
