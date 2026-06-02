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

  return (
    <div className="groovebox-card groovebox-card--hero">
      <p className="groovebox-eyebrow">GrooveBox888</p>
      <h1 className="groovebox-page-title">
        Vault-driven music specs, Songscribe bridge, and backend-timed playback in one local surface.
      </h1>
    </div>
  );
}

export default GrooveboxSongscribeBridge;
