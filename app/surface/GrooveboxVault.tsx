import React from 'react';

export function GrooveboxVault() {
  return (
    <div className="groovebox-card">
      <div className="groovebox-panel-header">
        <h2>Vault browser</h2>
        <p className="groovebox-lede">Pick a workspace root, move through folders, then load a file into the composer.</p>
      </div>
      <div className="groovebox-vault-toolbar">
        <label className="groovebox-field groovebox-field--inline">
          <span>Workspace</span>
          <select id="root-select"></select>
        </label>
        <button className="groovebox-btn groovebox-btn--secondary">Up</button>
      </div>
      <div className="groovebox-path-row">
        <code className="groovebox-path-code">.</code>
      </div>
      <div id="tree" className="groovebox-tree"></div>
      <p className="groovebox-hint">
        <a href="#composer">Open Compose</a> to edit the loaded path and markdown.
      </p>
    </div>
  );
}

export default GrooveboxVault;
