import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { readFileSync } from 'fs'

/**
 * Custom Vite plugin to copy plain JS entry points (background, content script)
 * into the dist/ folder. These files don't need React or bundling — they're
 * emitted as-is so Chrome can load them directly.
 */
function extensionScripts() {
  return {
    name: 'extension-scripts',
    generateBundle() {
      const scripts = ['background', 'content']
      scripts.forEach((name) => {
        this.emitFile({
          type: 'asset',
          fileName: `${name}.js`,
          source: readFileSync(
            resolve(__dirname, `src/${name}/index.js`),
            'utf-8'
          ),
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), extensionScripts()],

  // Use relative paths so Chrome can resolve assets correctly
  base: './',

  build: {
    outDir: 'dist',
    emptyOutDir: true,

    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        sidepanel: resolve(__dirname, 'sidepanel.html'),
      },
      output: {
        // React bundles go into assets/ with content hashes
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },

    // Chrome extensions don't support ES module imports — disable module preload
    modulePreload: false,

    // Use modern JS — Chrome/Brave support ESNext natively
    target: 'esnext',
  },
})
