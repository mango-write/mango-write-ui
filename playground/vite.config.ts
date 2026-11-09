import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { llmsDevFiles } from "../scripts/vite-plugin-llms-dev.mjs";

export default defineConfig({
  plugins: [vue(), tailwindcss(), llmsDevFiles()],
  resolve: {
    conditions: ["mango-source", "module", "import", "browser", "default"],
    dedupe: ["vue", "vue-router", "vue-i18n", "reka-ui"],
  },
  server: {
    port: 5176,
  },
  build: {
    outDir: "../dist-playground",
    emptyOutDir: true,
  },
});
