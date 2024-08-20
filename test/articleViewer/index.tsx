import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import ArticleViewer from '../../src/app/features/article/articleViewer';

function MarkdownTestComponent() {
  const [markdownText, setMarkdownText] = useState('');
  const [testcase, setTestcase] = useState('000.md');

  const handleSubmit = () => {
    fetch(testcase)
      .then(res => res.text())
      .then(x => setMarkdownText(x));
  };

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div>
        <input value={testcase} onChange={e => setTestcase(e.target.value)} />
        <button onClick={handleSubmit}>Submit</button>
      </div>
      <div
        style={{
          flex: 'auto',
          display: 'flex',
          flexDirection: 'row',
          width: '100%'
        }}
      >
        <div
          style={{
            flex: 1,
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            <code>{markdownText}</code>
          </pre>
        </div>
        <div
          style={{
            flex: 1,
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          <ArticleViewer>{markdownText}</ArticleViewer>
        </div>
      </div>
    </div>
  );
}

{
  const Div = document.createElement('div');
  Div.id = 'app';
  document.body.appendChild(Div);
  createRoot(Div).render(
    <React.StrictMode>
      <MarkdownTestComponent />
    </React.StrictMode>
  );
}
