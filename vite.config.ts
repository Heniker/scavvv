import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: { hmr: false },
  base: '/scavvv',
  plugins: [tailwindcss(), svelte()],
  publicDir: './src/public',
})
