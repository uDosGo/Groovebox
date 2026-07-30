<template>
  <div class="groovebox-card">
    <h3 class="groovebox-page-title">Export</h3>
    <p class="groovebox-lede mb-2" v-if="!groovebox.compiled">
      Compile a pattern first to enable exports.
    </p>
    <div class="drop-panel-actions" v-if="groovebox.compiled">
      <button class="groovebox-btn" @click="doExport('midi')" :disabled="exporting">
        MIDI File
      </button>
      <button class="groovebox-btn" @click="doExport('wav')" :disabled="exporting">
        WAV File
      </button>
      <button class="groovebox-btn" @click="doExport('notation')" :disabled="exporting">
        Notation
      </button>
      <button class="groovebox-btn" @click="doExport('mml')" :disabled="exporting">
        MML
      </button>
      <button class="groovebox-btn" @click="doExport('musicxml')" :disabled="exporting">
        MusicXML
      </button>
    </div>
    <div v-if="lastExport" class="mt-2">
      <small class="groovebox-lede">Last export: {{ lastExport }}</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useGrooveboxStore } from '../../stores/groovebox';
import { useSnackbarStore } from '../../stores/snackbar';
import * as api from '../../api/groovebox';

const groovebox = useGrooveboxStore();
const snackbar = useSnackbarStore();
const exporting = ref(false);
const lastExport = ref('');

async function doExport(format: string) {
  if (!groovebox.markdown) {
    snackbar.show('No pattern to export', 'warning');
    return;
  }
  exporting.value = true;
  try {
    switch (format) {
      case 'midi': await api.exportMidiFile(groovebox.markdown); break;
      case 'wav': await api.exportWavFile(groovebox.markdown); break;
      case 'notation': await api.exportNotationFile(groovebox.markdown); break;
      case 'mml': await api.exportMmlFile(groovebox.markdown); break;
      case 'musicxml': await api.exportMusicXmlFile(groovebox.markdown); break;
    }
    lastExport.value = `${format.toUpperCase()} exported at ${new Date().toLocaleTimeString()}`;
    snackbar.show(`${format.toUpperCase()} export complete`, 'success');
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Export failed';
    snackbar.show(msg, 'error');
  } finally {
    exporting.value = false;
  }
}
</script>