import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // bind 0.0.0.0 so the container is reachable from the host
    port: 5173,
    watch: {
      // Docker Desktop on Windows (WSL2/Hyper-V) does NOT forward inotify file
      // events across the bind mount, so Vite never sees your edits. Polling
      // makes Vite actively re-check files -> HMR works from inside the container.
      usePolling: true,
      interval: 100,
    },
  },
})
