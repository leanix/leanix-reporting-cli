import { defineConfig } from 'tsup'

export default defineConfig({
  name: 'create-lxr',
  entry: ['src/index.ts'],
  format: ['cjs'],
  clean: true,
  splitting: false
})
