import React, { useState } from 'react';

export function GrooveboxExports() {
  const [source, setSource] = useState('');

  return (
    <div className="mb-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h5 className="mb-0">
            <i className="bi bi-file-earmark-arrow-up me-2" />
            Markdown Editor
          </h5>
          <small className="text-muted">
            Raw markdown source for the current spec.
          </small>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-secondary">
            <i className="bi bi-arrow-counterclockwise me-1" />
            Reset
          </button>
          <button className="btn btn-sm btn-outline-primary">
            <i className="bi bi-arrow-up me-1" />
            Apply
          </button>
        </div>
      </div>

      {/* Source label */}
      <div className="mb-2">
        <label className="form-label small fw-semibold mb-0">
          <i className="bi bi-file-text me-1" />
          Source
        </label>
      </div>

      {/* Markdown editor */}
      <textarea
        className="form-control form-control-sm font-monospace"
        rows={12}
        value={source}
        onChange={e => setSource(e.target.value)}
        placeholder={`# Paste or edit markdown spec here\n\n## Tempo: 120\n\n## Tracks\n\n### Track 1: Kick\n- C2: 1 3 5 7`}
        style={{
          background: 'var(--groovebox-bg)',
          border: '1px solid var(--groovebox-border)',
          color: 'var(--groovebox-text)',
          resize: 'vertical',
        }}
      />

      {/* Status */}
      <div className="d-flex align-items-center gap-3 small text-muted mt-2">
        <span>
          <i className="bi bi-info-circle me-1" />
          {source.length > 0
            ? `${source.split('\n').length} lines, ${source.length} chars`
            : 'Empty'}
        </span>
        <span>
          <i className="bi bi-arrow-repeat me-1" />
          Auto-sync with Compose tab
        </span>
      </div>
    </div>
  );
}

export default GrooveboxExports;
