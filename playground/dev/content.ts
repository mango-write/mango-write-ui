/**
 * 展示站与 gen-llms 共用的安装/上手文案——单一事实源:
 * 安装与上手页面渲染它,llms.txt / llms-full.txt 也由它生成(gen-llms 取 zh)。
 */

import type { Bi } from "./i18n";

export interface ContentStep {
  title: Bi;
  desc?: Bi;
  /** 语言中立或双语代码;code 内的注释/演示文案必须双语 */
  code: string | Bi;
  /** 代码语言,供围栏标注 */
  lang: string;
}

export const libraryIntro: Bi = {
  zh: "「纸与霜」设计语言的 Vue 3 组件库:50+ 个组件、10 篇设计规范,语义 token 驱动浅色与深色双主题。Apache-2.0 开源。",
  en: "The Vue 3 component library for the Paper & Frost design language: 50+ components and 10 design notes, with semantic tokens driving light and dark themes. Open source under Apache-2.0.",
};

export const reactLibraryIntro: Bi = {
  zh: "「纸与霜」设计语言的 React 组件库:50+ 个桌面组件与 @mango-write/ui-vue 100% 对等,基于 Radix UI 与语义 token 驱动浅色与深色双主题。Apache-2.0 开源。",
  en: "The React component library for the Paper & Frost design language: 50+ desktop components at 100% parity with @mango-write/ui-vue, powered by Radix UI and semantic light/dark tokens. Open source under Apache-2.0.",
};

export const installSteps: ContentStep[] = [
  {
    title: { zh: "安装依赖", en: "Install dependencies" },
    desc: {
      zh: "组件库经 GitHub 分发,同时安装运行时依赖(Vue、PrimeVue、i18n、图标)与构建期依赖(Tailwind)。",
      en: "The library ships from GitHub; install runtime dependencies (Vue, PrimeVue, i18n, icons) and build-time dependencies (Tailwind) alongside it.",
    },
    lang: "sh",
    code: `pnpm add @mango-write/ui-vue@github:mango-write/mango-write-ui#v0.1.0
pnpm add vue primevue @primeuix/themes vue-i18n lucide-vue-next
pnpm add -D tailwindcss @tailwindcss/vite tailwindcss-primeui`,
  },
  {
    title: { zh: "配置 Vite", en: "Configure Vite" },
    lang: "ts",
    code: `import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({ plugins: [vue(), tailwindcss()] });`,
  },
  {
    title: { zh: "引入样式", en: "Import the styles" },
    desc: {
      zh: "在应用样式入口引入主题聚合入口,并让 Tailwind 扫描组件库源码。",
      en: "Import the theme aggregation entry in your app's style entry, and point Tailwind at the library source.",
    },
    lang: "css",
    code: `@import "tailwindcss" prefix(tw);
@import "@mango-write/ui-vue/theme.css";
@import "@mango-write/ui-vue/components.css";
@source "../node_modules/@mango-write/ui-vue/src";`,
  },
  {
    title: { zh: "初始化主题与文案", en: "Initialize theme and messages" },
    desc: {
      zh: "mergeUiMessages 注入组件内置文案,initTheme 按 data-theme 驱动浅/深色,vTooltip 与 vScrollFade 注册全局指令。",
      en: "mergeUiMessages injects the components' built-in strings, initTheme drives light/dark via data-theme, and vTooltip plus vScrollFade register global directives.",
    },
    lang: "ts",
    code: `import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import { initTheme, mergeUiMessages, vScrollFade, vTooltip } from "@mango-write/ui-vue";
import App from "./App.vue";
import "./style.css";

const i18n = createI18n({ legacy: false, locale: "zh-CN", messages: {} });
mergeUiMessages(i18n);
initTheme();

createApp(App)
  .use(i18n)
  .directive("tooltip", vTooltip)
  .directive("scroll-fade", vScrollFade)
  .mount("#app");`,
  },
  {
    title: { zh: "第一个组件", en: "Your first component" },
    lang: "vue",
    code: {
      zh: `<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@mango-write/ui-vue";

const saved = ref(false);
</script>

<template>
  <Button :label="saved ? '已保存' : '保存修改'" @click="saved = true" />
</template>`,
      en: `<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@mango-write/ui-vue";

const saved = ref(false);
</script>

<template>
  <Button :label="saved ? 'Saved' : 'Save changes'" @click="saved = true" />
</template>`,
    },
  },
];

export const reactInstallSteps: ContentStep[] = [
  {
    title: { zh: "安装依赖", en: "Install dependencies" },
    desc: {
      zh: "组件库经 GitHub 子目录分发,安装 @mango-write/ui-core 与 @mango-write/ui-react,并配置 React 运行时与图标依赖。",
      en: "The library ships from GitHub subdirectories; install @mango-write/ui-core and @mango-write/ui-react alongside React and Lucide icons.",
    },
    lang: "sh",
    code: `pnpm add "@mango-write/ui-core@git+https://github.com/mango-write/mango-write-ui.git#v0.1.0&path:packages/core"
pnpm add "@mango-write/ui-react@git+https://github.com/mango-write/mango-write-ui.git#v0.1.0&path:packages/react"
pnpm add react react-dom lucide-react
pnpm add -D @vitejs/plugin-react`,
  },
  {
    title: { zh: "配置 Vite", en: "Configure Vite" },
    lang: "ts",
    code: `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({ plugins: [react()] });`,
  },
  {
    title: { zh: "引入样式", en: "Import the styles" },
    desc: {
      zh: "组件库自带纯静态语义 token 与组件样式,按顺序引入 tokens.css、base.css 与 components.css(或直接引入 theme.css 聚合入口)。",
      en: "The library ships static semantic tokens and component styles; import tokens.css, base.css, and components.css in order (or use theme.css as a single entry).",
    },
    lang: "css",
    code: `@import "@mango-write/ui-react/tokens.css";
@import "@mango-write/ui-react/base.css";
@import "@mango-write/ui-react/components.css";`,
  },
  {
    title: { zh: "初始化主题与全局宿主", en: "Initialize theme and global hosts" },
    desc: {
      zh: "initTheme 按 data-theme 驱动浅/深色,UiLocaleProvider 注入内置双语文案,ConfirmProvider + ConfirmHost 与 NotifyProvider + ToastHost 承载命令式确认框与轻提示。",
      en: "initTheme drives light/dark via data-theme, UiLocaleProvider supplies built-in bilingual messages, and ConfirmProvider + ConfirmHost plus NotifyProvider + ToastHost host imperative confirms and toasts.",
    },
    lang: "tsx",
    code: `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  ConfirmHost,
  ConfirmProvider,
  NotifyProvider,
  ToastHost,
  UiLocaleProvider,
  initTheme,
} from "@mango-write/ui-react";
import App from "./App";
import "./style.css";

initTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UiLocaleProvider locale="zh-CN">
      <ConfirmProvider>
        <NotifyProvider>
          <App />
          <ConfirmHost />
          <ToastHost position="top-right" />
        </NotifyProvider>
      </ConfirmProvider>
    </UiLocaleProvider>
  </StrictMode>,
);`,
  },
  {
    title: { zh: "第一个组件", en: "Your first component" },
    lang: "tsx",
    code: {
      zh: `import { useState } from "react";
import { Button } from "@mango-write/ui-react";

export default function SaveButton() {
  const [saved, setSaved] = useState(false);

  return (
    <Button
      label={saved ? "已保存" : "保存修改"}
      onClick={() => setSaved(true)}
    />
  );
}`,
      en: `import { useState } from "react";
import { Button } from "@mango-write/ui-react";

export default function SaveButton() {
  const [saved, setSaved] = useState(false);

  return (
    <Button
      label={saved ? "Saved" : "Save changes"}
      onClick={() => setSaved(true)}
    />
  );
}`,
    },
  },
];
