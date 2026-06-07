import React, { useState, useCallback } from 'react';

interface VaultItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
}

const DEMO_ROOTS = [
  { id: 'groovebox', label: 'Groovebox', path: '/Users/fredbook/Code/Groovebox' },
  { id: 'devstudio', label: 'DevStudio', path: '/Users/fredbook/Code/DevStudio' },
];

const DEMO_TREE: VaultItem[] = [
  { name: 'sessions', path: '/sessions', type: 'directory' },
  { name: 'patterns', path: '/patterns', type: 'directory' },
  { name: 'exports', path: '/exports', type: 'directory' },
  { name: 'demo-groovebox.md', path: '/demo-groovebox.md', type: 'file', size: 2048 },
  { name: 'four-on-floor.md', path: '/four-on-floor.md', type: 'file', size: 1536 },
  { name: 'trap-groove.md', path: '/trap-groove.md', type: 'file', size: 1892 },
];

export function GrooveboxVault() {
  const [selectedRoot, setSelectedRoot] = useState(DEMO_ROOTS[0].id);
  const [currentPath, setCurrentPath] = useState('.');
  const [tree] = useState<VaultItem[]>(DEMO_TREE);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleNavigateUp = useCallback(() => {
    setCurrentPath(prev => {
      const parts = prev.split('/').filter(Boolean);
      return parts.length > 1 ? parts.slice(0, -1).join('/') : '.';
    });
  }, []);

  const handleItemClick = useCallback((item: VaultItem) => {
    if (item.type === 'directory') {
      setCurrentPath(prev => `${prev === '.' ? '' : prev}/${item.name}`);
    } else {
      setSelectedFile(prev => prev === item.path ? null : item.path);
    }
  }, []);

  const formatSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className="mb-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h5 className="mb-0">
            <i className="bi bi-folder2-open me-2" />
            Vault Browser
          </h5>
          <small className="text-muted">
            Pick a workspace root, browse folders, then load a file into the composer.
          </small>
        </div>
      </div>

      {/* Toolbar */}
      <div className="d-flex align-items-center gap-2 mb-3">
        <div className="flex-grow-1">
          <label className="visually-hidden" htmlFor="root-select">Workspace root</label>
          <select
            id="root-select"
            className="form-select form-select-sm"
            value={selectedRoot}
            onChange={e => { setSelectedRoot(e.target.value); setCurrentPath('.'); }}
          >
            {DEMO_ROOTS.map(r => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
        </div>
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={handleNavigateUp}
          disabled={currentPath === '.'}
          title="Go up one directory"
        >
          <i className="bi bi-arrow-up me-1" />
          Up
        </button>
      </div>

      {/* Current path */}
      <div className="mb-3">
        <code className="small px-2 py-1 d-inline-block" style={{
          background: 'var(--groovebox-bg)',
          border: '1px solid var(--groovebox-border)',
          borderRadius: '4px',
          color: 'var(--groovebox-accent)',
        }}>
          <i className="bi bi-folder me-1" />
          {currentPath}
        </code>
      </div>

      {/* File tree */}
      {tree.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-folder2-open" style={{ fontSize: '2rem' }} />
          <p className="mt-2 mb-0 small">This directory is empty.</p>
        </div>
      ) : (
        <div className="list-group list-group-flush mb-3" style={{ borderRadius: '6px', overflow: 'hidden' }}>
          {tree.map(item => (
            <button
              key={item.path}
              className={`list-group-item list-group-item-action d-flex align-items-center gap-3 ${
                selectedFile === item.path ? 'active' : ''
              }`}
              onClick={() => handleItemClick(item)}
              style={{
                background: selectedFile === item.path ? 'var(--groovebox-accent-dim)' : 'var(--groovebox-bg-card)',
                borderColor: 'var(--groovebox-border)',
                color: selectedFile === item.path ? 'var(--groovebox-accent)' : 'var(--groovebox-text)',
              }}
            >
              <i className={`bi ${item.type === 'directory' ? 'bi-folder' : 'bi-file-earmark-music'} fs-5`} />
              <div className="flex-grow-1 text-start">
                <div className="fw-semibold small">{item.name}</div>
                {item.size && (
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {formatSize(item.size)}
                  </div>
                )}
              </div>
              <span className="badge bg-secondary" style={{ fontSize: '0.65rem' }}>
                {item.type}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Selected file actions */}
      {selectedFile && (
        <div className="d-flex gap-2 mb-3">
          <button className="btn btn-sm btn-outline-primary">
            <i className="bi bi-download me-1" />
            Load into Composer
          </button>
          <button className="btn btn-sm btn-outline-secondary">
            <i className="bi bi-eye me-1" />
            Preview
          </button>
        </div>
      )}

      {/* Hint */}
      <div className="small text-muted border-top pt-2">
        <i className="bi bi-info-circle me-1" />
        Open <a href="#composer" className="text-decoration-none" style={{ color: 'var(--groovebox-accent)' }}>Compose</a> to edit the loaded path and markdown.
      </div>
    </div>
  );
}

export default GrooveboxVault;
