import React, { useState, useCallback } from 'react';

export function GrooveboxComposer() {
  const [filePath, setFilePath] = useState('session/demo-groovebox.md');
  const [markdown, setMarkdown] = useState('');

  const handleAction = useCallback((action: string) => {
    console.log(`Composer action: ${action}`);
  }, []);

  const actions = [
    { id: 'load', label: 'Load', icon: 'bi-folder2-open' },
    { id: 'save', label: 'Save', icon: 'bi-save' },
    { id: 'save-session', label: 'Save Session', icon: 'bi-journal-plus' },
    { id: 'save-pattern', label: 'Save Pattern', icon: 'bi-file-earmark-plus' },
    { id: 'parse', label: 'Parse', icon: 'bi-file-earmark-code' },
    { id: 'compile', label: 'Compile', icon: 'bi-gear' },
    { id: 'preview', label: 'Preview', icon: 'bi-play-circle' },
    { id: 'export-midi', label: 'Export .mid', icon: 'bi-file-earmark-music' },
    { id: 'render-wav', label: 'Render .wav', icon: 'bi-file-earmark-play' },
    { id: 'export-notation', label: 'Export Notation', icon: 'bi-music-note' },
    { id: 'export-mml', label: 'Export MML', icon: 'bi-code-slash' },
    { id: 'export-musicxml', label: 'Export MusicXML', icon: 'bi-filetype-xml' },
  ];

  return (
    <div className="mb-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h5 className="mb-0">
            <i className="bi bi-music-note-beamed me-2" />
            Compose
          </h5>
          <small className="text-muted">
            Write markdown music specs, then parse, compile, and export.
          </small>
        </div>
      </div>

      {/* File path */}
      <div className="mb-3">
        <label className="form-label small fw-semibold">
          <i className="bi bi-file-earmark me-1" />
          File path
        </label>
        <div className="input-group input-group-sm">
          <span className="input-group-text">
            <i className="bi bi-folder" />
          </span>
          <input
            type="text"
            className="form-control form-control-sm font-monospace"
            value={filePath}
            onChange={e => setFilePath(e.target.value)}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="d-flex flex-wrap gap-1 mb-3">
        {actions.map(a => (
          <button
            key={a.id}
            className="btn btn-sm btn-outline-secondary"
            onClick={() => handleAction(a.id)}
            title={a.label}
          >
            <i className={`bi ${a.icon} me-1`} />
            {a.label}
          </button>
        ))}
      </div>

      {/* Markdown editor */}
      <div className="mb-3">
        <label className="form-label small fw-semibold">
          <i className="bi bi-markdown me-1" />
          Markdown spec
        </label>
        <textarea
          className="form-control form-control-sm font-monospace"
          rows={16}
          value={markdown}
          onChange={e => setMarkdown(e.target.value)}
          placeholder={`# My Groove\n\n## Tempo: 120\n\n## Tracks\n\n### Track 1: Kick\n- C2: 1 3 5 7\n\n### Track 2: Snare\n- D2: 2 6\n\n### Track 3: Hi-hat\n- F#2: 1 2 3 4 5 6 7 8`}
        />
      </div>

      {/* Status bar */}
      <div className="d-flex align-items-center gap-3 small text-muted border-top pt-2">
        <span>
          <i className="bi bi-info-circle me-1" />
          {markdown.length > 0
            ? `${markdown.split('\n').length} lines, ${markdown.length} chars`
            : 'Empty spec'}
        </span>
        <span className="text-success">
          <i className="bi bi-check-circle me-1" />
          Ready
        </span>
      </div>
    </div>
  );
}

export default GrooveboxComposer;
