/**
 * @module stores/playback
 * @description Transport playback — tempo, position, play/stop/loop state.
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { PlaybackPreview } from '../types';

export const usePlaybackStore = defineStore('playback', () => {
  const preview = ref<PlaybackPreview | null>(null);
  const playing = ref(false);
  const loop = ref(false);
  const currentTick = ref(0);
  const tempo = ref(120);

  let timer: ReturnType<typeof setInterval> | null = null;

  const totalTicks = computed(() => preview.value?.total_ticks ?? 0);
  const position = computed(() => {
    if (!preview.value) return '0:00';
    const sec = currentTick.value / (tempo.value / 60 * 4);
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  });
  const progress = computed(() => {
    if (!preview.value || totalTicks.value === 0) return 0;
    return currentTick.value / totalTicks.value;
  });

  function setPreview(p: PlaybackPreview) {
    preview.value = p;
    tempo.value = p.tempo;
  }

  function play() {
    if (!preview.value) return;
    playing.value = true;
    currentTick.value = 0;
    const tickInterval = (60 / tempo.value / 4) * 1000;
    timer = setInterval(() => {
      if (currentTick.value >= totalTicks.value) {
        if (loop.value) {
          currentTick.value = 0;
        } else {
          stop();
        }
      } else {
        currentTick.value++;
      }
    }, tickInterval);
  }

  function stop() {
    playing.value = false;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function toggleLoop() {
    loop.value = !loop.value;
  }

  function setTempo(bpm: number) {
    tempo.value = Math.max(20, Math.min(300, bpm));
    if (playing.value) {
      stop();
      play();
    }
  }

  return {
    preview,
    playing,
    loop,
    currentTick,
    tempo,
    totalTicks,
    position,
    progress,
    setPreview,
    play,
    stop,
    toggleLoop,
    setTempo,
  };
});