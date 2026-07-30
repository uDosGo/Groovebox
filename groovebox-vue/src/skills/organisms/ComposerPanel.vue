<template>
  <div>
    <div class="groovebox-card groovebox-card--hero">
      <p class="groovebox-eyebrow">Composer</p>
      <h2 class="groovebox-page-title">Pattern Editor</h2>
      <p class="groovebox-lede">
        Write a Groovebox markdown spec or drop a pattern file below. Use frontmatter for tempo and bars.
      </p>
    </div>

    <!-- Drop Panel -->
    <div
      class="drop-panel mb-4"
      :class="{ 'drop-panel--drag-over': dragOver }"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
      tabindex="0"
      @keydown.enter="triggerFileInput"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept=".md,.txt,.gmd"
        style="display: none"
        @change="handleFileSelect"
      />
      <div class="drop-panel-zone">
        <p class="drop-panel-text">Drop a markdown spec here or click to open</p>
        <p class="drop-panel-text" style="color: var(--usx-color-on-surface-muted); font-size: 0.75rem;">
          .md, .txt, .gmd files supported
        </p>
      </div>
    </div>

    <!-- Pattern Name -->
    <div class="mb-3">
      <label class="form-label" style="display: block; margin-bottom: 6px;">Pattern Name</label>
      <input
        type="text"
        v-model="groovebox.patternName"
        placeholder="my-pattern"
        style="width: 100%;"
      />
    </div>

    <!-- Markdown Editor -->
    <div class="mb-3">
      <label class="form-label" style="display: block; margin-bottom: 6px;">Markdown Spec</label>
      <textarea
        v-model="groovebox.markdown"
        placeholder="---&#10;tempo: 120&#10;bars: 4&#10;---&#10;"
        style="width: 100%;"
      />
    </div>

    <!-- Actions -->
    <div class="drop-panel-actions">
      <button class="groovebox-btn" @click="compile" :disabled="!groovebox.markdown.trim() || compiling">
        {{ compiling ? 'Compiling...' : 'Compile' }}
      </button>
      <button
        class="groovebox-btn"
        @click="save"
        :disabled="!groovebox.markdown.trim() || saving"
      >
        {{ saving ? 'Saving...' : 'Save' }}
      </button>
    </div>

    <!-- Compiled Pattern Preview -->
    <div v-if="groovebox.compiled" class="groovebox-card mt-4">
      <h3 class="groovebox-page-title mb-2">Compiled: {{ groovebox.compiled.title }}</h3>
      <div class="groovebox-lede mb-1">Tempo: {{ groovebox.compiled.tempo }} BPM | Bars: {{ groovebox.compiled.bars }}</div>
      <div
        v-for="track in groovebox.compiled.tracks"
        :key="track.id"
        class="mb-2"
      >
        <strong>{{ track.name }}</strong> ({{ track.instrument }}) — {{ track.notes.length }} notes
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useGrooveboxStore } from '../../stores/groovebox';
import { usePlaybackStore } from '../../stores/playback';
import { useSnackbarStore } from '../../stores/snackbar';

const groovebox = useGrooveboxStore();
const playback = usePlaybackStore();
const snackbar = useSnackbarStore();

const dragOver = ref(false);
const compiling = ref(false);
const saving = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

function triggerFileInput() {
  fileInputRef.value?.click();
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      groovebox.setMarkdown(reader.result as string);
      if (file.name) {
        groovebox.patternName = file.name.replace(/\.[^.]+$/, '');
      }
    };
    reader.readAsText(file);
  }
}

function handleDrop(e: DragEvent) {
  dragOver.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      groovebox.setMarkdown(reader.result as string);
      groovebox.patternName = file.name.replace(/\.[^.]+$/, '');
    };
    reader.readAsText(file);
  }
}

async function compile() {
  compiling.value = true;
  try {
    const compiled = await groovebox.parseAndCompile(groovebox.markdown);
    if (groovebox.playback) {
      playback.setPreview(groovebox.playback);
    }
  } catch {
    // snackbar handled in store
  } finally {
    compiling.value = false;
  }
}

async function save() {
  saving.value = true;
  try {
    await groovebox.savePattern(groovebox.patternName || 'untitled', groovebox.markdown);
  } catch {
    // snackbar handled in store
  } finally {
    saving.value = false;
  }
}
</script>