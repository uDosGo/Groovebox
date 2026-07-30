<template>
  <div>
    <div class="groovebox-card groovebox-card--hero">
      <p class="groovebox-eyebrow">Vault</p>
      <h2 class="groovebox-page-title">File Browser</h2>
      <p class="groovebox-lede">Browse configured workspace roots and files.</p>
    </div>

    <div class="groovebox-card" v-if="!vault.currentRootId">
      <h3 class="groovebox-page-title mb-2">Workspace Roots</h3>
      <div v-if="vault.roots.length === 0 && !vault.loading" class="groovebox-lede">
        No workspace roots configured.
      </div>
      <button
        v-for="root in vault.roots"
        :key="root.id"
        class="groovebox-btn mb-2"
        style="display: block; width: 100%; text-align: left;"
        @click="vault.navigateTree(root.id)"
      >
        &#x1F4C1; <strong>{{ root.name }}</strong>
        <span class="groovebox-lede" style="display: block; font-size: 0.75rem;">{{ root.path }}</span>
      </button>
    </div>

    <div v-else class="groovebox-card">
      <div class="mb-2" style="display: flex; align-items: center; gap: 8px;">
        <button class="groovebox-btn groovebox-btn--sm" @click="backToRoots">&#x2190; Back</button>
        <span class="groovebox-page-title">{{ currentRootName }}/{{ vault.currentPath }}</span>
      </div>

      <button
        v-if="vault.currentPath"
        class="groovebox-btn groovebox-btn--sm mb-2"
        style="display: block; width: 100%; text-align: left;"
        @click="navigateUp"
      >&#x2191; ..</button>

      <button
        v-for="item in vault.items"
        :key="item.path"
        class="groovebox-btn mb-1"
        style="display: block; width: 100%; text-align: left;"
        @click="item.is_dir ? vault.navigateTree(vault.currentRootId!, item.path) : openFile(item.path)"
      >
        <span>{{ item.is_dir ? '&#x1F4C1;' : '&#x1F4C4;' }}</span>
        {{ item.name }}
        <span v-if="item.size !== undefined" style="float: right; color: var(--usx-color-on-surface-muted); font-size: 0.75rem;">
          {{ formatSize(item.size) }}
        </span>
      </button>

      <div v-if="vault.loading" class="groovebox-lede mt-2">Loading...</div>
      <div v-else-if="vault.items.length === 0" class="groovebox-lede mt-2">Empty directory.</div>
    </div>

    <div v-if="vault.selectedFile" class="groovebox-card">
      <h3 class="groovebox-page-title mb-2">File: {{ vault.selectedFile.path }}</h3>
      <pre class="songscribe-notation-preview">{{ vault.selectedFile.content }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useVaultStore } from '../../stores/vault';

const vault = useVaultStore();

onMounted(() => { vault.loadRoots(); });

const currentRootName = computed(() => {
  if (!vault.currentRootId) return '';
  return vault.roots.find(r => r.id === vault.currentRootId)?.name ?? vault.currentRootId;
});

function backToRoots() {
  vault.currentRootId = null; vault.currentPath = ''; vault.items = []; vault.clearSelection();
}

function navigateUp() {
  if (!vault.currentRootId || !vault.currentPath) return;
  const parts = vault.currentPath.split('/'); parts.pop();
  vault.navigateTree(vault.currentRootId, parts.join('/'));
}

async function openFile(path: string) {
  if (!vault.currentRootId) return;
  try { await vault.loadFile(vault.currentRootId, path); } catch { /* store handles snackbar */ }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
</script>