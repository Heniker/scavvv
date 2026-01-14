import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import("@sveltejs/vite-plugin-svelte").SvelteConfig} */
const config = {
  compilerOptions: {
    warningFilter: (warning) => !warning.code.startsWith('a11y'),
    runes: true,
    modernAst: true,
    experimental: { async: false },
  },

  preprocess: vitePreprocess(),
}

export default config
