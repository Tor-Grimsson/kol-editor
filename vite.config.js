import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-konva': ['konva', 'react-konva'],
          'vendor-pixi': ['pixi.js', 'pixi-filters'],
          'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          'vendor-utils': ['polygon-clipping', 'react-color', 'use-image'],
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1000kb to reduce warnings
  }
})
