<template>
  <aside class="groovebox-filepicker">
    <div class="groovebox-filepicker-header">
      <span class="groovebox-filepicker-title">Vault Files</span>
      <button class="groovebox-filepicker-close" @click="$emit('close')" aria-label="Close file picker">
        &#x2715;
      </button>
    </div>

    <!-- Workspace Roots -->
    <div v-if="!vault.currentRootId" class="groovebox-filepicker-roots">
      <button
        v-for="root in vault.roots"
        :key="root.id"
        class="groovebox-filepicker-root-btn"
        @click="vault.navigateTree(root.id)"
      >
        &#x1F4C1; <span>{{ root.name }}</span>
      </button>
      <div v-if="vault.roots.length === 0 && !vault.loading" class="groovebox-filepicker-empty">
        No workspace roots configured
      </div>
    </div>

    <!-- Breadcrumb + Tree -->
    <template v-else>
      <div class="groovebox-filepicker-breadcrumb">
        <button class="groovebox-filepicker-breadcrumb-btn" @click="goUp" title="Back to roots">
          &#x2190;
        </button>
        <span class="groovebox-filepicker-breadcrumb-label">{{ currentRootName }}</span>
        <span class="groovebox-filepicker-breadcrumb-sep">/</span>
        <span class="groovebox-filepicker-breadcrumb-path">{{ vault.currentPath || '.' }}</span>
      </div>

      <div class="groovebox-filepicker-tree">
        <!-- Back button when in subdirectory -->
        <button
          v-if="vault.currentPath"
          class="groovebox-filepicker-tree-item groovebox-filepicker-tree-back"
          @click="navigateUp"
        >
          &#x2191; <span>..</span>
        </button>

        <button
          v-for="item in vault.items"
          :key="item.path"
          class="groovebox-filepicker-tree-item"
          @click="item.is_dir ? vault.navigateTree(vault.currentRootId!, item.path) : vault.loadFile(vault.currentRootId!, item.path)"
        >
          <span>{{ item.is_dir ? '&#x1F4C1;' : '&#x1F4C4;' }}</span>
          <span>{{ item.name }}</span>
          <span v-if="item.size !== undefined" class="groovebox-filepicker-tree-size">
            {{ formatSize(item.size) }}
          </span>
        </button>

        <div v-if="vault.loading" class="groovebox-filepicker-loading">Loading&#x2026;</div>
        <div v-else-if="vault.items.length === 0" class="groovebox-filepicker-empty">
          Empty directory
        </div>
      </div>
    </template>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useVaultStore } from '../../stores/vault';

const emit = defineEmits<{
  close: [];
  selectFile: [rootId: string, path: string, content: string];
}>();

const vault = useVaultStore();

onMounted(() => {
  vault.loadRoots();
});

const currentRootName = computed(() => {
  if (!vault.currentRootId) return '';
  const root = vault.roots.find(r => r.id === vault.currentRootId);
  return root?.name ?? vault.currentRootId;
});

function goUp() {
  vault.currentRootId = null;
  vault.currentPath = '';
  vault.items = [];
}

function navigateUp() {
  if (!vault.currentRootId || !vault.currentPath) return;
  const parts = vault.currentPath.split('/');
  parts.pop();
  const parent = parts.join('/');
  vault.navigateTree(vault.currentRootId, parent);
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
</script>