import React, { useState, useEffect, useCallback } from 'react';
import { DropPanel, DropFile, DropPanelAction } from './DropPanel';
import { useSongscribeAPI } from '../hooks/useSongscribeAPI';

interface SongscribeTabProps {
  songscribeRunning: boolean;
  songscribeUrl: string;
  onNavigateToGroovebox?: () => void;
}

export function SongscribeTab({ songscribeRunning, songscribeUrl, onNavigateToGroovebox }: SongscribeTabProps) {
  const {
    transcribing,
    lastResult,
    error: apiError,
    checkHealth,
    transcribeAudio,
    transcribeUrl,
    clearResult,
  } = useSongscribeAPI();

  const [health, setHealth] = useState<{ status: string; version?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'transcribe' | 'results' | 'settings'>('transcribe');
  const [notation, setNotation] = useState('');
  const [editingNotation, setEditingNotation] = useState(false);

  useEffect(() => {
    if (songscribeRunning) {
      checkHealth().then(h => setHealth(h));
    }
  }, [songscribeRunning, checkHealth]);

  const handleTranscribeFiles = useCallback(async (files: DropFile[]) => {
    for (const file of files) {
      if (file.source === 'url' && file.url) {
        await transcribeUrl(file.url);
      } else if (file.blob) {
        await transcribeAudio(file.blob, file.name);
      }
    }
    setActiveTab('results');
  }, [transcribeAudio, transcribeUrl]);

  const dropActions: DropPanelAction[] = [
    {
      id: 'transcribe',
      label: 'Transcribe',
      icon: 'bi-music-note',
      description: 'Transcribe audio files or URLs to music notation',
      handler: handleTranscribeFiles,
    },
  ];

  const handleCopyNotation = useCallback(() => {
    if (lastResult?.notation) {
      navigator.clipboard.writeText(lastResult.notation);
    }
  }, [lastResult]);

  const handleSaveToVault = useCallback(async () => {
    if (!lastResult?.notation) return;
    window.dispatchEvent(new CustomEvent('songscribe:save', {
      detail: {
        notation: lastResult.notation,
        mml: lastResult.mml,
        title: `transcription-${lastResult.id}`,
      },
    }));
  }, [lastResult]);

  return (
    <div className="songscribe-tab">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h5 className="mb-1">
            <i className="bi bi-mic me-2" />
            Songscribe
          </h5>
          <small className="text-muted">
            {songscribeRunning
              ? <span className="text-success"><i className="bi bi-circle-fill me-1" style={{ fontSize: '0.5rem' }} />Connected</span>
              : <span className="text-warning"><i className="bi bi-circle-fill me-1" style={{ fontSize: '0.5rem' }} />Offline</span>
            }
            {health?.version && <span className="ms-2 badge bg-secondary">v{health.version}</span>}
          </small>
        </div>
        <div className="d-flex gap-2">
          {onNavigateToGroovebox && (
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={onNavigateToGroovebox}
            >
              <i className="bi bi-arrow-left me-1" />
              Groovebox
            </button>
          )}
          {songscribeRunning && (
            <a
              href={songscribeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-primary"
            >
              <i className="bi bi-box-arrow-up-right me-1" />
              Open standalone
            </a>
          )}
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs nav-fill mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'transcribe' ? 'active' : ''}`}
            onClick={() => setActiveTab('transcribe')}
          >
            <i className="bi bi-upload me-1" />
            Transcribe
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
            disabled={!lastResult}
          >
            <i className="bi bi-file-text me-1" />
            Results
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <i className="bi bi-gear me-1" />
            Settings
          </button>
        </li>
      </ul>

      {/* Transcribe tab */}
      {activeTab === 'transcribe' && (
        <div>
          {!songscribeRunning ? (
            <div className="alert alert-warning d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-triangle-fill" />
              <div>
                <strong>Songscribe is offline.</strong>
                <p className="mb-0 mt-1 small">
                  Start Songscribe from the Groovebox Status page or run the Songscribe container.
                </p>
              </div>
            </div>
          ) : (
            <DropPanel
              actions={dropActions}
              maxFiles={5}
              maxSizeMB={50}
              onError={err => console.error('DropPanel error:', err)}
            />
          )}

          {apiError && (
            <div className="alert alert-danger mt-3 mb-0 py-2 small d-flex align-items-center gap-2">
              <i className="bi bi-x-circle-fill" />
              {apiError}
            </div>
          )}
        </div>
      )}

      {/* Results tab */}
      {activeTab === 'results' && lastResult && (
        <div>
          {/* Status badge */}
          <div className="d-flex align-items-center gap-3 mb-4">
            <span className={`badge bg-${lastResult.status === 'completed' ? 'success' : lastResult.status === 'error' ? 'danger' : 'warning'} d-flex align-items-center gap-1`}>
              <i className={`bi ${lastResult.status === 'completed' ? 'bi-check-circle' : lastResult.status === 'error' ? 'bi-x-circle' : 'bi-hourglass-split'}`} />
              {lastResult.status}
            </span>
            {transcribing && (
              <div className="d-flex align-items-center gap-2">
                <div className="spinner-border spinner-border-sm" role="status" />
                <small className="text-muted">Transcribing...</small>
              </div>
            )}
          </div>

          {/* Error */}
          {lastResult.error && (
            <div className="alert alert-danger py-2 small d-flex align-items-center gap-2">
              <i className="bi bi-x-circle-fill" />
              {lastResult.error}
            </div>
          )}

          {/* Notation */}
          {lastResult.notation && (
            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <label className="form-label small fw-semibold mb-0">
                  <i className="bi bi-music-note me-1" />
                  Notation
                </label>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-secondary" onClick={handleCopyNotation}>
                    <i className="bi bi-clipboard me-1" />
                    Copy
                  </button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditingNotation(!editingNotation)}>
                    <i className={`bi ${editingNotation ? 'bi-eye' : 'bi-pencil'} me-1`} />
                    {editingNotation ? 'Preview' : 'Edit'}
                  </button>
                  <button className="btn btn-sm btn-outline-primary" onClick={handleSaveToVault}>
                    <i className="bi bi-folder-plus me-1" />
                    Save to Vault
                  </button>
                </div>
              </div>
              {editingNotation ? (
                <textarea
                  className="form-control form-control-sm font-monospace"
                  rows={8}
                  value={notation || lastResult.notation}
                  onChange={e => setNotation(e.target.value)}
                />
              ) : (
                <pre className="songscribe-notation-preview">
                  {lastResult.notation}
                </pre>
              )}
            </div>
          )}

          {/* MML */}
          {lastResult.mml && (
            <div className="mb-4">
              <label className="form-label small fw-semibold mb-2">
                <i className="bi bi-code-slash me-1" />
                MML
              </label>
              <pre className="songscribe-notation-preview" style={{ fontSize: '0.75rem' }}>
                {lastResult.mml}
              </pre>
            </div>
          )}

          {/* MIDI download */}
          {lastResult.midi_url && (
            <div className="mb-4">
              <a
                href={lastResult.midi_url}
                className="btn btn-sm btn-outline-success"
                download
              >
                <i className="bi bi-download me-1" />
                Download MIDI
              </a>
            </div>
          )}

          {/* Clear */}
          <button className="btn btn-sm btn-outline-secondary" onClick={clearResult}>
            <i className="bi bi-trash3 me-1" />
            Clear results
          </button>
        </div>
      )}

      {/* Settings tab */}
      {activeTab === 'settings' && (
        <div>
          <div className="mb-4">
            <label className="form-label small fw-semibold">
              <i className="bi bi-link-45deg me-1" />
              Songscribe URL
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={songscribeUrl}
              readOnly
            />
          </div>
          <div className="mb-4">
            <label className="form-label small fw-semibold">
              <i className="bi bi-info-circle me-1" />
              Status
            </label>
            <div>
              <span className={`badge bg-${songscribeRunning ? 'success' : 'warning'} d-inline-flex align-items-center gap-1`}>
                <i className={`bi ${songscribeRunning ? 'bi-check-circle' : 'bi-exclamation-circle'}`} />
                {songscribeRunning ? 'Running' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="small text-muted border-top pt-3 mt-3">
            <p className="mb-1">
              <i className="bi bi-info-circle me-1" />
              Songscribe provides AI-powered music transcription.
            </p>
            <p className="mb-0">
              Drop audio files or YouTube URLs to transcribe them into notation, MML, and MIDI.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SongscribeTab;
