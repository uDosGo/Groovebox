import { useState, useCallback } from 'react';

const SONGBSCRIBE_PROXY = '/api/songscribe';

interface TranscriptionResult {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  text?: string;
  notation?: string;
  mml?: string;
  midi_url?: string;
  error?: string;
}

interface SongscribeHealth {
  status: string;
  version?: string;
  uptime?: number;
}

export function useSongscribeAPI() {
  const [transcribing, setTranscribing] = useState(false);
  const [lastResult, setLastResult] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async (): Promise<SongscribeHealth | null> => {
    try {
      const res = await fetch(`${SONGBSCRIBE_PROXY}/health`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }, []);

  const transcribeAudio = useCallback(async (audioBlob: Blob, filename?: string): Promise<TranscriptionResult | null> => {
    setTranscribing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, filename || 'recording.webm');
      const res = await fetch(`${SONGBSCRIBE_PROXY}/transcribe`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(120000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const result: TranscriptionResult = await res.json();
      setLastResult(result);
      return result;
    } catch (err: any) {
      const msg = err.message || 'Transcription failed';
      setError(msg);
      return null;
    } finally {
      setTranscribing(false);
    }
  }, []);

  const transcribeUrl = useCallback(async (url: string): Promise<TranscriptionResult | null> => {
    setTranscribing(true);
    setError(null);
    try {
      const res = await fetch(`${SONGBSCRIBE_PROXY}/transcribe-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
        signal: AbortSignal.timeout(180000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const result: TranscriptionResult = await res.json();
      setLastResult(result);
      return result;
    } catch (err: any) {
      const msg = err.message || 'URL transcription failed';
      setError(msg);
      return null;
    } finally {
      setTranscribing(false);
    }
  }, []);

  const getTranscription = useCallback(async (id: string): Promise<TranscriptionResult | null> => {
    try {
      const res = await fetch(`${SONGBSCRIBE_PROXY}/transcription/${id}`, {
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }, []);

  const clearResult = useCallback(() => {
    setLastResult(null);
    setError(null);
  }, []);

  return {
    transcribing,
    lastResult,
    error,
    checkHealth,
    transcribeAudio,
    transcribeUrl,
    getTranscription,
    clearResult,
  };
}
