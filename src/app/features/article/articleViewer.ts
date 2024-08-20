import getProcessor from './getProcessor';

import './articleViewer.css';
import 'katex/dist/katex.css';
import 'highlight.js/styles/base16/tomorrow.css';
import { memo } from 'react';

const processor = getProcessor();

const ArticleViewer = memo(function ({
  children: markdown
}: {
  children: string;
}) {
  return processor.processSync(markdown).result;
});

export default ArticleViewer;
