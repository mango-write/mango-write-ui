<script setup lang="ts">
// 站点壳顶栏：write landing 与 rewrite 营销站共用。霜面固定栏 + 品牌 slot +
// nav + 语言切换（可选，圆形单字按钮）+ 主题切换 + 移动抽屉。不依赖 vue-router /
// pinia / i18n——链接是裸 <a href>（营销页整页跳转可接受），文案与右侧动作全部由
// props/slots 注入；语言切换只暴露开关与 emit，具体切换逻辑由各 app 注入。
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import { Menu, Moon, Sun, X } from "lucide-vue-next";

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
function toggleTheme(event?: MouseEvent) {
  setTheme(themeResolved.value === "dark" ? "light" : "dark", event);
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
  <header ref="headerEl" class="mw-site-header mw-frost" :class="{ scrolled }">
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
          class="mw-site-header__icon-btn mw-site-header__theme-btn"
          :data-theme-state="themeResolved"
          :aria-label="themeLabel"
          :title="themeLabel"
          @click="toggleTheme($event)"
        >
          <span class="mw-site-header__theme-stage" aria-hidden="true">
            <Sun class="mw-site-header__theme-icon mw-site-header__theme-icon--sun" />
            <Moon class="mw-site-header__theme-icon mw-site-header__theme-icon--moon" />
          </span>
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
        <Menu v-if="!menuOpen" aria-hidden="true" />
        <X v-else aria-hidden="true" />
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
        <button
          v-if="showTheme"
          type="button"
          class="mw-site-header__drawer-theme mw-site-header__theme-btn"
          :data-theme-state="themeResolved"
          :aria-label="themeLabel"
          @click="toggleTheme($event)"
        >
          <span class="mw-site-header__theme-stage" aria-hidden="true">
            <Sun class="mw-site-header__theme-icon mw-site-header__theme-icon--sun" />
            <Moon class="mw-site-header__theme-icon mw-site-header__theme-icon--moon" />
          </span>
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
