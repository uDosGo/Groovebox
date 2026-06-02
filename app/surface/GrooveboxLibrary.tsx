import React from 'react';

export function GrooveboxLibrary() {
  return (
    <div className="groovebox-card">
      <div className="groovebox-panel-header">
        <h2>Pattern library</h2>
        <strong className="groovebox-count-pill">0</strong>
      </div>
      <p className="groovebox-lede">Demos and saved patterns. Selecting one loads it into the composer and parses playback.</p>
      <div className="groovebox-muted groovebox-library-meta"></div>
      <div className="groovebox-library-list"></div>
      <section className="groovebox-resource-placeholder" aria-label="Future sounds">
        <h3 className="groovebox-resource-placeholder-title">Sounds & resources</h3>
        <p className="groovebox-muted">
          Sample packs and instrument resources will plug in here; for now, patterns above carry tempo, tracks, and export hooks.
        </p>
      </section>
    </div>
  );
}

export default GrooveboxLibrary;
