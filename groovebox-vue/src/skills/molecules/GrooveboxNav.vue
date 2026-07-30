<template>
  <header class="groovebox-nav" aria-label="Main">
    <div class="groovebox-nav-top">
      <div class="groovebox-nav-brand">
        <button
          class="groovebox-nav-home"
          @click="$emit('goHome')"
          title="Back to UI Hub"
          aria-label="Back to UI Hub"
        >
          &#x2302;
        </button>
        <span class="groovebox-nav-title">Groovebox</span>
      </div>
      <nav class="groovebox-nav-links" aria-label="Pages">
        <button
          v-for="item in navItems"
          :key="item.id"
          :class="['groovebox-nav-link', { 'is-active': currentPage === item.id }]"
          @click="$emit('navigate', item.id)"
          :title="item.id === 'songscribe' && !songscribeRunning ? 'Songscribe is offline' : item.label"
        >
          <span class="groovebox-nav-link-label">{{ item.label }}</span>
          <span
            v-if="item.id === 'songscribe'"
            :class="['groovebox-nav-dot', songscribeRunning ? 'dot-online' : 'dot-offline']"
          />
        </button>
      </nav>
      <button
        :class="['groovebox-nav-link', { 'is-active': filePickerOpen }]"
        @click="$emit('toggleFilePicker')"
        title="Toggle file picker sidebar"
        aria-label="Toggle file picker"
      >
        <span class="groovebox-nav-link-label">&#x1F4C1;</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  currentPage: string;
  songscribeRunning: boolean;
  filePickerOpen: boolean;
}>();

defineEmits<{
  navigate: [page: string];
  toggleFilePicker: [];
  goHome: [];
}>();

const navItems = [
  { id: 'composer', label: 'Compose' },
  { id: 'vault', label: 'Vault' },
  { id: 'library', label: 'Library' },
  { id: 'songscribe', label: 'Songscribe' },
  { id: 'overview', label: 'Status' },
];
</script>