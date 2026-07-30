/**
 * @module types
 * @description Shared TypeScript types for Groovebox Vue surface.
 * Mirrors the FastAPI backend response shapes.
 */

// ── Bootstrap / Health ─────────────────────────────────────────────

export interface BootstrapStatus {
  songscribe_running: boolean;
  songscribe_cloned: boolean;
  songscribe_url: string;
  songscribe_docker_available: boolean;
  groovebox_version: string;
}

// ── Workspaces ──────────────────────────────────────────────────────

export interface WorkspaceRoot {
  id: string;
  name: string;
  path: string;
}

export interface WorkspaceTreeItem {
  name: string;
  path: string;
  is_dir: boolean;
  size?: number;
}

export interface WorkspaceTreeResponse {
  root_id: string;
  path: string;
  items: WorkspaceTreeItem[];
}

// ── Patterns ────────────────────────────────────────────────────────

export interface PatternDocument {
  pattern_id: string;
  name: string;
  title?: string;
  tempo: number;
  bars: number;
  tracks: PatternTrack[];
  markdown?: string;
  frontmatter?: Record<string, unknown>;
}

export interface PatternTrack {
  id: string;
  name: string;
  instrument: string;
  steps: PatternStep[];
}

export interface PatternStep {
  position: number;
  note: string | null;
  velocity: number;
  duration: number;
}

export interface CompiledPattern {
  pattern_id: string;
  title: string;
  tempo: number;
  bars: number;
  tracks: CompiledTrack[];
}

export interface CompiledTrack {
  id: string;
  name: string;
  instrument: string;
  notes: CompiledNote[];
}

export interface CompiledNote {
  time: number;
  pitch: number;
  velocity: number;
  duration: number;
}

export interface PlaybackPreview {
  pattern_id: string;
  title: string;
  tempo: number;
  total_duration_seconds: number;
  total_ticks: number;
  tracks: PlaybackTrack[];
  waveform?: number[][];
}

export interface PlaybackTrack {
  id: string;
  name: string;
  instrument: string;
  note_count: number;
  events: PlaybackEvent[];
}

export interface PlaybackEvent {
  tick: number;
  type: 'note_on' | 'note_off';
  pitch: number;
  velocity: number;
}

// ── Library ──────────────────────────────────────────────────────────

export interface LibraryEntry {
  id: string;
  name: string;
  title: string;
  tempo: number;
  bars: number;
  track_count: number;
  description?: string;
}

// ── Songscribe ──────────────────────────────────────────────────────

export interface SongscribeStatus {
  running: boolean;
  cloned: boolean;
  url: string;
  version?: string;
}

export interface SongscribeDockerInfo {
  compose_exists: boolean;
  loopback_client: string;
  loopback_ok: boolean;
  can_control: boolean;
  docker_available: boolean;
}

export interface RuntimeStatus {
  mode: string;
  running: boolean;
  pid?: number;
  port?: number;
}

// ── Exports ─────────────────────────────────────────────────────────

export type ExportFormat = 'midi' | 'wav' | 'notation' | 'mml' | 'musicxml';

export interface ExportResult {
  format: ExportFormat;
  pattern_id: string;
  title: string;
  file_path?: string;
  file_size?: number;
  schema?: string;
  data?: unknown;
}

// ── Snackbar (uCore-aligned) ───────────────────────────────────────

export interface SnackbarItem {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  timestamp: number;
  source?: string;
  status?: 'pending' | 'delivered' | 'failed';
}

// ── Diagnostics / Spool ─────────────────────────────────────────────

export interface SpoolEvent {
  timestamp: string;
  module: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  tags: string[];
}

export interface DiagnosticsSnapshot {
  events: SpoolEvent[];
  runtime: RuntimeStatus;
  health: string;
}

// ── Surface Card (uCore dashboard compatibility) ────────────────────

export interface SurfaceCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  route: string;
  status: 'running' | 'offline' | 'degraded';
  features: string[];
}