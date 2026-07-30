/**
 * @module stores/snackbar
 * @description Global snackbar notification queue — uCore-aligned pattern.
 * Adapted from uCore frontend-vue/src/stores/snackbar.ts.
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { SnackbarItem } from '../types';

export const useSnackbarStore = defineStore('snackbar', () => {
  const items = ref<SnackbarItem[]>([]);
  const maxItems = 5;

  function show(message: string, type: SnackbarItem['type'] = 'info', duration = 4000, source = 'ui') {
    const item: SnackbarItem = {
      id: crypto.randomUUID(),
      message,
      type,
      duration,
      timestamp: Date.now(),
      source,
      status: 'pending',
    };
    items.value.push(item);
    if (items.value.length > maxItems) {
      items.value.shift();
    }

    if (duration > 0) {
      setTimeout(() => dismiss(item.id), duration);
    }
  }

  function dismiss(id: string) {
    items.value = items.value.filter(i => i.id !== id);
  }

  function clear() {
    items.value = [];
  }

  return { items, maxItems, show, dismiss, clear };
});