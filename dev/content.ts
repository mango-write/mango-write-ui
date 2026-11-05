/**
 * 展示站与 gen-llms 共用的安装/上手文案——单一事实源:
 * 安装与上手页面渲染它,llms.txt / llms-full.txt 也由它生成。
 */

export interface ContentStep {
  title: string;
  desc?: string;
  code: string;
  /** 代码语言,供围栏标注 */
  lang: string;
}

export const libraryIntro =
  "「纸与霜」设计语言的 Vue 3 组件库:50+ 个组件、10 篇设计规范,语义 token 驱动浅色与深色双主题。Apache-2.0 开源。";

export const installSteps: ContentStep[] = [
  {
    title: "安装依赖",
    desc: "组件库经 GitHub 分发,同时安装运行时依赖(Vue、PrimeVue、i18n、图标)与构建期依赖(Tailwind)。",
    lang: "sh",
    code: `pnpm add @mango-write/ui@github:mango-write/mango-write-ui#v0.1.0
pnpm add vue primevue @primeuix/themes vue-i18n lucide-vue-next
pnpm add -D tailwindcss @tailwindcss/vite tailwindcss-primeui`,
  },
  {
    title: "配置 Vite",
    lang: "ts",
    code: `import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({ plugins: [vue(), tailwindcss()] });`,
  },
  {
    title: "引入样式",
    desc: "在应用样式入口引入主题聚合入口,并让 Tailwind 扫描组件库源码。",
    lang: "css",
    code: `@import "tailwindcss" prefix(tw);
@import "@mango-write/ui/theme.css";
@import "@mango-write/ui/components.css";
@source "../node_modules/@mango-write/ui/src";`,
  },
  {
    title: "初始化主题与文案",
    desc: "mergeUiMessages 注入组件内置文案,initTheme 按 data-theme 驱动浅/深色。",
    lang: "ts",
    code: `import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import { initTheme, mergeUiMessages, vTooltip } from "@mango-write/ui";
import App from "./App.vue";
import "./style.css";

const i18n = createI18n({ legacy: false, locale: "zh-CN", messages: {} });
mergeUiMessages(i18n);
initTheme();

createApp(App)
  .use(i18n)
  .directive("tooltip", vTooltip)
  .mount("#app");`,
  },
  {
    title: "第一个组件",
    lang: "vue",
    code: `<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@mango-write/ui";

const saved = ref(false);
</script>

<template>
  <Button :label="saved ? '已保存' : '保存修改'" @click="saved = true" />
</template>`,
  },
];
