import react from '@vitejs/plugin-react'
// @ts-check
import { defineConfig } from 'vite'
import leanix from 'vite-plugin-lxr'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), leanix()]
})
