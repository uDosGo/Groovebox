<template>
  <div class="groovebox-surface">
    <GrooveboxNav
      :current-page="groovebox.currentPage"
      :songscribe-running="groovebox.songscribeRunning"
      :file-picker-open="groovebox.filePickerOpen"
      @navigate="handleNavigate"
      @toggle-file-picker="groovebox.toggleFilePicker()"
      @go-home="goHome"
    />

    <div class="groovebox-body">
      <FilePickerSidebar
        v-if="groovebox.filePickerOpen"
        @close="groovebox.toggleFilePicker()"
        @select-file="handleSelectFile"
      />

      <div class="groovebox-pages">
        <!-- Overview Page -->
        <OverviewPanel
          v-if="groovebox.currentPage === 'overview'"
          @navigate="handleNavigate"
        />

        <!-- Composer Page -->
        <template v-if="groovebox.currentPage === 'composer'">
          <ComposerPanel />
          <ExportPanel />
        </template>

        <!-- Vault Page -->
        <VaultPanel v-if="groovebox.currentPage === 'vault'" />

        <!-- Library Page -->
        <LibraryPanel
          v-if="groovebox.currentPage === 'library'"
          @load-pattern="handleLoadPattern"
        />

        <!-- Songscribe Page -->
        <SongscribePanel v-if="groovebox.currentPage === 'songscribe'" />
      </div>
    </div>

    <!-- Playback Bar (always visible when playback exists) -->
    <PlaybackBar v-if="playback.preview" />

    <!-- Snackbar Host -->
    <SnackbarHost />
  </div>
</template>

<script setup lang="ts">
/**
 * @component GrooveboxShell
 * @description Root layout — nav + filepicker sidebar + page panels + playback + snackbar.
 * Replaces GrooveboxSurface.tsx + GrooveboxNav.tsx from React.
 */
import { onMounted } from 'vue';
import GrooveboxNav from '../skills/molecules/GrooveboxNav.vue';
import FilePickerSidebar from '../skills/molecules/FilePickerSidebar.vue';
import ComposerPanel from '../skills/organisms/ComposerPanel.vue';
import VaultPanel from '../skills/organisms/VaultPanel.vue';
import LibraryPanel from '../skills/organisms/LibraryPanel.vue';
import SongscribePanel from '../skills/organisms/SongscribePanel.vue';
import OverviewPanel from '../skills/organisms/OverviewPanel.vue';
import ExportPanel from '../skills/molecules/ExportPanel.vue';
import PlaybackBar from '../skills/molecules/PlaybackBar.vue';
import SnackbarHost from '../skills/molecules/SnackbarHost.vue';
import { useGrooveboxStore } from '../stores/groovebox';
import { usePlaybackStore } from '../stores/playback';
import type { GrooveboxPage } from '../stores/groovebox';

const groovebox = useGrooveboxStore();
const playback = usePlaybackStore();

onMounted(() => {
  groovebox.loadBootstrap();
  groovebox.loadLibrary();
});

function handleNavigate(page: string) {
  if (page === 'home') {
    goHome();
  } else {
    groovebox.navigate(page as GrooveboxPage);
  }
}

function handleSelectFile(rootId: string, _path: string, content: string) {
  groovebox.setMarkdown(content);
  groovebox.toggleFilePicker();
  groovebox.navigate('composer');
}

function handleLoadPattern(id: string) {
  groovebox.loadPattern(id);
  groovebox.navigate('composer');
}

function goHome() {
  window.location.href = 'http://localhost:5173';
}
</script>