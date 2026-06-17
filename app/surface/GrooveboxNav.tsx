import React from 'react';

interface GrooveboxNavProps {
  currentPage: string;
  onNavigate: (target: string) => void;
  songscribeRunning: boolean;
  songscribeCloned: boolean;
  songscribeUrl: string;
  onToggleFilePicker?: () => void;
  filePickerOpen?: boolean;
}

const NAV_ITEMS = [
  { id: 'composer', label: 'Compose', icon: 'bi-music-note-beamed' },
  { id: 'vault', label: 'Vault', icon: 'bi-folder2-open' },
  { id: 'library', label: 'Library', icon: 'bi-collection' },
  { id: 'songscribe', label: 'Songscribe', icon: 'bi-mic' },
  { id: 'overview', label: 'Status', icon: 'bi-activity' },
];

export function GrooveboxNav({
  currentPage,
  onNavigate,
  songscribeRunning,
  songscribeCloned,
  songscribeUrl,
  onToggleFilePicker,
  filePickerOpen,
}: GrooveboxNavProps) {
  return (
    <header className="groovebox-nav" aria-label="Main">
      <div className="groovebox-nav-top">
        <div className="groovebox-nav-brand">
          <button
            className="groovebox-nav-home"
            onClick={() => window.location.href = 'http://localhost:5173'}
            title="Back to UI Hub"
            aria-label="Back to UI Hub"
          >
            <i className="bi bi-house-door-fill" />
          </button>
          <span className="groovebox-nav-title">GrooveBox888</span>
        </div>
        <nav className="groovebox-nav-links" aria-label="Pages">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`groovebox-nav-link${currentPage === item.id ? ' is-active' : ''}`}
              onClick={() => onNavigate(item.id)}
              title={item.id === 'songscribe' && !songscribeRunning ? 'Songscribe is offline' : item.label}
            >
              <i className={`bi ${item.icon} groovebox-nav-link-icon`} />
              <span className="groovebox-nav-link-label">{item.label}</span>
              {item.id === 'songscribe' && (
                <span className={`groovebox-nav-dot ${songscribeRunning ? 'dot-online' : 'dot-offline'}`} />
              )}
            </button>
          ))}
        </nav>
        {onToggleFilePicker && (
          <button
            className={`groovebox-nav-link groovebox-nav-filepicker-btn${filePickerOpen ? ' is-active' : ''}`}
            onClick={onToggleFilePicker}
            title="Toggle file picker sidebar"
            aria-label="Toggle file picker"
          >
            <i className="bi bi-folder-symlink" />
          </button>
        )}
      </div>
    </header>
  );
}

export default GrooveboxNav;
