<template>
  <div>
    <div class="groovebox-card groovebox-card--hero">
      <p class="groovebox-eyebrow">Status</p>
      <h2 class="groovebox-page-title">System Overview</h2>
      <p class="groovebox-lede">Groovebox bootstrap status, Songscribe bridge, and runtime health.</p>
    </div>

    <!-- Bootstrap Status -->
    <div class="groovebox-card">
      <h3 class="groovebox-page-title mb-2">Bootstrap</h3>
      <div v-if="!groovebox.bootstrapStatus" class="groovebox-lede">Loading...</div>
      <div v-else class="groovebox-lede">
        <div>Version: {{ groovebox.bootstrapStatus.groovebox_version }}</div>
        <div>
          Songscribe:
          <span :class="['groovebox-nav-dot', groovebox.bootstrapStatus.songscribe_running ? 'dot-online' : 'dot-offline']" style="margin: 0 4px;" />
          {{ groovebox.bootstrapStatus.songscribe_running ? 'Running' : 'Offline' }}
        </div>
        <div v-if="groovebox.bootstrapStatus.songscribe_cloned">
          Cloned: Yes · URL: {{ groovebox.bootstrapStatus.songscribe_url }}
        </div>
      </div>
      <button class="groovebox-btn mt-2" @click="groovebox.loadBootstrap()">Refresh</button>
    </div>

    <!-- Diagnostics -->
    <DiagnosticsPanel />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useGrooveboxStore } from '../../stores/groovebox';
import DiagnosticsPanel from './DiagnosticsPanel.vue';

defineEmits<{ navigate: [page: string] }>();

const groovebox = useGrooveboxStore();

onMounted(() => {
  groovebox.loadBootstrap();
});
</script>