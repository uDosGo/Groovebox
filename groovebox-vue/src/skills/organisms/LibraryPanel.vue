<template>
  <div>
    <div class="groovebox-card groovebox-card--hero">
      <p class="groovebox-eyebrow">Library</p>
      <h2 class="groovebox-page-title">Pattern Library</h2>
      <p class="groovebox-lede">Browse, load, and preview saved patterns.</p>
    </div>

    <div v-if="groovebox.library.length === 0" class="groovebox-card">
      <p class="groovebox-lede">No patterns in library yet. Save a pattern from the Composer to see it here.</p>
    </div>

    <div
      v-for="entry in groovebox.library"
      :key="entry.id"
      class="groovebox-card"
    >
      <h3 class="groovebox-page-title">{{ entry.name }}</h3>
      <p class="groovebox-lede mb-2">
        {{ entry.bars }} bars @ {{ entry.tempo }} BPM · {{ entry.track_count }} tracks
        <span v-if="entry.description" class="mb-1" style="display: block;">{{ entry.description }}</span>
      </p>
      <button class="groovebox-btn" @click="$emit('loadPattern', entry.id)">
        Load
      </button>
    </div>

    <div v-if="loading" class="groovebox-lede mt-2">Loading...</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useGrooveboxStore } from '../../stores/groovebox';

defineEmits<{ loadPattern: [id: string] }>();

const groovebox = useGrooveboxStore();
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  await groovebox.loadLibrary();
  loading.value = false;
});
</script>