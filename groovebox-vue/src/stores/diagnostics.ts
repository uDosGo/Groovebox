/**
 * @module stores/diagnostics
 * @description Runtime diagnostics and spool event stream.
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { SpoolEvent, RuntimeStatus } from '../types';

export const useDiagnosticsStore = defineStore('diagnostics', () => {
  const events = ref<SpoolEvent[]>([]);
  const runtimeHealth = ref<RuntimeStatus | null>(null);
  const loading = ref(false);

  async function fetchEvents(limit = 50) {
    loading.value = true;
    try {
      const res = await fetch(`/api/diagnostics/events?limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        events.value = data.events ?? [];
      }
    } catch {
      // silent fail — diagnostics endpoint may not exist yet
    } finally {
      loading.value = false;
    }
  }

  async function fetchRuntimeHealth() {
    try {
      const res = await fetch('/api/songscribe/runtime');
      if (res.ok) {
        runtimeHealth.value = await res.json();
      }
    } catch {
      // silent fail
    }
  }

  return {
    events,
    runtimeHealth,
    loading,
    fetchEvents,
    fetchRuntimeHealth,
  };
});