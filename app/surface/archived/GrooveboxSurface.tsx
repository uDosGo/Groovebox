import React, { useState, useEffect, useCallback } from 'react';
import { GrooveboxNav } from './GrooveboxNav';
import { GrooveboxComposer } from './GrooveboxComposer';
import { GrooveboxVault } from './GrooveboxVault';
import { GrooveboxLibrary } from './GrooveboxLibrary';
import { GrooveboxPlayback } from './GrooveboxPlayback';
import { GrooveboxExports } from './GrooveboxExports';
import { GrooveboxSongscribeBridge } from './GrooveboxSongscribeBridge';
import { SongscribeTab } from './components/SongscribeTab';
import { GrooveboxFilePicker } from './GrooveboxFilePicker';
import { useGrooveboxAPI } from './hooks/useGrooveboxAPI';
import './styles/groovebox-surface.css';

type GrooveboxPage = 'composer' | 'vault' | 'library' | 'overview' | 'songscribe';

export function GrooveboxSurface() {
  const [page, setPage] = useState<GrooveboxPage>('composer');
  const [filePickerOpen, setFilePickerOpen] = useState(false);
  const {
    bootstrapStatus,
    loading,
    refresh: loadBootstrapStatus,
    songscribeRunning,
    songscribeCloned,
    songscribeUrl,
  } = useGrooveboxAPI();

  const handleNavigate = useCallback((target: string) => {
    if (target === 'home') {
      window.dispatchEvent(new CustomEvent('groovebox:navigate', { detail: { target: 'home' } }));
    } else {
      setPage(target as GrooveboxPage);
    }
  }, []);

  const handleSelectFile = useCallback((rootId: string, path: string, content: string) => {
    // Dispatch custom event so composer can pick up the file content
    window.dispatchEvent(new CustomEvent('groovebox:load-file', {
      detail: { rootId, path, content },
    }));
  }, []);

  return (
    <div className="groovebox-surface">
      <GrooveboxNav
        currentPage={page}
        onNavigate={handleNavigate}
        songscribeRunning={songscribeRunning}
        songscribeCloned={songscribeCloned}
        songscribeUrl={songscribeUrl}
        onToggleFilePicker={() => setFilePickerOpen(prev => !prev)}
        filePickerOpen={filePickerOpen}
      />

      <div className="groovebox-body">
        {filePickerOpen && (
          <GrooveboxFilePicker
            onSelectFile={handleSelectFile}
            onClose={() => setFilePickerOpen(false)}
          />
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
          {page === 'songscribe' && (
            <SongscribeTab
              songscribeRunning={songscribeRunning}
              songscribeUrl={songscribeUrl}
              onNavigateToGroovebox={() => setPage('composer')}
            />
          )}
          {page === 'composer' && (
            <>
              <GrooveboxComposer />
              <GrooveboxPlayback />
              <GrooveboxExports />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default GrooveboxSurface;
