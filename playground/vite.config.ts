import { resolve } from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { llmsDevFiles } from "../scripts/vite-plugin-llms-dev.mjs";

export default defineConfig({
  plugins: [vue(), tailwindcss(), llmsDevFiles()],
  resolve: {
    alias: {
      "@mango-write/ui-mp/styles.css": resolve(
        import.meta.dirname,
        "../packages/mp/src/styles/mp-styles.css",
      ),
      "@mango-write/ui-mp": resolve(import.meta.dirname, "../packages/mp/src/index.ts"),
    },
    conditions: ["mango-source", "module", "import", "browser", "default"],
    dedupe: ["vue", "vue-router", "vue-i18n", "reka-ui"],
  },
  server: {
    port: 5176,
  },
  build: {
    outDir: "../dist-playground",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        mp: resolve(import.meta.dirname, "mp.html"),
      },
    },
  },
});
