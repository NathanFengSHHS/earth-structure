import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages serves from /earth-structure/ — use '/' for local dev only.
  base: command === 'build' ? '/earth-structure/' : '/',
}))
