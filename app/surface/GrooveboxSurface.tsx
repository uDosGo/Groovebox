import React, { useState, useEffect, useCallback } from 'react';
import { GrooveboxNav } from './GrooveboxNav';
import { GrooveboxComposer } from './GrooveboxComposer';
import { GrooveboxVault } from './GrooveboxVault';
import { GrooveboxLibrary } from './GrooveboxLibrary';
import { GrooveboxPlayback } from './GrooveboxPlayback';
import { GrooveboxExports } from './GrooveboxExports';
import { GrooveboxSongscribeBridge } from './GrooveboxSongscribeBridge';
import { SongscribeTab } from './components/SongscribeTab';
import { useGrooveboxAPI } from './hooks/useGrooveboxAPI';
import './styles/groovebox-surface.css';

type GrooveboxPage = 'composer' | 'vault' | 'library' | 'overview' | 'songscribe';

export function GrooveboxSurface() {
  const [page, setPage] = useState<GrooveboxPage>('composer');
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

  return (
    <div className="groovebox-surface">
      <GrooveboxNav
        currentPage={page}
        onNavigate={handleNavigate}
        songscribeRunning={songscribeRunning}
        songscribeCloned={songscribeCloned}
        songscribeUrl={songscribeUrl}
      />

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
  );
}

export default GrooveboxSurface;
