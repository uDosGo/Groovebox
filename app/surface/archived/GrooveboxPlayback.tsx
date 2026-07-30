import React, { useState } from 'react';

export function GrooveboxPlayback() {
  const [bpm, setBpm] = useState(122);
  const [transportState, setTransportState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [currentStep, setCurrentStep] = useState(0);

  const handlePlay = () => {
    setTransportState('playing');
    console.log('Playback started');
  };

  const handleStop = () => {
    setTransportState('idle');
    setCurrentStep(0);
    console.log('Playback stopped');
  };

  return (
    <div className="mb-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h5 className="mb-0">
            <i className="bi bi-play-circle me-2" />
            Playback
          </h5>
          <small className="text-muted">
            Control playback, tempo, and monitor the current step.
          </small>
        </div>
        <span className={`badge d-flex align-items-center gap-1 ${
          transportState === 'playing' ? 'bg-success' : transportState === 'paused' ? 'bg-warning' : 'bg-secondary'
        }`}>
          <i className={`bi ${
            transportState === 'playing' ? 'bi-play-fill' : transportState === 'paused' ? 'bi-pause-fill' : 'bi-stop-fill'
          }`} />
          {transportState}
        </span>
      </div>

      {/* Transport controls */}
      <div
        className="p-3 rounded mb-3"
        style={{
          background: 'var(--groovebox-bg-card)',
          border: '1px solid var(--groovebox-border)',
        }}
      >
        <div className="d-flex align-items-center gap-3 mb-3">
          <button
            className="btn btn-sm btn-outline-success"
            onClick={handlePlay}
            disabled={transportState === 'playing'}
          >
            <i className="bi bi-play-fill me-1" />
            Play
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={handleStop}
            disabled={transportState === 'idle'}
          >
            <i className="bi bi-stop-fill me-1" />
            Stop
          </button>
          <div className="ms-auto d-flex align-items-center gap-2">
            <label className="small text-muted mb-0">BPM</label>
            <input
              type="number"
              className="form-control form-control-sm"
              style={{ width: '80px' }}
              min={40}
              max={240}
              value={bpm}
              onChange={e => setBpm(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="d-flex align-items-center gap-4 small">
          <div>
            <span className="text-muted me-1">State</span>
            <strong className={transportState === 'playing' ? 'text-success' : ''}>
              {transportState}
            </strong>
          </div>
          <div>
            <span className="text-muted me-1">Step</span>
            <strong>{currentStep}</strong>
          </div>
          <div>
            <span className="text-muted me-1">BPM</span>
            <strong>{bpm}</strong>
          </div>
        </div>
      </div>

      {/* Master step grid placeholder */}
      <div
        className="p-3 rounded mb-3"
        style={{
          background: 'var(--groovebox-bg-card)',
          border: '1px solid var(--groovebox-border)',
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-2">
          <label className="form-label small fw-semibold mb-0">
            <i className="bi bi-grid-3x3-gap-fill me-1" />
            Master Step Grid
          </label>
        </div>
        <div
          id="master-step-grid"
          className="d-flex align-items-center justify-content-center"
          style={{
            minHeight: '60px',
            background: 'var(--groovebox-bg)',
            border: '1px dashed var(--groovebox-border)',
            borderRadius: '4px',
            color: 'var(--groovebox-text-muted)',
            fontSize: '0.8rem',
          }}
        >
          <i className="bi bi-music-note me-2" />
          Parse a spec to populate the step grid
        </div>
      </div>

      {/* Parse summary placeholder */}
      <div
        id="parse-summary"
        className="p-3 rounded mb-3"
        style={{
          background: 'var(--groovebox-bg-card)',
          border: '1px solid var(--groovebox-border)',
        }}
      >
        <label className="form-label small fw-semibold mb-2">
          <i className="bi bi-file-earmark-code me-1" />
          Parse Summary
        </label>
        <div className="text-muted small">
          <i className="bi bi-info-circle me-1" />
          No spec parsed yet. Write markdown in the Compose tab and click Parse.
        </div>
      </div>

      {/* Session summary placeholder */}
      <div
        id="session-summary"
        className="p-3 rounded mb-3"
        style={{
          background: 'var(--groovebox-bg-card)',
          border: '1px solid var(--groovebox-border)',
        }}
      >
        <label className="form-label small fw-semibold mb-2">
          <i className="bi bi-journal me-1" />
          Session Summary
        </label>
        <div className="text-muted small">
          <i className="bi bi-info-circle me-1" />
          No active session.
        </div>
      </div>

      {/* Pattern JSON placeholder */}
      <div className="mb-3">
        <label className="form-label small fw-semibold mb-2">
          <i className="bi bi-code-slash me-1" />
          Pattern JSON
        </label>
        <pre
          id="pattern-json"
          className="p-3 rounded font-monospace"
          style={{
            background: 'var(--groovebox-bg)',
            border: '1px solid var(--groovebox-border)',
            fontSize: '0.75rem',
            maxHeight: '200px',
            overflow: 'auto',
            margin: 0,
          }}
        >
          <span className="text-muted">// No compiled pattern yet</span>
        </pre>
      </div>

      {/* Channels placeholder */}
      <div
        id="channels"
        className="p-3 rounded"
        style={{
          background: 'var(--groovebox-bg-card)',
          border: '1px solid var(--groovebox-border)',
        }}
      >
        <label className="form-label small fw-semibold mb-2">
          <i className="bi bi-layers me-1" />
          Channels
        </label>
        <div className="text-muted small">
          <i className="bi bi-info-circle me-1" />
          No channels loaded. Compile a spec to see channel data.
        </div>
      </div>
    </div>
  );
}

export default GrooveboxPlayback;
