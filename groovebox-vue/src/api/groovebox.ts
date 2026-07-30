/**
 * @module api/groovebox
 * @description Typed Groovebox API functions — mirrors FastAPI backend routes.
 */
import { api } from './client';
import type {
  BootstrapStatus,
  WorkspaceRoot,
  WorkspaceTreeResponse,
  PatternDocument,
  CompiledPattern,
  PlaybackPreview,
  LibraryEntry,
  SongscribeStatus,
  SongscribeDockerInfo,
  RuntimeStatus,
  ExportResult,
} from '../types';

// ── Health & Bootstrap ──────────────────────────────────────────

export function fetchHealth(): Promise<{ status: string; service: string; version: string }> {
  return api.get('/health');
}

export function fetchBootstrapStatus(): Promise<BootstrapStatus> {
  return api.get('/bootstrap/status');
}

// ── Songscribe Docker Control ───────────────────────────────────

export function fetchSongscribeDocker(): Promise<SongscribeDockerInfo> {
  return api.get('/songscribe/docker');
}

export function startSongscribeDocker(): Promise<{ message: string; running: boolean }> {
  return api.post('/songscribe/docker/start');
}

export function stopSongscribeDocker(): Promise<{ message: string; running: boolean }> {
  return api.post('/songscribe/docker/stop');
}

// ── Songscribe Runtime ──────────────────────────────────────────

export function fetchSongscribeRuntime(): Promise<RuntimeStatus> {
  return api.get('/songscribe/runtime');
}

export function startSongscribeRuntime(mode: string = 'local'): Promise<RuntimeStatus> {
  return api.post(`/songscribe/runtime/start?mode=${mode}`);
}

export function stopSongscribeRuntime(mode: string = 'local'): Promise<RuntimeStatus> {
  return api.post(`/songscribe/runtime/stop?mode=${mode}`);
}

// ── Songscribe Status & Bridge ──────────────────────────────────

export function fetchSongscribeStatus(): Promise<SongscribeStatus> {
  return api.get('/songscribe/status');
}

export function bridgeSongscribe(markdown: string): Promise<{
  songscribe: SongscribeStatus;
  pattern: CompiledPattern;
  playback: PlaybackPreview;
}> {
  return api.post('/songscribe/bridge', { markdown });
}

// ── Workspaces ──────────────────────────────────────────────────

export function fetchWorkspaces(): Promise<{ roots: WorkspaceRoot[] }> {
  return api.get('/workspaces/roots');
}

export function fetchWorkspaceTree(rootId: string, path: string = ''): Promise<WorkspaceTreeResponse> {
  const encoded = encodeURIComponent(path);
  return api.get(`/workspaces/tree?root_id=${rootId}&path=${encoded}`);
}

export function fetchWorkspaceFile(rootId: string, path: string): Promise<{
  root_id: string;
  path: string;
  content: string;
  size: number;
}> {
  const encoded = encodeURIComponent(path);
  return api.get(`/workspaces/file?root_id=${rootId}&path=${encoded}`);
}

export function writeWorkspaceFile(rootId: string, path: string, content: string): Promise<{
  root_id: string;
  path: string;
  saved: boolean;
}> {
  return api.put('/workspaces/file', { root_id: rootId, path, content });
}

// ── Patterns ────────────────────────────────────────────────────

export function fetchPatterns(): Promise<{ library: LibraryEntry[] }> {
  return api.get('/patterns');
}

export function fetchPattern(patternId: string): Promise<PatternDocument & {
  compiled: CompiledPattern;
  playback: PlaybackPreview;
}> {
  return api.get(`/patterns/${patternId}`);
}

export function savePattern(name: string, markdown: string): Promise<{
  saved: boolean;
  path: string;
  compiled: CompiledPattern;
  playback: PlaybackPreview;
}> {
  return api.post('/patterns/save', { name, markdown });
}

// ── Spec / Compile / Playback ───────────────────────────────────

export function parseSpec(markdown: string): Promise<Record<string, unknown>> {
  return api.post('/spec/parse', { markdown });
}

export function compileSpec(markdown: string): Promise<CompiledPattern> {
  return api.post('/spec/compile', { markdown });
}

export function previewPlayback(markdown: string): Promise<PlaybackPreview> {
  return api.post('/playback/preview', { markdown });
}

// ── Exports ─────────────────────────────────────────────────────

export function exportMidi(markdown: string): Promise<{ format: string; data: unknown }> {
  return api.post('/exports/midi', { markdown });
}

export function exportMidiFile(markdown: string): Promise<ExportResult> {
  return api.post('/exports/midi/file', { markdown });
}

export function exportWavFile(markdown: string): Promise<ExportResult> {
  return api.post('/exports/wav/file', { markdown });
}

export function exportNotationFile(markdown: string): Promise<ExportResult> {
  return api.post('/exports/notation/file', { markdown });
}

export function exportMmlFile(markdown: string): Promise<ExportResult> {
  return api.post('/exports/mml/file', { markdown });
}

export function exportMusicXmlFile(markdown: string): Promise<ExportResult> {
  return api.post('/exports/musicxml/file', { markdown });
}

// ── Sessions ────────────────────────────────────────────────────

export function fetchSessions(): Promise<{ sessions: unknown[] }> {
  return api.get('/sessions');
}

export function saveSession(name: string, markdown: string): Promise<unknown> {
  return api.post('/sessions/save', { name, markdown });
}

// ── Interchange / USXD ──────────────────────────────────────────

export function fetchSurfaceDocument(): Promise<Record<string, unknown>> {
  return api.get('/interchange/surface-document');
}

export function fetchUsxdSurface(): Promise<Record<string, unknown>> {
  return api.get('/usxd/surface');
}

// ── Surfaces ────────────────────────────────────────────────────

export function fetchSurfaces(): Promise<{ surfaces: unknown[] }> {
  return api.get('/surfaces');
}