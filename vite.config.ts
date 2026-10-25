// git 依赖消费方经 prepare → build 拿 dist 产物；peer 依赖外部化，宿主自持单一实例。
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const peers = ["vue", "vue-i18n", "primevue", "@primeuix/themes", "lucide-vue-next"];

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
      formats: ["es"],
      cssFileName: "components",
    },
    rollupOptions: {
      external: (id) => peers.some((p) => id === p || id.startsWith(`${p}/`)),
      output: {
        entryFileNames: "index.js",
        // SFC scoped 样式的合并产物是本构建唯一资产，固定命名供 "./components.css" 子路径指认。
        assetFileNames: "components.css",
      },
    },
  },
});
