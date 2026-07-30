/**
 * @module main
 * @description Groovebox Vue application entry point.
 * Import order: USX tokens → dark theme → usx-standard → PicoCSS → Groovebox extensions
 */
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';

// ─── USX Token System (self-hosted in src/styles/) ─────────────
// Matches uCore USX-NPM-STRUCTURE.md integration pattern.
import './styles/tokens-color.css'
import './styles/tokens-typography.css'
import './styles/tokens-spacing.css'
import './styles/tokens-touch.css'
import './styles/tokens-components.css'
import './styles/dark.css'
import './styles/usx-standard.css'

// PicoCSS base (shared component framework with uCore)
import '@picocss/pico/css/pico.css';

// Groovebox extensions (depends on var(--usx-*) from USX tokens)
import './styles/groovebox-extensions.css';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');