import React, { useState } from 'react';

interface Pattern {
  id: string;
  name: string;
  tempo: number;
  tracks: number;
  bars: number;
  created: string;
  tags: string[];
}

const DEMO_PATTERNS: Pattern[] = [
  { id: 'demo-1', name: 'Four-on-the-floor', tempo: 120, tracks: 4, bars: 8, created: '2026-05-01', tags: ['house', 'beat'] },
  { id: 'demo-2', name: 'Trap groove', tempo: 140, tracks: 5, bars: 16, created: '2026-05-02', tags: ['trap', '808'] },
  { id: 'demo-3', name: 'Jazz swing', tempo: 110, tracks: 6, bars: 12, created: '2026-05-03', tags: ['jazz', 'swing'] },
];

export function GrooveboxLibrary() {
  const [patterns] = useState<Pattern[]>(DEMO_PATTERNS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = patterns.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags.some(t => t.includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="mb-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h5 className="mb-0">
            <i className="bi bi-collection me-2" />
            Pattern Library
          </h5>
          <small className="text-muted">
            Demos and saved patterns. Select one to load into the composer.
          </small>
        </div>
        <span className="badge bg-secondary">{patterns.length} patterns</span>
      </div>

      {/* Search */}
      <div className="mb-3">
        <div className="input-group input-group-sm">
          <span className="input-group-text">
            <i className="bi bi-search" />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search patterns..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Pattern list */}
      {filtered.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-inbox" style={{ fontSize: '2rem' }} />
          <p className="mt-2 mb-0 small">
            {searchQuery ? 'No patterns match your search.' : 'No patterns yet. Save one from the Compose tab.'}
          </p>
        </div>
      ) : (
        <div className="list-group list-group-flush mb-3" style={{ borderRadius: '6px', overflow: 'hidden' }}>
          {filtered.map(pattern => (
            <button
              key={pattern.id}
              className={`list-group-item list-group-item-action d-flex align-items-center gap-3 ${
                selectedId === pattern.id ? 'active' : ''
              }`}
              onClick={() => setSelectedId(pattern.id)}
              style={{
                background: selectedId === pattern.id ? 'var(--groovebox-accent-dim)' : 'var(--groovebox-bg-card)',
                borderColor: 'var(--groovebox-border)',
                color: selectedId === pattern.id ? 'var(--groovebox-accent)' : 'var(--groovebox-text)',
              }}
            >
              <i className="bi bi-file-earmark-music fs-5" />
              <div className="flex-grow-1 text-start">
                <div className="fw-semibold small">{pattern.name}</div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {pattern.tempo} BPM &middot; {pattern.tracks} tracks &middot; {pattern.bars} bars
                </div>
              </div>
              <div className="d-flex gap-1">
                {pattern.tags.map(tag => (
                  <span key={tag} className="badge bg-secondary" style={{ fontSize: '0.65rem' }}>
                    {tag}
                  </span>
                ))}
              </div>
              <small className="text-muted">{pattern.created}</small>
            </button>
          ))}
        </div>
      )}

      {/* Selected pattern actions */}
      {selectedId && (
        <div className="d-flex gap-2 mb-3">
          <button className="btn btn-sm btn-outline-primary">
            <i className="bi bi-download me-1" />
            Load into Composer
          </button>
          <button className="btn btn-sm btn-outline-secondary">
            <i className="bi bi-trash3 me-1" />
            Delete
          </button>
        </div>
      )}

      {/* Sounds & resources section */}
      <div className="border-top pt-3 mt-3">
        <h6 className="small fw-semibold mb-2">
          <i className="bi bi-speaker me-1" />
          Sounds & Resources
        </h6>
        <p className="small text-muted mb-0">
          Sample packs and instrument resources will plug in here; for now, patterns above carry tempo, tracks, and export hooks.
        </p>
      </div>
    </div>
  );
}

export default GrooveboxLibrary;
