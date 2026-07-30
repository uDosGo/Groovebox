<template>
  <div class="groovebox-card">
    <h3 class="groovebox-page-title mb-2">Diagnostics</h3>
    <p class="groovebox-lede mb-2">Recent spool events and runtime health.</p>

    <!-- Runtime Health -->
    <div v-if="diag.runtimeHealth" class="mb-3">
      <strong>Runtime:</strong>
      {{ diag.runtimeHealth.running ? 'Running' : 'Stopped' }}
      ({{ diag.runtimeHealth.mode }})
      <span v-if="diag.runtimeHealth.pid">PID: {{ diag.runtimeHealth.pid }}</span>
    </div>

    <div class="drop-panel-actions mb-3">
      <button class="groovebox-btn groovebox-btn--sm" @click="refreshAll">Refresh</button>
    </div>

    <!-- Event Stream -->
    <div v-if="diag.events.length > 0" class="groovebox-diagnostics-events">
      <div
        v-for="(ev, i) in diag.events"
        :key="i"
        class="groovebox-event-row"
      >
        <span class="groovebox-event-time">{{ formatTime(ev.timestamp) }}</span>
        <span :class="['groovebox-event-level', `groovebox-event-level--${ev.level}`]">{{ ev.level }}</span>
        <span class="groovebox-event-module">{{ ev.module }}</span>
        <span class="groovebox-event-message">{{ ev.message }}</span>
        <span class="groovebox-event-tags" v-if="ev.tags?.length">
          <span v-for="tag in ev.tags" :key="tag" class="groovebox-event-tag">{{ tag }}</span>
        </span>
      </div>
    </div>
    <p v-else class="groovebox-lede">No spool events yet.</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useDiagnosticsStore } from '../../stores/diagnostics';

const diag = useDiagnosticsStore();

onMounted(() => {
  refreshAll();
});

function refreshAll() {
  diag.fetchEvents();
  diag.fetchRuntimeHealth();
}

function formatTime(ts: string): string {
  try {
    return new Date(ts).toLocaleTimeString();
  } catch {
    return ts;
  }
}
</script>