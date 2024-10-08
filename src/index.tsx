import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './app';

document.body.innerHTML = '';
const div = document.createElement('div');
document.body.appendChild(div);
div.id = 'app';
createRoot(div).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
