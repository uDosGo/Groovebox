import React from 'react';
import ReactDOM from 'react-dom/client';
import { GrooveboxSurface } from './GrooveboxSurface';
import '@usx/styles';
import './styles/groovebox-surface.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GrooveboxSurface />
  </React.StrictMode>,
);
