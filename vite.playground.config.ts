// 展示站（index.html + dev/）的 app 模式构建，产物落 dist-playground——
// 不能落默认 dist，那里是 lib 构建的发布产物。宿主仓 ship 以此打包 ui-playground 静态站。
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { llmsDevFiles } from "./scripts/vite-plugin-llms-dev.mjs";

export default defineConfig({
  plugins: [vue(), tailwindcss(), llmsDevFiles()],
  resolve: {
    dedupe: ["vue", "vue-router", "vue-i18n", "primevue"],
  },
  build: {
    outDir: "dist-playground",
  },
});
