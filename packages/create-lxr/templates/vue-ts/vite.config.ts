import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import leanix from 'vite-plugin-lxr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    leanix()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
