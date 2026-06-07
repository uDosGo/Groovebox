import React from 'react';

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

interface GrooveboxSongscribeBridgeProps {
  bootstrapStatus: BootstrapStatus | null;
  onRefresh: () => void;
}

export function GrooveboxSongscribeBridge({ bootstrapStatus, onRefresh }: GrooveboxSongscribeBridgeProps) {
  const ss = bootstrapStatus?.songscribe;
  const docker = bootstrapStatus?.docker;
  const startup = bootstrapStatus?.groovebox_startup;

  const statusItems = [
    {
      label: 'Songscribe',
      icon: 'bi-mic',
      status: ss?.running ? 'running' : ss?.cloned ? 'cloned' : 'not-setup',
      detail: ss?.running
        ? `Running on ${ss.browser_url}`
        : ss?.cloned
          ? `Cloned (commit: ${ss?.commit?.slice(0, 7) || 'unknown'})`
          : 'Not cloned',
    },
    {
      label: 'Docker CLI',
      icon: 'bi-box',
      status: docker?.cli_on_path ? 'ok' : 'missing',
      detail: docker?.cli_on_path ? 'Available on PATH' : 'Not found on PATH',
    },
    {
      label: 'Compose File',
      icon: 'bi-file-earmark-code',
      status: docker?.compose_file_exists ? 'ok' : 'missing',
      detail: docker?.compose_file_exists ? 'Found' : 'Not found',
    },
    {
      label: 'Startup',
      icon: 'bi-rocket-takeoff',
      status: startup?.docker_launch_status === 'ok' ? 'ok' : startup?.docker_launch_status === 'launching' ? 'launching' : 'unknown',
      detail: startup?.hint || 'No startup info',
    },
  ];

  const statusColor = (s: string) => {
    switch (s) {
      case 'running': case 'ok': return 'success';
      case 'launching': case 'cloned': return 'warning';
      default: return 'danger';
    }
  };

  const statusIcon = (s: string) => {
    switch (s) {
      case 'running': case 'ok': return 'bi-check-circle-fill';
      case 'launching': case 'cloned': return 'bi-exclamation-circle-fill';
      default: return 'bi-x-circle-fill';
    }
  };

  return (
    <div className="mb-4">
      {/* Hero header */}
      <div className="mb-4">
        <p className="small text-muted text-uppercase fw-semibold mb-1" style={{ letterSpacing: '0.05em' }}>
          <i className="bi bi-music-note-beamed me-1" />
          GrooveBox888
        </p>
        <h5 className="mb-1">
          Vault-driven music specs, Songscribe bridge, and backend-timed playback in one local surface.
        </h5>
        <p className="small text-muted mb-0">
          Status overview for all Groovebox services and dependencies.
        </p>
      </div>

      {/* Status cards */}
      <div className="row g-2 mb-4">
        {statusItems.map(item => (
          <div key={item.label} className="col-sm-6 col-lg-3">
            <div
              className="d-flex align-items-start gap-3 p-3 rounded"
              style={{
                background: 'var(--groovebox-bg-card)',
                border: '1px solid var(--groovebox-border)',
                height: '100%',
              }}
            >
              <div
                className={`d-flex align-items-center justify-content-center rounded flex-shrink-0`}
                style={{
                  width: '36px',
                  height: '36px',
                  background: `rgba(var(--bs-${statusColor(item.status)}-rgb), 0.1)`,
                  color: `var(--bs-${statusColor(item.status)})`,
                }}
              >
                <i className={`bi ${item.icon}`} />
              </div>
              <div className="min-width-0">
                <div className="fw-semibold small">{item.label}</div>
                <div className="d-flex align-items-center gap-1 mt-1">
                  <i
                    className={`bi ${statusIcon(item.status)}`}
                    style={{ fontSize: '0.6rem', color: `var(--bs-${statusColor(item.status)})` }}
                  />
                  <span className="small" style={{ color: `var(--bs-${statusColor(item.status)})` }}>
                    {item.status}
                  </span>
                </div>
                <div className="text-muted" style={{ fontSize: '0.7rem', marginTop: '2px' }}>
                  {item.detail}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Refresh button */}
      <div className="d-flex align-items-center gap-2 mb-3">
        <button className="btn btn-sm btn-outline-secondary" onClick={onRefresh}>
          <i className="bi bi-arrow-clockwise me-1" />
          Refresh status
        </button>
        {!bootstrapStatus && (
          <small className="text-muted">
            <i className="bi bi-hourglass-split me-1" />
            Loading...
          </small>
        )}
      </div>

      {/* Raw status */}
      {bootstrapStatus && (
        <details className="small">
          <summary className="text-muted" style={{ cursor: 'pointer' }}>
            <i className="bi bi-json me-1" />
            Raw status JSON
          </summary>
          <pre
            className="mt-2 p-2 rounded font-monospace"
            style={{
              background: 'var(--groovebox-bg)',
              border: '1px solid var(--groovebox-border)',
              fontSize: '0.7rem',
              maxHeight: '200px',
              overflow: 'auto',
            }}
          >
            {JSON.stringify(bootstrapStatus, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

export default GrooveboxSongscribeBridge;
