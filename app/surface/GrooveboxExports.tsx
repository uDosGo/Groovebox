import React from 'react';

export function GrooveboxExports() {
  return (
    <div className="groovebox-card groovebox-card--editor">
      <label className="groovebox-field groovebox-field--tight">
        <span>Source</span>
      </label>
      <textarea className="groovebox-markdown-editor" spellCheck={false}></textarea>
    </div>
  );
}

export default GrooveboxExports;
