import React from 'react';

export function GrooveboxComposer() {
  return (
    <div className="groovebox-card">
      <div className="groovebox-panel-header groovebox-panel-header--stack">
        <h2>Markdown music spec</h2>
        <div className="groovebox-action-row">
          <button className="groovebox-btn">Load</button>
          <button className="groovebox-btn">Save</button>
          <button className="groovebox-btn">Save Session</button>
          <button className="groovebox-btn">Save Pattern</button>
          <button className="groovebox-btn">Parse</button>
          <button className="groovebox-btn">Compile</button>
          <button className="groovebox-btn">Preview</button>
          <button className="groovebox-btn">Export .mid</button>
          <button className="groovebox-btn">Render .wav</button>
          <button className="groovebox-btn">Export Notation</button>
          <button className="groovebox-btn">Export MML</button>
          <button className="groovebox-btn">Export MusicXML</button>
        </div>
      </div>
      <label className="groovebox-field">
        <span>File path</span>
        <input type="text" defaultValue="session/demo-groovebox.md" />
      </label>
    </div>
  );
}

export default GrooveboxComposer;
