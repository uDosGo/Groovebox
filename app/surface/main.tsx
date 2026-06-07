import React from 'react';
import ReactDOM from 'react-dom/client';
import { GrooveboxSurface } from './GrooveboxSurface';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/groovebox-surface.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GrooveboxSurface />
  </React.StrictMode>,
);
