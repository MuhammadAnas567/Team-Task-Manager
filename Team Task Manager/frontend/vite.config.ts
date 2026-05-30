// frontend/vite.config.ts

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      react: path.resolve(dirname, '../node_modules/react'),
      'react-dom': path.resolve(dirname, '../node_modules/react-dom'),
      'react/jsx-runtime': path.resolve(dirname, '../node_modules/react/jsx-runtime.js'),
      'react/jsx-dev-runtime': path.resolve(dirname, '../node_modules/react/jsx-dev-runtime.js'),
    },
  },
  optimizeDeps: {
    force: true,
    include: ['react', 'react-dom', 'react-dom/client', 'react-router-dom', 'react-hook-form'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
