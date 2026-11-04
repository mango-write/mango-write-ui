// git 依赖消费方经 prepare → build 拿 dist 产物；peer 依赖外部化，宿主自持单一实例。
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

const peers = [
  "vue",
  "vue-i18n",
  "primevue",
  "@primeuix/themes",
  "lucide-vue-next",
  "reka-ui",
  "@tanstack/vue-table",
];

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    dedupe: ["vue", "vue-router", "vue-i18n", "primevue", "reka-ui"],
  },
  server: {
    // 主仓 dev 拓扑把 5173-5175 分给了 web/authWeb/rewriteWeb，展示站让出。
    port: 5176,
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
