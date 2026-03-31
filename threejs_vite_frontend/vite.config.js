import { defineConfig } from "vite";

/**
 * Vite config for the Three.js car demo.
 * Note: the dev script can pass --port via $VITE_PORT; this config keeps defaults simple.
 */
export default defineConfig({
  server: {
    host: true
  },
  preview: {
    host: true
  }
});
