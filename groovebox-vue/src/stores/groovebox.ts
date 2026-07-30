/**
 * @module stores/groovebox
 * @description Core Groovebox state — pattern, compilation, playback, navigation.
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as api from '../api/groovebox';
import type {
  BootstrapStatus,
  CompiledPattern,
  PlaybackPreview,
  LibraryEntry,
} from '../types';
import { useSnackbarStore } from './snackbar';

export type GrooveboxPage = 'composer' | 'vault' | 'library' | 'overview' | 'songscribe';

export const useGrooveboxStore = defineStore('groovebox', () => {
  // Navigation
  const currentPage = ref<GrooveboxPage>('composer');
  const filePickerOpen = ref(false);

  // Bootstrap
  const bootstrapStatus = ref<BootstrapStatus | null>(null);
  const loading = ref(false);

  // Markdown editor
  const markdown = ref('');
  const patternName = ref('');

  // Compilation result
  const compiled = ref<CompiledPattern | null>(null);
  const playback = ref<PlaybackPreview | null>(null);

  // Library
  const library = ref<LibraryEntry[]>([]);

  // Computed
  const songscribeRunning = computed(() => bootstrapStatus.value?.songscribe_running ?? false);
  const songscribeCloned = computed(() => bootstrapStatus.value?.songscribe_cloned ?? false);
  const songscribeUrl = computed(() => bootstrapStatus.value?.songscribe_url ?? '');

  // Actions
  async function loadBootstrap() {
    loading.value = true;
    try {
      bootstrapStatus.value = await api.fetchBootstrapStatus();
    } catch {
      // snackbar handled by caller
    } finally {
      loading.value = false;
    }
  }

  async function loadLibrary() {
    try {
      const data = await api.fetchPatterns();
      library.value = data.library ?? [];
    } catch {
      // silent fail for library
    }
  }

  async function parseAndCompile(md: string) {
    const snackbar = useSnackbarStore();
    try {
      const result = await api.compileSpec(md);
      compiled.value = result;
      const preview = await api.previewPlayback(md);
      playback.value = preview;
      snackbar.show('Pattern compiled', 'success');
      return result;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Compilation failed';
      snackbar.show(msg, 'error');
      throw e;
    }
  }

  async function savePattern(name: string, md: string) {
    const snackbar = useSnackbarStore();
    try {
      const result = await api.savePattern(name, md);
      compiled.value = result.compiled;
      playback.value = result.playback;
      snackbar.show(`Saved: "${name}"`, 'success');
      return result;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Save failed';
      snackbar.show(msg, 'error');
      throw e;
    }
  }

  async function loadPattern(id: string) {
    const snackbar = useSnackbarStore();
    try {
      const result = await api.fetchPattern(id);
      markdown.value = result.markdown ?? '';
      patternName.value = result.name ?? '';
      compiled.value = result.compiled;
      playback.value = result.playback;
      snackbar.show(`Loaded: "${result.name}"`, 'success');
      return result;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Load failed';
      snackbar.show(msg, 'error');
      throw e;
    }
  }

  function navigate(page: GrooveboxPage) {
    currentPage.value = page;
  }

  function toggleFilePicker() {
    filePickerOpen.value = !filePickerOpen.value;
  }

  function setMarkdown(md: string) {
    markdown.value = md;
  }

  return {
    currentPage,
    filePickerOpen,
    bootstrapStatus,
    loading,
    markdown,
    patternName,
    compiled,
    playback,
    library,
    songscribeRunning,
    songscribeCloned,
    songscribeUrl,
    loadBootstrap,
    loadLibrary,
    parseAndCompile,
    savePattern,
    loadPattern,
    navigate,
    toggleFilePicker,
    setMarkdown,
  };
});