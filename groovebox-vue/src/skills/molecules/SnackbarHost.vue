<template>
  <TransitionGroup name="snack" tag="div" class="groovebox-snackbar-host">
    <div
      v-for="item in snackbar.items"
      :key="item.id"
      :class="['groovebox-snack', `groovebox-snack--${item.type}`]"
    >
      <span class="groovebox-snack-message">{{ item.message }}</span>
      <button class="groovebox-snack-dismiss" @click="snackbar.dismiss(item.id)">&#x2715;</button>
    </div>
  </TransitionGroup>
</template>

<script setup lang="ts">
import { useSnackbarStore } from '../../stores/snackbar';

const snackbar = useSnackbarStore();
</script>