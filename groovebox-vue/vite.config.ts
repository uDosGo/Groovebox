import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [vue()],
  root: '.',
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../app/static'),
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    port: 8888,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8890',
        changeOrigin: true,
      },
    },
  },
});