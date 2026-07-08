import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  root: 'app/surface',
  base: '/',
  build: {
    outDir: path.resolve(__dirname, 'app/static'),
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    port: 8888,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8888',
        changeOrigin: true,
      },
    },
  },
});
