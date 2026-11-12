// 本仓独立测试配置（pnpm test；主仓内跑测试走主仓根 vitest.config）。
// Vue / React 双框架 DOM 环境物理隔离，纯 .test.ts 进 node 档。
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { defineConfig, type PluginOption } from "vitest/config";
import vue from "@vitejs/plugin-vue";

const reactRequire = createRequire(
  new URL("./packages/react/package.json", import.meta.url),
);
const reactPluginMod = (await import(
  pathToFileURL(reactRequire.resolve("@vitejs/plugin-react")).href
)) as { default: () => PluginOption };
const react = reactPluginMod.default;

const allDomPatterns = [
  "**/*.component.test.ts",
  "**/*.component.test.tsx",
  "**/*.dom.test.ts",
  "**/*.dom.test.tsx",
];
const vueDomPatterns = ["**/*.component.test.ts", "**/*.dom.test.ts"];
const reactDomPatterns = [
  "packages/react/**/*.component.test.ts",
  "packages/react/**/*.component.test.tsx",
  "packages/react/**/*.dom.test.ts",
  "packages/react/**/*.dom.test.tsx",
];
const baseExclude = ["**/node_modules/**", "**/dist/**", "**/dist-playground/**"];

const sharedResolve = {
  conditions: ["mango-source", "module", "import", "browser", "default"],
  dedupe: ["vue", "vue-router", "vue-i18n", "reka-ui", "react", "react-dom"],
};

export default defineConfig({
  resolve: sharedResolve,
  test: {
    projects: [
      {
        plugins: [vue()],
        resolve: sharedResolve,
        test: {
          name: "node",
          environment: "node",
          include: ["**/*.test.ts"],
          exclude: [...baseExclude, ...allDomPatterns],
        },
      },
      {
        plugins: [vue()],
        resolve: sharedResolve,
        test: {
          name: "dom",
          environment: "happy-dom",
          include: vueDomPatterns,
          exclude: [...baseExclude, "packages/react/**"],
        },
      },
      {
        plugins: [react()],
        resolve: sharedResolve,
        test: {
          name: "react-dom",
          environment: "happy-dom",
          setupFiles: ["./packages/react/src/test-utils/setup-dom.ts"],
          include: reactDomPatterns,
          exclude: baseExclude,
        },
      },
    ],
  },
});
