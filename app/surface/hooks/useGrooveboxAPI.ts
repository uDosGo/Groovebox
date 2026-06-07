import { useState, useEffect, useCallback } from 'react';

const API_BASE = '';

export interface BootstrapStatus {
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

export interface VaultFile {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
}

export interface WorkspaceRoot {
  id: string;
  label: string;
  path: string;
  kind: string;
}

export interface ParsedSpec {
  title: string;
  tempo: number;
  tracks: any[];
  fences: any[];
  bars: number;
  arrangement_bars: number;
  supported_exports: string[];
}

export interface CompiledPattern {
  title: string;
  tempo: number;
  tracks: any[];
  arrangement: any[];
  sections: any[];
  timeline: any;
}

export interface PlaybackPreview {
  transport: {
    step_count: number;
    step_duration_seconds: number;
  };
  channels: any[];
}

export interface SongscribeStatus {
  running: boolean;
  port: number;
  url: string;
  version?: string;
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

export function useGrooveboxAPI() {
  const [bootstrapStatus, setBootstrapStatus] = useState<BootstrapStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBootstrapStatus = useCallback(async () => {
    try {
      const status = await fetchJson<BootstrapStatus>('/api/bootstrap/status');
      setBootstrapStatus(status);
    } catch {
      // API unavailable
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBootstrapStatus();
    const interval = setInterval(loadBootstrapStatus, 30000);
    return () => clearInterval(interval);
  }, [loadBootstrapStatus]);

  const getWorkspaceRoots = useCallback(async (): Promise<WorkspaceRoot[]> => {
    try {
      const data = await fetchJson<{ roots: WorkspaceRoot[] }>('/api/workspaces/roots');
      return data.roots || [];
    } catch {
      return [];
    }
  }, []);

  const getWorkspaceTree = useCallback(async (rootId: string, path: string = ''): Promise<VaultFile[]> => {
    try {
      const data = await fetchJson<{ children: VaultFile[] }>(
        `/api/workspaces/tree?root_id=${encodeURIComponent(rootId)}&path=${encodeURIComponent(path)}`
      );
      return data.children || [];
    } catch {
      return [];
    }
  }, []);

  const readWorkspaceFile = useCallback(async (rootId: string, path: string): Promise<string | null> => {
    try {
      const data = await fetchJson<{ content: string }>(
        `/api/workspaces/file?root_id=${encodeURIComponent(rootId)}&path=${encodeURIComponent(path)}`
      );
      return data.content || null;
    } catch {
      return null;
    }
  }, []);

  const writeWorkspaceFile = useCallback(async (rootId: string, path: string, content: string): Promise<boolean> => {
    try {
      await fetchJson('/api/workspaces/file', {
        method: 'PUT',
        body: JSON.stringify({ root_id: rootId, path, content }),
      });
      return true;
    } catch {
      return false;
    }
  }, []);

  const parseSpec = useCallback(async (markdown: string): Promise<ParsedSpec | null> => {
    try {
      return await fetchJson<ParsedSpec>('/api/spec/parse', {
        method: 'POST',
        body: JSON.stringify({ markdown }),
      });
    } catch {
      return null;
    }
  }, []);

  const compileSpec = useCallback(async (markdown: string): Promise<CompiledPattern | null> => {
    try {
      return await fetchJson<CompiledPattern>('/api/spec/compile', {
        method: 'POST',
        body: JSON.stringify({ markdown }),
      });
    } catch {
      return null;
    }
  }, []);

  const previewPlayback = useCallback(async (markdown: string): Promise<PlaybackPreview | null> => {
    try {
      return await fetchJson<PlaybackPreview>('/api/playback/preview', {
        method: 'POST',
        body: JSON.stringify({ markdown }),
      });
    } catch {
      return null;
    }
  }, []);

  const exportMidi = useCallback(async (markdown: string): Promise<any> => {
    return fetchJson('/api/exports/midi/file', {
      method: 'POST',
      body: JSON.stringify({ markdown }),
    });
  }, []);

  const exportWav = useCallback(async (markdown: string): Promise<any> => {
    return fetchJson('/api/exports/wav/file', {
      method: 'POST',
      body: JSON.stringify({ markdown }),
    });
  }, []);

  const exportNotation = useCallback(async (markdown: string): Promise<any> => {
    return fetchJson('/api/exports/notation/file', {
      method: 'POST',
      body: JSON.stringify({ markdown }),
    });
  }, []);

  const exportMml = useCallback(async (markdown: string): Promise<any> => {
    return fetchJson('/api/exports/mml/file', {
      method: 'POST',
      body: JSON.stringify({ markdown }),
    });
  }, []);

  const exportMusicxml = useCallback(async (markdown: string): Promise<any> => {
    return fetchJson('/api/exports/musicxml/file', {
      method: 'POST',
      body: JSON.stringify({ markdown }),
    });
  }, []);

  const saveSession = useCallback(async (name: string, markdown: string): Promise<any> => {
    return fetchJson('/api/sessions/save', {
      method: 'POST',
      body: JSON.stringify({ name, markdown }),
    });
  }, []);

  const savePattern = useCallback(async (name: string, markdown: string): Promise<any> => {
    return fetchJson('/api/patterns/save', {
      method: 'POST',
      body: JSON.stringify({ name, markdown }),
    });
  }, []);

  const checkSongscribeStatus = useCallback(async (): Promise<SongscribeStatus> => {
    try {
      const res = await fetch('http://127.0.0.1:3000', {
        method: 'HEAD',
        signal: AbortSignal.timeout(3000),
      });
      return { running: true, port: 3000, url: 'http://127.0.0.1:3000' };
    } catch {
      return { running: false, port: 3000, url: 'http://127.0.0.1:3000' };
    }
  }, []);

  const songscribeRunning = bootstrapStatus?.songscribe?.running ?? false;
  const songscribeCloned = bootstrapStatus?.songscribe?.cloned ?? false;
  const songscribeUrl = bootstrapStatus?.songscribe?.browser_url || 'http://127.0.0.1:3000';

  return {
    bootstrapStatus,
    loading,
    refresh: loadBootstrapStatus,
    songscribeRunning,
    songscribeCloned,
    songscribeUrl,
    getWorkspaceRoots,
    getWorkspaceTree,
    readWorkspaceFile,
    writeWorkspaceFile,
    parseSpec,
    compileSpec,
    previewPlayback,
    exportMidi,
    exportWav,
    exportNotation,
    exportMml,
    exportMusicxml,
    saveSession,
    savePattern,
    checkSongscribeStatus,
  };
}
