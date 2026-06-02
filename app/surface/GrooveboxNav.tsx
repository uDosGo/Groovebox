import React from 'react';

interface GrooveboxNavProps {
  currentPage: string;
  onNavigate: (target: string) => void;
  songscribeRunning: boolean;
  songscribeCloned: boolean;
  songscribeUrl: string;
  songscribeEmbedOpen: boolean;
  onToggleSongscribeEmbed: () => void;
}

const NAV_ITEMS = [
  { id: 'composer', label: 'Compose' },
  { id: 'vault', label: 'Vault' },
  { id: 'library', label: 'Library' },
  { id: 'overview', label: 'Status' },
  { id: 'songscribe', label: 'Songscribe', external: true },
  { id: 'usxd', label: 'USXD', external: true },
];

export function GrooveboxNav({
  currentPage,
  onNavigate,
  songscribeRunning,
  songscribeCloned,
  songscribeUrl,
  songscribeEmbedOpen,
  onToggleSongscribeEmbed,
}: GrooveboxNavProps) {
  return (
    <header className="groovebox-nav" aria-label="Main">
      <div className="groovebox-nav-top">
        <div className="groovebox-nav-brand">
          <button
            className="groovebox-nav-home"
            onClick={() => onNavigate('home')}
            title="Back to UI Hub"
            aria-label="Back to UI Hub"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </button>
          <span className="groovebox-nav-title">GrooveBox888</span>
        </div>
        <nav className="groovebox-nav-links" aria-label="Pages">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`groovebox-nav-link${currentPage === item.id ? ' is-active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <details className="groovebox-nav-songscribe" open>
        <summary className="groovebox-nav-songscribe-summary">
          <span className="groovebox-nav-songscribe-label">Songscribe</span>
          <strong className="groovebox-nav-songscribe-status">
            {songscribeRunning ? 'Running' : songscribeCloned ? 'Installed' : 'Not installed'}
          </strong>
        </summary>
        <div className="groovebox-nav-songscribe-body">
          <button
            className="groovebox-btn groovebox-btn--sm"
            onClick={() => onNavigate('songscribe')}
            disabled={!songscribeRunning}
          >
            Open
          </button>
          <div className="groovebox-nav-docker">
            <button
              className="groovebox-btn groovebox-btn--sm"
              onClick={onToggleSongscribeEmbed}
              disabled={!songscribeRunning}
              title="Show Songscribe inside Groovebox"
            >
              {songscribeEmbedOpen ? 'Close embed' : 'Embed'}
            </button>
          </div>
        </div>
      </details>
    </header>
  );
}

export default GrooveboxNav;
