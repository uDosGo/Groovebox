import React, { useState, useEffect, useCallback } from 'react';
import './styles/songscribe-surface.css';

interface SongscribeStatus {
  running: boolean;
  port: number;
  url: string;
  version?: string;
}

interface VaultFile {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
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

export function SongscribeSurface() {
  const [status, setStatus] = useState<SongscribeStatus>({
    running: false,
    port: 3000,
    url: 'http://127.0.0.1:3000',
  });
  const [loading, setLoading] = useState(true);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [vaultFiles, setVaultFiles] = useState<VaultFile[]>([]);
  const [vaultPath, setVaultPath] = useState('');

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch('http://127.0.0.1:3000', {
        method: 'HEAD',
        signal: AbortSignal.timeout(3000),
      });
      setStatus({
        running: true,
        port: 3000,
        url: 'http://127.0.0.1:3000',
      });
    } catch {
      setStatus(prev => ({ ...prev, running: false }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  const handleNavigate = useCallback((target: string) => {
    if (target === 'groovebox') {
      window.dispatchEvent(new CustomEvent('songscribe:navigate', { detail: { target: 'groovebox' } }));
    } else if (target === 'home') {
      window.dispatchEvent(new CustomEvent('songscribe:navigate', { detail: { target: 'home' } }));
    } else if (target === 'vault') {
      setVaultOpen(!vaultOpen);
    }
  }, [vaultOpen]);

  const loadVaultFiles = useCallback(async (path: string = '') => {
    try {
      const data = await fetchJson<{ files: VaultFile[] }>(`/api/workspaces/tree?root_id=groovebox&path=${encodeURIComponent(path)}`);
      setVaultFiles(data.files || []);
      setVaultPath(path);
    } catch {
      // Vault API unavailable
    }
  }, []);

  useEffect(() => {
    if (vaultOpen) {
      loadVaultFiles();
    }
  }, [vaultOpen, loadVaultFiles]);

  return (
    <div className="songscribe-surface">
      <header className="songscribe-nav" aria-label="Main">
        <div className="songscribe-nav-top">
          <div className="songscribe-nav-brand">
            <button
              className="songscribe-nav-home"
              onClick={() => handleNavigate('home')}
              title="Back to UI Hub"
              aria-label="Back to UI Hub"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </button>
            <span className="songscribe-nav-title">Songscribe</span>
          </div>
          <nav className="songscribe-nav-links" aria-label="Pages">
            <button
              className="songscribe-nav-groovebox"
              onClick={() => handleNavigate('groovebox')}
              title="Open Groovebox"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 8 14 2 18 6 15 11 6 9"/>
                <path d="M5 14l4 4-4 4"/>
                <path d="M11 18h10"/>
              </svg>
              Groovebox
            </button>
            <button
              className="songscribe-nav-vault"
              onClick={() => handleNavigate('vault')}
              title="Vault Browser"
              style={{
                marginLeft: '8px',
                background: vaultOpen ? 'var(--groovebox-accent, #7c3aed)' : 'transparent',
                color: vaultOpen ? '#fff' : 'var(--groovebox-text-secondary, #8b949e)',
                border: '1px solid var(--groovebox-border, #30363d)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '4px' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
              Vault
            </button>
          </nav>
        </div>
      </header>

      <div className="songscribe-pages">
        <div className="songscribe-card songscribe-card--hero">
          <p className="songscribe-eyebrow">Songscribe</p>
          <h1 className="songscribe-page-title">
            Music transcription &mdash; powered by AI. Transcribe, edit, and export your music.
          </h1>
          <p className="songscribe-lede" style={{ marginTop: '12px' }}>
            {loading
              ? 'Checking Songscribe status...'
              : status.running
                ? 'Songscribe is running. Use the interface below to transcribe and edit music.'
                : 'Songscribe is not running. Start it from the Groovebox Status page or run `npm run dev` in ~/Code/Vendor/songscribe.'}
          </p>
        </div>

        {vaultOpen && (
          <div className="songscribe-card">
            <div className="songscribe-vault-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Vault Browser</h2>
              <button
                onClick={() => setVaultOpen(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--groovebox-border, #30363d)',
                  color: 'var(--groovebox-text-secondary, #8b949e)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <code style={{ fontSize: '0.8rem', color: 'var(--groovebox-text-secondary, #8b949e)' }}>
                {vaultPath || '/'}
              </code>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {vaultPath && (
                <button
                  onClick={() => loadVaultFiles(vaultPath.split('/').slice(0, -1).join('/'))}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--groovebox-accent, #7c3aed)',
                    textAlign: 'left',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  .. (up)
                </button>
              )}
              {vaultFiles.map(file => (
                <div
                  key={file.path}
                  onClick={() => file.type === 'directory' && loadVaultFiles(file.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: file.type === 'directory' ? 'pointer' : 'default',
                    fontSize: '0.85rem',
                    color: 'var(--groovebox-text, #e1e4e8)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--groovebox-bg-hover, #1c2333)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span>{file.type === 'directory' ? '📁' : '📄'}</span>
                  <span>{file.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {status.running && (
          <div className="songscribe-iframe-container">
            <iframe
              className="songscribe-iframe"
              src={status.url}
              title="Songscribe"
              sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-popups"
              loading="lazy"
            />
          </div>
        )}

        {!status.running && !loading && (
          <div className="songscribe-card">
            <h2>Songscribe is offline</h2>
            <p className="songscribe-lede" style={{ marginTop: '8px' }}>
              To start Songscribe, open the Groovebox Status page and click "Start Songscribe",
              or run the following in your terminal:
            </p>
            <pre style={{
              background: '#1e1e1e',
              color: '#d4d4d4',
              padding: '16px',
              borderRadius: '12px',
              marginTop: '12px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: '0.85rem',
              overflowX: 'auto',
            }}>
              cd ~/Code/Vendor/songscribe{'\n'}npm install{'\n'}npm run dev
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default SongscribeSurface;
