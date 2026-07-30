<template>
  <div>
    <div class="groovebox-card groovebox-card--hero">
      <p class="groovebox-eyebrow">Songscribe</p>
      <h2 class="groovebox-page-title">Audio Transcription</h2>
      <p class="groovebox-lede">
        Songscribe provides AI-powered stem isolation and audio transcription. 
        It runs as a local Docker service or standalone runtime.
      </p>
    </div>

    <!-- Status -->
    <div class="groovebox-card">
      <h3 class="groovebox-page-title mb-2">Service Status</h3>
      <div class="mb-2">
        <span class="groovebox-nav-dot" :class="songscribe.status?.running ? 'dot-online' : 'dot-offline'" style="margin-right: 6px;" />
        <span>{{ songscribe.status?.running ? 'Running' : 'Offline' }}</span>
        <span v-if="songscribe.status?.url" class="groovebox-lede" style="display: block; font-size: 0.75rem;">
          {{ songscribe.status.url }}
        </span>
      </div>

      <div class="drop-panel-actions">
        <button
          class="groovebox-btn"
          @click="songscribe.startRuntime('local')"
          :disabled="songscribe.loading"
        >
          Start Runtime
        </button>
        <button
          class="groovebox-btn"
          @click="songscribe.stopRuntime('local')"
          :disabled="songscribe.loading"
        >
          Stop Runtime
        </button>
      </div>
    </div>

    <!-- Docker Control -->
    <div class="groovebox-card" v-if="songscribe.dockerInfo">
      <h3 class="groovebox-page-title mb-2">Docker Control</h3>
      <p class="groovebox-lede mb-2">
        Docker compose available: {{ songscribe.dockerInfo.compose_exists ? 'Yes' : 'No' }}
        <br />Can control: {{ songscribe.dockerInfo.can_control ? 'Yes' : 'No' }}
      </p>
      <div class="drop-panel-actions">
        <button
          class="groovebox-btn"
          @click="songscribe.startDocker()"
          :disabled="!songscribe.dockerInfo.can_control || songscribe.loading"
        >
          Start Docker
        </button>
        <button
          class="groovebox-btn"
          @click="songscribe.stopDocker()"
          :disabled="!songscribe.dockerInfo.can_control || songscribe.loading"
        >
          Stop Docker
        </button>
      </div>
    </div>

    <!-- Songscribe Embed -->
    <div class="groovebox-card" v-if="songscribe.status?.running && songscribe.status?.url">
      <h3 class="groovebox-page-title mb-2">Songscribe UI</h3>
      <iframe
        :src="songscribe.status.url"
        style="width: 100%; height: 600px; border: 1px solid var(--usx-color-border); border-radius: var(--groovebox-radius);"
        title="Songscribe"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useSongscribeStore } from '../../stores/songscribe';

const songscribe = useSongscribeStore();

onMounted(() => {
  songscribe.refreshAll();
});
</script>