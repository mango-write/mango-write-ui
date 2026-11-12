<script setup lang="ts">
// 展示站统一顶栏,首页与文档壳共用:霜面贴边栏 + 品牌回首页 + 区域切换 +
// 语言切换 + LLM 接入 + 主题档位 + 产品入口 + GitHub。文档壳经 #append 注入
// 版本号与搜索入口,首页留空。
import { computed } from "vue";
import { useRoute } from "vue-router";
import { Moon, PenLine, Sun, WandSparkles } from "lucide-vue-next";
import { AppLogo, Button, useThemePreference } from "@mango-write/ui-vue";
import { FRAMEWORK_OPTIONS, desktopFramework, setDesktopFramework } from "../framework";
import { locale, setLocale, t } from "../i18n";

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
  theme: { zh: "切换深浅色主题", en: "Toggle color theme" },
  deai: { zh: "降 AI", en: "Rewrite" },
  research: { zh: "科研平台", en: "Research platform" },
  gh: { zh: "GitHub 仓库", en: "GitHub repository" },
  lang: { zh: "切换中英文", en: "Switch language" },
  frameworkSwitch: { zh: "切换桌面组件框架", en: "Switch desktop framework" },
} as const;

const { resolved: themeResolved, setTheme } = useThemePreference();

function toggleTheme(event: MouseEvent) {
  setTheme(themeResolved.value === "dark" ? "light" : "dark", event);
}

const languageShort = computed(() => (locale.value === "zh-CN" ? "中" : "EN")); // i18n-allow 本名示人

function toggleLocale() {
  setLocale(locale.value === "zh-CN" ? "en-US" : "zh-CN");
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
    <div
      v-if="activeSection === 'desktop'"
      class="dev-topbar__fw"
      role="group"
      :aria-label="t(s.frameworkSwitch)"
    >
      <button
        v-for="opt in FRAMEWORK_OPTIONS"
        :key="opt.value"
        type="button"
        class="dev-topbar__fw-btn"
        :class="{ 'is-active': desktopFramework === opt.value }"
        :aria-pressed="desktopFramework === opt.value"
        @click="setDesktopFramework(opt.value)"
      >{{ opt.label }}</button>
    </div>
    <slot name="append" />
    <Button
      class="dev-topbar__llms"
      :href="llmsUrl"
      target="_blank"
      rel="noreferrer"
      size="sm"
      rounded
      variant="outlined"
      severity="secondary"
      :label="t(s.llms)"
    />
    <button
      type="button"
      class="dev-topbar__icon-btn dev-topbar__lang"
      :aria-label="t(s.lang)"
      :title="t(s.lang)"
      @click="toggleLocale"
    >{{ languageShort }}</button>
    <button
      type="button"
      class="dev-topbar__icon-btn dev-topbar__theme-btn"
      :data-theme-state="themeResolved"
      :aria-label="t(s.theme)"
      :title="t(s.theme)"
      @click="toggleTheme($event)"
    >
      <span class="dev-topbar__theme-stage" aria-hidden="true">
        <Sun class="dev-topbar__theme-icon dev-topbar__theme-icon--sun" />
        <Moon class="dev-topbar__theme-icon dev-topbar__theme-icon--moon" />
      </span>
    </button>
    <Button
      class="dev-topbar__product dev-topbar__product--deai"
      href="https://rewrite.mangowrite.com"
      target="_blank"
      rel="noreferrer"
      size="sm"
      rounded
      severity="contrast"
      :icon="WandSparkles"
      :label="t(s.deai)"
    />
    <Button
      class="dev-topbar__product dev-topbar__product--write"
      href="https://mangowrite.com"
      target="_blank"
      rel="noreferrer"
      size="sm"
      rounded
      severity="primary"
      :icon="PenLine"
      :label="t(s.research)"
    />
    <a class="dev-topbar__icon-btn dev-topbar__gh" :href="githubUrl" target="_blank" rel="noreferrer" :aria-label="t(s.gh)">
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
  gap: var(--space-2);
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

.dev-topbar__fw {
  display: inline-flex;
  align-items: center;
  gap: var(--space-0-5);
  height: var(--size-sm-h);
  padding: var(--space-0-5);
  border: var(--border-width) solid var(--border-subtle);
  border-radius: var(--radius-full);
  background: var(--fill-default);
  flex-shrink: 0;
}

.dev-topbar__fw-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 var(--space-2-5);
  border: none;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--text-secondary);
  font-family: inherit;
  font-size: var(--type-caption-size);
  font-weight: var(--weight-medium);
  white-space: nowrap;
  cursor: pointer;
  transition:
    color var(--duration-fast) var(--ease-standard),
    background-color var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard);
}

.dev-topbar__fw-btn:hover {
  color: var(--text-primary);
}

.dev-topbar__fw-btn.is-active {
  background: var(--bg-elevated);
  color: var(--text-primary);
  font-weight: var(--weight-semibold);
  box-shadow: var(--shadow-xs);
}

.dev-topbar__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: var(--size-sm-h);
  height: var(--size-sm-h);
  padding: 0;
  border: none;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--text-secondary);
  font-family: inherit;
  cursor: pointer;
  transition:
    color var(--duration-fast) var(--ease-standard),
    background-color var(--duration-fast) var(--ease-standard);
}

.dev-topbar__icon-btn:hover {
  background: var(--fill-default);
  color: var(--text-primary);
}

.dev-topbar__lang {
  font-size: var(--type-body-sm-size);
  font-weight: var(--weight-bold);
}

.dev-topbar__theme-stage {
  position: relative;
  display: inline-grid;
  place-items: center;
  width: var(--icon-lg);
  height: var(--icon-lg);
}

.dev-topbar__theme-icon {
  grid-area: 1 / 1;
  width: var(--icon-lg);
  height: var(--icon-lg);
  transition:
    transform var(--duration-slow) var(--ease-spring-pop),
    opacity var(--duration-base) var(--ease-standard);
}

.dev-topbar__theme-btn[data-theme-state="light"] .dev-topbar__theme-icon--sun {
  opacity: 1;
  transform: rotate(0deg) scale(1);
}

.dev-topbar__theme-btn[data-theme-state="light"] .dev-topbar__theme-icon--moon {
  opacity: 0;
  transform: rotate(75deg) scale(0.45);
}

.dev-topbar__theme-btn[data-theme-state="dark"] .dev-topbar__theme-icon--sun {
  opacity: 0;
  transform: rotate(-75deg) scale(0.45);
}

.dev-topbar__theme-btn[data-theme-state="dark"] .dev-topbar__theme-icon--moon {
  opacity: 1;
  transform: rotate(0deg) scale(1);
}

.dev-topbar__product {
  font-weight: var(--weight-semibold);
}

.dev-topbar__product--write {
  background: linear-gradient(135deg, var(--accent-hover), var(--accent));
  box-shadow: 0 6px 16px color-mix(in srgb, var(--accent) 26%, transparent);
}

.dev-topbar__product--write:hover {
  box-shadow: 0 8px 20px color-mix(in srgb, var(--accent) 34%, transparent);
}

@media (max-width: 1080px) {
  .dev-topbar__name {
    display: none;
  }
}

@media (max-width: 880px) {
  .dev-topbar__llms {
    display: none;
  }
}

@media (max-width: 720px) {
  .dev-topbar {
    padding: var(--space-2) var(--space-3);
  }

  .dev-topbar__product {
    display: none;
  }
}

@media (max-width: 520px) {
  .dev-topbar__navlink {
    padding: 0 var(--space-2);
  }

  .dev-topbar__gh {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dev-topbar__icon-btn,
  .dev-topbar__theme-icon {
    transition: none;
  }
}
</style>
