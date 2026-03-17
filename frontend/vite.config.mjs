import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      components: path.resolve(__dirname, './src/components'),
      pages: path.resolve(__dirname, './src/pages'),
      contexts: path.resolve(__dirname, './src/contexts'),
      lib: path.resolve(__dirname, './src/lib'),
      utils: path.resolve(__dirname, './src/utils'),
      styles: path.resolve(__dirname, './src/styles'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  define: {
    'process.env': {},
  },
});
