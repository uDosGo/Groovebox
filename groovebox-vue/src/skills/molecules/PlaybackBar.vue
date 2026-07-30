<template>
  <div class="groovebox-playback-bar">
    <button class="groovebox-btn groovebox-btn--sm" @click="playback.playing ? playback.stop() : playback.play()">
      {{ playback.playing ? '&#x23F9;' : '&#x25B6;' }}
    </button>

    <button
      :class="['groovebox-btn', 'groovebox-btn--sm', { 'is-active': playback.loop }]"
      @click="playback.toggleLoop()"
    >
      &#x1F501;
    </button>

    <div class="groovebox-playback-tempo">
      Tempo:
      <input
        type="number"
        :value="playback.tempo"
        @change="onTempoChange"
        min="20"
        max="300"
        style="width: 60px; padding: 2px 6px;"
      />
      BPM
    </div>

    <div class="groovebox-playback-position">
      {{ playback.position }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlaybackStore } from '../../stores/playback';

const playback = usePlaybackStore();

function onTempoChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const bpm = parseInt(target.value, 10);
  if (!isNaN(bpm)) {
    playback.setTempo(bpm);
  }
}
</script>