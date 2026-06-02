import React from 'react';

export function GrooveboxPlayback() {
  return (
    <div className="groovebox-card">
      <div className="groovebox-panel-header">
        <h2>Playback</h2>
      </div>
      <div className="groovebox-transport-card">
        <div className="groovebox-transport-actions">
          <button className="groovebox-btn">Play</button>
          <button className="groovebox-btn">Stop</button>
        </div>
        <div className="groovebox-transport-meta">
          <label className="groovebox-field groovebox-field--compact">
            <span>BPM</span>
            <input type="number" min="40" max="240" defaultValue={122} />
          </label>
          <div className="groovebox-transport-state">
            <span className="groovebox-muted">State</span>
            <strong id="transport-state">idle</strong>
          </div>
          <div className="groovebox-transport-state">
            <span className="groovebox-muted">Step</span>
            <strong id="transport-step">0</strong>
          </div>
        </div>
        <div id="master-step-grid" className="groovebox-master-step-grid"></div>
      </div>
      <div id="parse-summary" className="groovebox-summary-card"></div>
      <div id="session-summary" className="groovebox-summary-card groovebox-summary-card--compact"></div>
      <pre id="pattern-json" className="groovebox-pattern-json"></pre>
      <div id="channels" className="groovebox-channels"></div>
    </div>
  );
}

export default GrooveboxPlayback;
