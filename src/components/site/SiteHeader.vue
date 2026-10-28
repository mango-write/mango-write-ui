<script setup lang="ts">
// 站点壳顶栏：write landing 与 rewrite 营销站共用。玻璃固定栏 + 品牌 slot +
// nav + 语言切换（可选，圆形单字按钮）+ 主题切换 + 移动抽屉。不依赖 vue-router /
// pinia / i18n——链接是裸 <a href>（营销页整页跳转可接受），文案与右侧动作全部由
// props/slots 注入；语言切换只暴露开关与 emit，具体切换逻辑由各 app 注入。
import { nextTick, onMounted, onUnmounted, ref } from "vue";

import AppLogo from "../AppLogo.vue";
import { useThemePreference } from "../../lib/theme";

interface SiteNavItem {
  label: string;
  href: string;
  active?: boolean;
}

const emit = defineEmits<{ (e: "toggle-lang"): void }>();

withDefaults(
  defineProps<{
    items?: SiteNavItem[];
    homeHref?: string;
    showTheme?: boolean;
    themeLabel?: string;
    showLang?: boolean;
    langLabel?: string;
    langTitle?: string;
    navigationLabel?: string;
    menuLabel?: string;
    /** 品牌链接的无障碍名。两个产品站品牌名不同，别写死。 */
    brandLabel?: string;
  }>(),
  {
    items: () => [],
    homeHref: "/",
    showTheme: true,
    themeLabel: "Toggle color theme",
    showLang: false,
    langLabel: "",
    langTitle: "Toggle language",
    navigationLabel: "Primary navigation",
    menuLabel: "Menu",
    brandLabel: "MangoWrite",
  },
);

const { resolved: themeResolved, setTheme } = useThemePreference();

function toggleLang() {
  emit("toggle-lang");
}

// 切换只有浅/深两档；「跟随系统」只是从未手动选择时的默认（lib/theme.ts 的
// preference 缺省值），不进 UI——一旦点过就固定在手动档。
function toggleTheme() {
  setTheme(themeResolved.value === "dark" ? "light" : "dark");
}

const scrolled = ref(false);
const menuOpen = ref(false);
const headerEl = ref<HTMLElement | null>(null);
const burgerRef = ref<HTMLButtonElement | null>(null);
const drawerRef = ref<HTMLElement | null>(null);
let previousOverflow = "";

// 抽屉挂在 fixed 头部下面，视口剩余高度得量了顶栏才知道；打开时量一次并写成
// CSS 变量（顶栏高度在 980/560 两档断点会变）。
function remeasureDrawerMax() {
  const chrome = headerEl.value?.querySelector(".mw-site-header__inner");
  if (chrome && menuOpen.value) {
    headerEl.value?.style.setProperty("--mw-site-header-chrome", `${chrome.getBoundingClientRect().height}px`);
  }
}

function drawerFocusables(): HTMLElement[] {
  return Array.from(
    drawerRef.value?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ) ?? [],
  );
}

function toggleDrawer() {
  if (menuOpen.value) {
    closeDrawer();
    return;
  }
  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  menuOpen.value = true;
  nextTick(() => {
    remeasureDrawerMax();
    (drawerFocusables()[0] ?? drawerRef.value)?.focus();
  });
}

function closeDrawer() {
  if (!menuOpen.value) return;
  menuOpen.value = false;
  document.body.style.overflow = previousOverflow;
  nextTick(() => burgerRef.value?.focus());
}

// landing 页是自滚动容器（#app 是 fixed shell），window 不滚——捕获阶段监听
// 才能同时覆盖 window 与容器滚动。
function onScroll(e: Event) {
  const el = e.target as HTMLElement | Document;
  const top = el === document ? window.scrollY : (el as HTMLElement).scrollTop;
  if (top > 20) scrolled.value = true;
  else if (window.scrollY <= 20) scrolled.value = false;
}

function onKeyDown(e: KeyboardEvent) {
  if (!menuOpen.value) return;
  if (e.key === "Escape") {
    closeDrawer();
    return;
  }
  if (e.key !== "Tab") return;
  const focusables = drawerFocusables();
  const first = focusables[0];
  const last = focusables.at(-1);
  if (!first || !last) return;
  if (e.shiftKey && (document.activeElement === first || document.activeElement === drawerRef.value)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && (document.activeElement === last || document.activeElement === drawerRef.value)) {
    e.preventDefault();
    first.focus();
  }
}

onMounted(() => {
  document.addEventListener("scroll", onScroll, true);
  document.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", remeasureDrawerMax);
});
onUnmounted(() => {
  document.removeEventListener("scroll", onScroll, true);
  document.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("resize", remeasureDrawerMax);
  if (menuOpen.value) document.body.style.overflow = previousOverflow;
});
</script>

<template>
  <header ref="headerEl" class="mw-site-header" :class="{ scrolled }">
    <div class="mw-site-header__inner">
      <a :href="homeHref" class="mw-site-header__brand" :aria-label="brandLabel">
        <slot name="brand"><AppLogo /></slot>
      </a>

      <div class="mw-site-header__desktop">
        <nav v-if="items.length" class="mw-site-header__nav" :aria-label="navigationLabel">
          <a
            v-for="item in items"
            :key="item.href"
            :href="item.href"
            class="mw-site-header__link"
            :class="{ active: item.active }"
            :aria-current="item.active ? 'page' : undefined"
            >{{ item.label }}</a
          >
        </nav>

        <button
          v-if="showLang"
          type="button"
          class="mw-site-header__icon-btn mw-site-header__lang"
          :aria-label="langTitle"
          :title="langTitle"
          @click="toggleLang"
        >{{ langLabel }}</button>

        <button
          v-if="showTheme"
          type="button"
          class="mw-site-header__icon-btn"
          :aria-label="themeLabel"
          :title="themeLabel"
          @click="toggleTheme"
        >
          <svg v-if="themeResolved === 'light'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
        </button>

        <slot name="actions" />
      </div>

      <button
        ref="burgerRef"
        type="button"
        class="mw-site-header__burger"
        :aria-expanded="menuOpen"
        aria-controls="mw-site-header-drawer"
        :aria-label="menuLabel"
        @click="toggleDrawer"
      >
        <svg v-if="!menuOpen" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>

    <div
      v-if="menuOpen"
      id="mw-site-header-drawer"
      ref="drawerRef"
      class="mw-site-header__drawer"
      role="dialog"
      aria-modal="true"
      :aria-label="menuLabel"
      tabindex="-1"
    >
      <nav v-if="items.length" class="mw-site-header__drawer-nav" :aria-label="navigationLabel">
        <a
          v-for="item in items"
          :key="item.href"
          :href="item.href"
          class="mw-site-header__drawer-link"
          :class="{ active: item.active }"
          :aria-current="item.active ? 'page' : undefined"
          @click="closeDrawer"
          >{{ item.label }}</a
        >
      </nav>
      <div class="mw-site-header__drawer-row">
        <button v-if="showLang" type="button" class="mw-site-header__drawer-theme mw-site-header__lang" :aria-label="langTitle" @click="toggleLang(); closeDrawer()">{{ langLabel }}</button>
        <button v-if="showTheme" type="button" class="mw-site-header__drawer-theme" :aria-label="themeLabel" @click="toggleTheme">
          <svg v-if="themeResolved === 'light'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
        </button>
        <!-- 抽屉状态只在壳内部；宿主把链接拦成 SPA 导航时（不整页重载），须自行调用 closeDrawer 收抽屉 -->
        <slot name="mobile-actions" :close-drawer="closeDrawer" />
      </div>
    </div>

    <!-- 遮罩 teleport 到 body：header 的 backdrop-filter 会成为 fixed 后代的包含块，画不出全屏。z 在 header 之下，点击即收起抽屉 -->
    <teleport to="body">
      <div v-if="menuOpen" class="mw-site-header__scrim" @click="closeDrawer()" />
    </teleport>
  </header>
</template>

<style scoped>
.mw-site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--color-surface-glass);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--color-border-soft);
  transition: box-shadow 0.3s ease;
}

.mw-site-header.scrolled {
  box-shadow: var(--shadow-xs);
}

.mw-site-header__inner {
  max-width: var(--site-chrome, 1240px);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 24px;
}

.mw-site-header__brand {
  display: inline-flex;
  align-items: center;
  /* brand slot 可以在 logo 旁挂产品后缀标（rewrite 站的「降 AI」），留间距。 */
  gap: 0.5rem;
  text-decoration: none;
}

/* 顶栏 logo 比组件默认（26px）大一圈，营销/站点壳更醒目。 */
.mw-site-header :deep(.mw-logo) {
  height: 32px;
}

.mw-site-header__desktop {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mw-site-header__nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mw-site-header__link {
  position: relative;
  display: inline-flex;
  align-items: center;
  border-radius: var(--radius-pill);
  padding: 6px 12px;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 0.15s ease-out, background-color 0.15s ease-out;
}

.mw-site-header__link:hover {
  color: var(--color-text-primary);
  background: rgb(var(--color-brand-500-rgb) / 0.08);
}

.mw-site-header__link.active {
  color: var(--color-brand-700);
  background: rgb(var(--color-brand-500-rgb) / 0.14);
}

.mw-site-header__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: color 0.15s ease-out, background-color 0.15s ease-out;
}

.mw-site-header__icon-btn:hover {
  color: var(--color-text-primary);
  background: rgb(var(--color-brand-500-rgb) / 0.08);
}

/* 语言切换按钮：与主题按钮同形（圆形 36px），用单字/双字标签表达当前语言。 */
.mw-site-header__lang {
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.mw-site-header__burger {
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-brand-500);
  cursor: pointer;
}

.mw-site-header__burger:hover {
  background: rgb(var(--color-brand-500-rgb) / 0.08);
}

.mw-site-header__scrim {
  position: fixed;
  inset: 0;
  /* header 自身 z-index 100；遮罩必须垫在它下面，点内容区任意处收起抽屉 */
  z-index: 99;
  background: var(--material-mask);
  animation: mw-site-header-fade-in 160ms ease-out;
}

.mw-site-header__drawer {
  max-height: calc(100dvh - var(--mw-site-header-chrome, 68px));
  overflow-y: auto;
  overscroll-behavior: contain;
  border-top: 1px solid var(--color-border-subtle);
  background: var(--color-surface-overlay);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  animation: mw-site-header-slide-down 200ms ease-out;
}

.mw-site-header__drawer-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 24px 0;
}

.mw-site-header__drawer-link {
  border-radius: var(--radius-sm);
  padding: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 0.15s ease-out, background-color 0.15s ease-out;
}

.mw-site-header__drawer-link:hover {
  color: var(--color-text-primary);
  background: rgb(var(--color-brand-500-rgb) / 0.08);
}

.mw-site-header__drawer-link.active {
  color: var(--color-text-primary);
  background: rgb(var(--color-brand-500-rgb) / 0.12);
}

.mw-site-header__drawer-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 24px 20px;
}

.mw-site-header__drawer-theme {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
}

@keyframes mw-site-header-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.mw-site-header__drawer-theme:hover {
  background: rgb(var(--color-brand-500-rgb) / 0.08);
}

@keyframes mw-site-header-slide-down {
  from {
    opacity: 0;
    transform: translateY(-0.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 980px) {
  .mw-site-header__desktop {
    display: none;
  }

  .mw-site-header__burger {
    display: inline-flex;
  }
}

@media (max-width: 560px) {
  .mw-site-header__inner {
    padding: 10px 16px;
  }

  .mw-site-header__drawer-nav {
    padding: 8px 12px 0;
  }

  .mw-site-header__drawer-row {
    padding: 8px 16px 20px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mw-site-header,
  .mw-site-header__link,
  .mw-site-header__icon-btn,
  .mw-site-header__drawer-link {
    transition: none;
  }

  .mw-site-header__scrim,
  .mw-site-header__drawer {
    animation: none;
  }
}
</style>
