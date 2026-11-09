// git 依赖消费方经 prepare → build 拿 dist 产物；peer 与 @mango-write/ui-core 外部化，宿主自持单一实例。
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

const peers = [
  "vue",
  "vue-i18n",
  "lucide-vue-next",
  "reka-ui",
  "@tanstack/vue-table",
  "@mango-write/ui-core",
];

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    dedupe: ["vue", "vue-router", "vue-i18n", "reka-ui"],
  },
  build: {
    minify: false,
    lib: {
      entry: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
      formats: ["es"],
      cssFileName: "components",
    },
    rollupOptions: {
      external: (id) => peers.some((p) => id === p || id.startsWith(`${p}/`)),
      output: {
        preserveModules: true,
        preserveModulesRoot: fileURLToPath(new URL("./src", import.meta.url)),
        entryFileNames: "[name].js",
        // SFC scoped 样式的合并产物是本构建唯一资产，固定命名供 "./components.css" 子路径指认。
        assetFileNames: "components.css",
      },
    },
  },
});
