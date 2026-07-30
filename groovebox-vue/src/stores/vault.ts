/**
 * @module stores/vault
 * @description Workspace vault state — roots, tree browsing, file content.
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as api from '../api/groovebox';
import type { WorkspaceRoot, WorkspaceTreeItem } from '../types';
import { useSnackbarStore } from './snackbar';

export const useVaultStore = defineStore('vault', () => {
  const roots = ref<WorkspaceRoot[]>([]);
  const currentRootId = ref<string | null>(null);
  const currentPath = ref('');
  const items = ref<WorkspaceTreeItem[]>([]);
  const selectedFile = ref<{ rootId: string; path: string; content: string } | null>(null);
  const loading = ref(false);

  async function loadRoots() {
    try {
      const data = await api.fetchWorkspaces();
      roots.value = data.roots ?? [];
    } catch {
      // silent fail
    }
  }

  async function navigateTree(rootId: string, path: string = '') {
    loading.value = true;
    try {
      const data = await api.fetchWorkspaceTree(rootId, path);
      currentRootId.value = rootId;
      currentPath.value = path;
      items.value = data.items ?? [];
    } catch {
      const snackbar = useSnackbarStore();
      snackbar.show('Failed to load directory', 'error');
    } finally {
      loading.value = false;
    }
  }

  async function loadFile(rootId: string, path: string) {
    const snackbar = useSnackbarStore();
    try {
      const data = await api.fetchWorkspaceFile(rootId, path);
      selectedFile.value = { rootId, path, content: data.content };
      return data.content;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load file';
      snackbar.show(msg, 'error');
      throw e;
    }
  }

  async function saveFile(rootId: string, path: string, content: string) {
    const snackbar = useSnackbarStore();
    try {
      await api.writeWorkspaceFile(rootId, path, content);
      snackbar.show('File saved', 'success');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to save file';
      snackbar.show(msg, 'error');
      throw e;
    }
  }

  function clearSelection() {
    selectedFile.value = null;
  }

  return {
    roots,
    currentRootId,
    currentPath,
    items,
    selectedFile,
    loading,
    loadRoots,
    navigateTree,
    loadFile,
    saveFile,
    clearSelection,
  };
});