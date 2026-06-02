import React, { useState, useEffect, useCallback } from 'react';
import { GrooveboxNav } from './GrooveboxNav';
import { GrooveboxComposer } from './GrooveboxComposer';
import { GrooveboxVault } from './GrooveboxVault';
import { GrooveboxLibrary } from './GrooveboxLibrary';
import { GrooveboxPlayback } from './GrooveboxPlayback';
import { GrooveboxExports } from './GrooveboxExports';
import { GrooveboxSongscribeBridge } from './GrooveboxSongscribeBridge';
import './styles/groovebox-surface.css';

type GrooveboxPage = 'composer' | 'vault' | 'library' | 'overview';

interface BootstrapStatus {
  songscribe: {
    cloned: boolean;
    running: boolean;
    commit: string | null;
    browser_url: string;
  };
  docker: {
    cli_on_path: boolean;
    compose_file_exists: boolean;
  };
  groovebox_startup: {
    docker_launch_status: string;
    hint: string;
  };
}

const API_BASE = '';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Accept': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

export function GrooveboxSurface() {
  const [page, setPage] = useState<GrooveboxPage>('composer');
  const [bootstrapStatus, setBootstrapStatus] = useState<BootstrapStatus | null>(null);
  const [songscribeEmbedOpen, setSongscribeEmbedOpen] = useState(false);

  const loadBootstrapStatus = useCallback(async () => {
    try {
      const status = await fetchJson<BootstrapStatus>('/api/bootstrap/status');
      setBootstrapStatus(status);
    } catch {
      // API unavailable
    }
  }, []);

  useEffect(() => {
    loadBootstrapStatus();
    const interval = setInterval(loadBootstrapStatus, 30000);
    return () => clearInterval(interval);
  }, [loadBootstrapStatus]);

  const handleNavigate = useCallback((target: string) => {
    if (target === 'songscribe') {
      const url = bootstrapStatus?.songscribe?.browser_url || 'http://127.0.0.1:3000';
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (target === 'home') {
      // Navigate to UI-Hub — dispatch event for USXD integration
      window.dispatchEvent(new CustomEvent('groovebox:navigate', { detail: { target: 'home' } }));
    } else {
      setPage(target as GrooveboxPage);
    }
  }, [bootstrapStatus]);

  const songscribeRunning = bootstrapStatus?.songscribe?.running ?? false;
  const songscribeCloned = bootstrapStatus?.songscribe?.cloned ?? false;

  return (
    <div className="groovebox-surface">
      <GrooveboxNav
        currentPage={page}
        onNavigate={handleNavigate}
        songscribeRunning={songscribeRunning}
        songscribeCloned={songscribeCloned}
        songscribeUrl={bootstrapStatus?.songscribe?.browser_url || 'http://127.0.0.1:3000'}
        songscribeEmbedOpen={songscribeEmbedOpen}
        onToggleSongscribeEmbed={() => setSongscribeEmbedOpen(!songscribeEmbedOpen)}
      />

      {songscribeEmbedOpen && (
        <div className="groovebox-embed-panel">
          <div className="groovebox-embed-toolbar">
            <span className="groovebox-embed-title">Songscribe</span>
            <button
              className="groovebox-btn groovebox-btn--sm"
              onClick={() => setSongscribeEmbedOpen(false)}
            >
              Close embed
            </button>
          </div>
          <iframe
            className="groovebox-embed-frame"
            src={bootstrapStatus?.songscribe?.browser_url || 'http://127.0.0.1:3000'}
            title="Songscribe"
            sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-popups"
            loading="lazy"
          />
        </div>
      )}

      <div className="groovebox-pages">
        {page === 'overview' && (
          <GrooveboxSongscribeBridge
            bootstrapStatus={bootstrapStatus}
            onRefresh={loadBootstrapStatus}
          />
        )}
        {page === 'vault' && <GrooveboxVault />}
        {page === 'library' && <GrooveboxLibrary />}
        {page === 'composer' && (
          <>
            <GrooveboxComposer />
            <GrooveboxPlayback />
            <GrooveboxExports />
          </>
        )}
      </div>
    </div>
  );
}

export default GrooveboxSurface;
