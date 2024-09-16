import { memo } from 'react';
import rehypeHighlight from 'rehype-highlight';
import { visit, SKIP } from 'unist-util-visit';
import getProcessor from './getProcessor';

import 'katex/dist/katex.css';
import 'highlight.js/styles/base16/tomorrow.css';
import './style.css';
import './highlightFormatIssue.css';

const processor = getProcessor();

const ArticleViewer = memo(function ({
  children: markdown
}: {
  children: string;
}) {
  return processor.processSync(markdown).result;
});

export default ArticleViewer;
