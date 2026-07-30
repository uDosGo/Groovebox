/**
 * @module stores/songscribe
 * @description Songscribe runtime, Docker control, and bridge state.
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as api from '../api/groovebox';
import type { SongscribeStatus, SongscribeDockerInfo, RuntimeStatus } from '../types';
import { useSnackbarStore } from './snackbar';

export const useSongscribeStore = defineStore('songscribe', () => {
  const status = ref<SongscribeStatus | null>(null);
  const dockerInfo = ref<SongscribeDockerInfo | null>(null);
  const runtimeStatus = ref<RuntimeStatus | null>(null);
  const loading = ref(false);

  async function fetchStatus() {
    try {
      status.value = await api.fetchSongscribeStatus();
    } catch {
      // silent fail
    }
  }

  async function fetchDockerInfo() {
    try {
      dockerInfo.value = await api.fetchSongscribeDocker();
    } catch {
      // silent fail
    }
  }

  async function fetchRuntime() {
    try {
      runtimeStatus.value = await api.fetchSongscribeRuntime();
    } catch {
      // silent fail
    }
  }

  async function startDocker() {
    const snackbar = useSnackbarStore();
    loading.value = true;
    try {
      const result = await api.startSongscribeDocker();
      snackbar.show('Songscribe Docker started', 'success');
      return result;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to start Docker';
      snackbar.show(msg, 'error');
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function stopDocker() {
    const snackbar = useSnackbarStore();
    loading.value = true;
    try {
      const result = await api.stopSongscribeDocker();
      snackbar.show('Songscribe Docker stopped', 'info');
      return result;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to stop Docker';
      snackbar.show(msg, 'error');
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function startRuntime(mode: string = 'local') {
    const snackbar = useSnackbarStore();
    loading.value = true;
    try {
      runtimeStatus.value = await api.startSongscribeRuntime(mode);
      snackbar.show(`Songscribe runtime started (${mode})`, 'success');
      return runtimeStatus.value;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to start runtime';
      snackbar.show(msg, 'error');
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function stopRuntime(mode: string = 'local') {
    const snackbar = useSnackbarStore();
    loading.value = true;
    try {
      runtimeStatus.value = await api.stopSongscribeRuntime(mode);
      snackbar.show('Songscribe runtime stopped', 'info');
      return runtimeStatus.value;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to stop runtime';
      snackbar.show(msg, 'error');
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function refreshAll() {
    await Promise.all([fetchStatus(), fetchDockerInfo(), fetchRuntime()]);
  }

  return {
    status,
    dockerInfo,
    runtimeStatus,
    loading,
    fetchStatus,
    fetchDockerInfo,
    fetchRuntime,
    startDocker,
    stopDocker,
    startRuntime,
    stopRuntime,
    refreshAll,
  };
});