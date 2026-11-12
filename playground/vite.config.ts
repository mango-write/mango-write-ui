import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { defineConfig, type Alias, type PluginOption } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { llmsDevFiles } from "../scripts/vite-plugin-llms-dev.mjs";

// 主仓 CI 不安装 packages/react 依赖：仅当本地存在依赖时加载 React 插件与 react.html 入口。
const reactPkgDir = resolve(import.meta.dirname, "../packages/react");
const reactNodeModules = resolve(reactPkgDir, "node_modules");
const hasReactPlugin = existsSync(resolve(reactNodeModules, "@vitejs/plugin-react"));
const hasReactRuntime = existsSync(resolve(reactNodeModules, "react"));

const plugins: PluginOption[] = [vue(), tailwindcss(), llmsDevFiles()];
if (hasReactPlugin) {
  const requireFromReact = createRequire(new URL("../packages/react/package.json", import.meta.url));
  const reactPluginModule = requireFromReact("@vitejs/plugin-react");
  const react = reactPluginModule.default ?? reactPluginModule;
  plugins.push(
    react({
      include: [/react-preview\/.*\.[tj]sx?$/, /packages\/react\/src\/.*\.[tj]sx?$/],
    }),
  );
}

const alias: Alias[] = [
  {
    find: "@mango-write/ui-mp/styles.css",
    replacement: resolve(import.meta.dirname, "../packages/mp/src/styles/mp-styles.css"),
  },
  {
    find: "@mango-write/ui-mp",
    replacement: resolve(import.meta.dirname, "../packages/mp/src/index.ts"),
  },
  {
    find: "@mango-write/ui-react/tokens.css",
    replacement: resolve(reactPkgDir, "src/var.css"),
  },
  {
    find: /^@mango-write\/ui-react\/(.+)$/,
    replacement: `${resolve(reactPkgDir, "src")}/$1`,
  },
  {
    find: "@mango-write/ui-react",
    replacement: resolve(reactPkgDir, "src/index.ts"),
  },
  {
    find: /^react-dom\/(.+)$/,
    replacement: `${resolve(reactNodeModules, "react-dom")}/$1`,
  },
  {
    find: "react-dom",
    replacement: resolve(reactNodeModules, "react-dom"),
  },
  {
    find: /^react\/(.+)$/,
    replacement: `${resolve(reactNodeModules, "react")}/$1`,
  },
  {
    find: "react",
    replacement: resolve(reactNodeModules, "react"),
  },
  {
    find: "lucide-react",
    replacement: resolve(reactNodeModules, "lucide-react"),
  },
  {
    find: "@tanstack/react-table",
    replacement: resolve(reactNodeModules, "@tanstack/react-table"),
  },
  {
    find: "radix-ui",
    replacement: resolve(reactNodeModules, "radix-ui"),
  },
];

export default defineConfig({
  plugins,
  resolve: {
    alias,
    conditions: ["mango-source", "module", "import", "browser", "default"],
    dedupe: ["vue", "vue-router", "vue-i18n", "reka-ui", "react", "react-dom"],
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
        ...(hasReactRuntime ? { react: resolve(import.meta.dirname, "react.html") } : {}),
      },
    },
  },
});
