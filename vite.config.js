import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { readFileSync } from "fs";

/**
 * Copies plain JS files (background service worker) into dist/.
 * These don't need React or bundling — emitted as-is for Chrome.
 */
function extensionScripts() {
  return {
    name: "extension-scripts",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "background.js",
        source: readFileSync(
          resolve(__dirname, "src/background.js"),
          "utf-8",
        ),
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), extensionScripts()],
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, "sidepanel.html"),
      },
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
    modulePreload: false,
    target: "esnext",
  },
});
