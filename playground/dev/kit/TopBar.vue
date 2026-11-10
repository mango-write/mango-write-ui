<script setup lang="ts">
// 展示站统一顶栏,首页与文档壳共用:霜面贴边栏 + 品牌回首页 + 区域切换 +
// 语言切换 + LLM 接入 + 主题档位 + 产品入口 + GitHub。文档壳经 #append 注入
// 版本号与搜索入口,首页留空。
import { computed } from "vue";
import { useRoute } from "vue-router";
import {
  AppLogo,
  Button,
  SelectButton,
  useThemePreference,
  type ThemePreference,
} from "@mango-write/ui-vue";
import { locale, setLocale, t, type Locale } from "../i18n";

const githubUrl = "https://github.com/mango-write/mango-write-ui";
// 根相对路径:dev 由 vite 中间件伺服产物,线上随部署域名走(见 vite.playground.config.ts)。
const llmsUrl = "/llms.txt";
const foundationsEntry = "/foundations/overview";
const desktopEntry = "/getting-started/installation";
const mobileEntry = "/mobile/installation";

const route = useRoute();
// 顶栏四栏一级导航:首页 / 设计语言 / 桌面端组件 / 移动端组件,按当前路由归属高亮。
const isLanding = computed(() => route.meta.landing === true);
const activeSection = computed(() => {
  if (isLanding.value) return "landing";
  if (route.meta.section) return route.meta.section;
  if (route.path.startsWith("/foundations")) return "foundations";
  if (route.path.startsWith("/mobile")) return "mobile";
  return "desktop";
});

const s = {
  brandHome: { zh: "MangoWrite UI 首页", en: "MangoWrite UI home" },
  mainNav: { zh: "主导航", en: "Main navigation" },
  home: { zh: "首页", en: "Home" },
  design: { zh: "设计语言", en: "Design Language" },
  desktopDocs: { zh: "桌面端组件", en: "Desktop" },
  mobileDocs: { zh: "移动端组件", en: "Mobile" },
  llms: { zh: "LLM 接入", en: "LLM docs" },
  theme: { zh: "颜色主题", en: "Color theme" },
  light: { zh: "浅色", en: "Light" },
  dark: { zh: "深色", en: "Dark" },
  system: { zh: "系统", en: "System" },
  deai: { zh: "降 AI", en: "Rewrite" },
  research: { zh: "科研平台", en: "Research platform" },
  gh: { zh: "GitHub 仓库", en: "GitHub repository" },
  lang: { zh: "界面语言", en: "Interface language" },
} as const;

const { preference, setTheme } = useThemePreference();
const themeOptions = computed(() => [
  { label: t(s.light), value: "light" },
  { label: t(s.dark), value: "dark" },
  { label: t(s.system), value: "system" },
]);

function updateTheme(value: unknown) {
  if (value === "light" || value === "dark" || value === "system") setTheme(value);
}

// 语言标签固定「中 / EN」:切换目标用本名示人,不随界面语言翻。
const langOptions: { label: string; value: Locale }[] = [
  { label: "中", value: "zh-CN" }, // i18n-allow 本名示人
  { label: "EN", value: "en-US" },
];

function updateLocale(value: unknown) {
  if (value === "zh-CN" || value === "en-US") setLocale(value);
}
</script>

<template>
  <header class="dev-topbar mw-frost">
    <RouterLink to="/" class="dev-topbar__brand" :aria-label="t(s.brandHome)">
      <AppLogo mark-only />
      <span class="dev-topbar__name">MangoWrite UI</span>
    </RouterLink>
    <nav class="dev-topbar__nav" :aria-label="t(s.mainNav)">
      <RouterLink to="/" class="dev-topbar__navlink" :class="{ 'is-active': activeSection === 'landing' }">
        {{ t(s.home) }}
      </RouterLink>
      <RouterLink
        :to="foundationsEntry"
        class="dev-topbar__navlink"
        :class="{ 'is-active': activeSection === 'foundations' }"
      >
        {{ t(s.design) }}
      </RouterLink>
      <RouterLink
        :to="desktopEntry"
        class="dev-topbar__navlink"
        :class="{ 'is-active': activeSection === 'desktop' }"
      >
        {{ t(s.desktopDocs) }}
      </RouterLink>
      <RouterLink
        :to="mobileEntry"
        class="dev-topbar__navlink"
        :class="{ 'is-active': activeSection === 'mobile' }"
      >
        {{ t(s.mobileDocs) }}
      </RouterLink>
    </nav>
    <span class="dev-topbar__spacer" />
    <slot name="append" />
    <Button
      :href="llmsUrl"
      target="_blank"
      rel="noreferrer"
      size="sm"
      :label="t(s.llms)"
    />
    <SelectButton
      class="dev-topbar__lang"
      :model-value="locale"
      :options="langOptions"
      option-label="label"
      option-value="value"
      :allow-empty="false"
      size="sm"
      :aria-label="t(s.lang)"
      @update:model-value="updateLocale"
    />
    <SelectButton
      class="dev-topbar__theme"
      :model-value="preference"
      :options="themeOptions"
      option-label="label"
      option-value="value"
      :allow-empty="false"
      size="sm"
      :aria-label="t(s.theme)"
      @update:model-value="updateTheme"
    />
    <Button
      class="dev-topbar__product"
      href="https://rewrite.mangowrite.com"
      target="_blank"
      rel="noreferrer"
      size="sm"
      variant="outlined"
      severity="secondary"
      :label="t(s.deai)"
    />
    <Button
      class="dev-topbar__product"
      href="https://mangowrite.com"
      target="_blank"
      rel="noreferrer"
      size="sm"
      variant="outlined"
      severity="secondary"
      :label="t(s.research)"
    />
    <a class="dev-topbar__gh" :href="githubUrl" target="_blank" rel="noreferrer" :aria-label="t(s.gh)">
      <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path
          d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"
        />
      </svg>
    </a>
  </header>
</template>

<style scoped>
/* 主产品工作台同款「浮岛」顶栏:离边留 gutter、四角圆,与下方岛同缝(8px)。
   首页滚动时内容从岛底穿过——真玻璃把底霜调薄一档,影子才透得出来。 */
.dev-topbar {
  position: sticky;
  top: var(--space-2);
  z-index: var(--z-sticky);
  margin: var(--space-2) var(--space-2) 0;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2-5) var(--space-4);
  border-radius: var(--radius-card);
  background-color: color-mix(in srgb, var(--frost-bg) 45%, transparent);
}

.dev-topbar__brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-primary);
  text-decoration: none;
}

/* 字样行盒钉 mark 高(--size-sm-h)垂直居中,字级取 headline(24px,cap≈0.6 图高),
   700 字重贴 logo 字形的笔画粗细。圆角字形来自自托管 Nunito(OFL),加载失败落
   ui-rounded(Safari)再落系统 sans;色取 mark 同款 accent。 */
.dev-topbar__name {
  font-family: "Nunito", ui-rounded, var(--font-sans);
  font-size: var(--type-headline-size);
  line-height: var(--size-sm-h);
  font-weight: var(--weight-bold);
  color: var(--accent);
  white-space: nowrap;
}

/* 区域切换胶囊,同目录栏(dev-nav__item)一套语言:hover 浮起、当前区 selected 填充。 */
.dev-topbar__nav {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.dev-topbar__navlink {
  display: inline-flex;
  align-items: center;
  height: var(--size-sm-h);
  padding: 0 var(--space-2-5);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  font-size: var(--type-body-sm-size);
  text-decoration: none;
  white-space: nowrap;
}

.dev-topbar__navlink:hover {
  background: var(--fill-default);
  color: var(--text-primary);
}

.dev-topbar__navlink.is-active {
  background: var(--fill-selected);
  color: var(--text-primary);
  font-weight: var(--weight-medium);
}

.dev-topbar__spacer {
  flex: 1;
}

.dev-topbar__gh {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--size-sm-h);
  height: var(--size-sm-h);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}

.dev-topbar__gh:hover {
  background: var(--fill-default);
  color: var(--text-primary);
}

@media (max-width: 720px) {
  .dev-topbar {
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
  }

  /* 产品入口与主题档位收起,给区域胶囊和 LLM 接入让位;主题回落系统档。
     语言切换保持可见——这是手机档唯一还能切语言的入口。 */
  .dev-topbar__product,
  .dev-topbar__theme {
    display: none;
  }
}

@media (max-width: 480px) {
  .dev-topbar__name {
    display: none;
  }
}
</style>
