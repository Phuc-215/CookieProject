import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Listen on all addresses (important for WSL)
    port: 5173,
    strictPort: false,
    watch: {
      usePolling: true, // Required for WSL file watching
      interval: 100, // Check for changes every 100ms
    },
    hmr: {
      overlay: true, // Show errors as overlay
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
