<script setup lang="ts">
/**
 * MangoWrite · Icon catalog (dev-only, route `/dev/icon`)
 *
 * Living reference for every PrimeIcon available in the app. Use it to pick
 * the right `pi pi-*` class for components or plain `<i>` elements.
 */
import Button from "primevue/button";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import Tag from "primevue/tag";
import { useToast } from "primevue/usetoast";
import * as LucideIcons from "lucide-vue-next";
import { Scissors } from "lucide-vue-next";
import { computed, ref, type Component } from "vue";
import { AppLogo } from "../../src";

const toast = useToast();
const search = ref("");
const tab = ref<"primevue" | "lucide">("primevue");

const icons = [
  "pi pi-address-book",
  "pi pi-align-center",
  "pi pi-align-justify",
  "pi pi-align-left",
  "pi pi-align-right",
  "pi pi-android",
  "pi pi-angle-double-down",
  "pi pi-angle-double-left",
  "pi pi-angle-double-right",
  "pi pi-angle-double-up",
  "pi pi-angle-down",
  "pi pi-angle-left",
  "pi pi-angle-right",
  "pi pi-angle-up",
  "pi pi-apple",
  "pi pi-arrow-circle-down",
  "pi pi-arrow-circle-left",
  "pi pi-arrow-circle-right",
  "pi pi-arrow-circle-up",
  "pi pi-arrow-down",
  "pi pi-arrow-down-left",
  "pi pi-arrow-down-left-and-arrow-up-right-to-center",
  "pi pi-arrow-down-right",
  "pi pi-arrow-left",
  "pi pi-arrow-right",
  "pi pi-arrow-right-arrow-left",
  "pi pi-arrow-up",
  "pi pi-arrow-up-left",
  "pi pi-arrow-up-right",
  "pi pi-arrow-up-right-and-arrow-down-left-from-center",
  "pi pi-arrows-alt",
  "pi pi-arrows-h",
  "pi pi-arrows-v",
  "pi pi-asterisk",
  "pi pi-at",
  "pi pi-backward",
  "pi pi-ban",
  "pi pi-barcode",
  "pi pi-bars",
  "pi pi-bell",
  "pi pi-bell-slash",
  "pi pi-bitcoin",
  "pi pi-bolt",
  "pi pi-book",
  "pi pi-bookmark",
  "pi pi-bookmark-fill",
  "pi pi-box",
  "pi pi-briefcase",
  "pi pi-building",
  "pi pi-building-columns",
  "pi pi-bullseye",
  "pi pi-calculator",
  "pi pi-calendar",
  "pi pi-calendar-clock",
  "pi pi-calendar-minus",
  "pi pi-calendar-plus",
  "pi pi-calendar-times",
  "pi pi-camera",
  "pi pi-car",
  "pi pi-caret-down",
  "pi pi-caret-left",
  "pi pi-caret-right",
  "pi pi-caret-up",
  "pi pi-cart-arrow-down",
  "pi pi-cart-minus",
  "pi pi-cart-plus",
  "pi pi-chart-bar",
  "pi pi-chart-line",
  "pi pi-chart-pie",
  "pi pi-chart-scatter",
  "pi pi-check",
  "pi pi-check-circle",
  "pi pi-check-square",
  "pi pi-chevron-circle-down",
  "pi pi-chevron-circle-left",
  "pi pi-chevron-circle-right",
  "pi pi-chevron-circle-up",
  "pi pi-chevron-down",
  "pi pi-chevron-left",
  "pi pi-chevron-right",
  "pi pi-chevron-up",
  "pi pi-circle",
  "pi pi-circle-fill",
  "pi pi-circle-off",
  "pi pi-circle-on",
  "pi pi-clipboard",
  "pi pi-clock",
  "pi pi-clone",
  "pi pi-cloud",
  "pi pi-cloud-download",
  "pi pi-cloud-upload",
  "pi pi-code",
  "pi pi-cog",
  "pi pi-comment",
  "pi pi-comments",
  "pi pi-compass",
  "pi pi-copy",
  "pi pi-credit-card",
  "pi pi-crown",
  "pi pi-database",
  "pi pi-delete-left",
  "pi pi-desktop",
  "pi pi-directions",
  "pi pi-directions-alt",
  "pi pi-discord",
  "pi pi-dollar",
  "pi pi-download",
  "pi pi-eject",
  "pi pi-ellipsis-h",
  "pi pi-ellipsis-v",
  "pi pi-envelope",
  "pi pi-equals",
  "pi pi-eraser",
  "pi pi-ethereum",
  "pi pi-euro",
  "pi pi-exclamation-circle",
  "pi pi-exclamation-triangle",
  "pi pi-expand",
  "pi pi-external-link",
  "pi pi-eye",
  "pi pi-eye-slash",
  "pi pi-face-smile",
  "pi pi-facebook",
  "pi pi-fast-backward",
  "pi pi-fast-forward",
  "pi pi-file",
  "pi pi-file-arrow-up",
  "pi pi-file-check",
  "pi pi-file-edit",
  "pi pi-file-excel",
  "pi pi-file-export",
  "pi pi-file-import",
  "pi pi-file-o",
  "pi pi-file-pdf",
  "pi pi-file-plus",
  "pi pi-file-word",
  "pi pi-filter",
  "pi pi-filter-fill",
  "pi pi-filter-slash",
  "pi pi-flag",
  "pi pi-flag-fill",
  "pi pi-folder",
  "pi pi-folder-open",
  "pi pi-folder-plus",
  "pi pi-forward",
  "pi pi-gauge",
  "pi pi-gift",
  "pi pi-github",
  "pi pi-globe",
  "pi pi-google",
  "pi pi-graduation-cap",
  "pi pi-hammer",
  "pi pi-hashtag",
  "pi pi-headphones",
  "pi pi-heart",
  "pi pi-heart-fill",
  "pi pi-history",
  "pi pi-home",
  "pi pi-hourglass",
  "pi pi-id-card",
  "pi pi-image",
  "pi pi-images",
  "pi pi-inbox",
  "pi pi-indian-rupee",
  "pi pi-info",
  "pi pi-info-circle",
  "pi pi-instagram",
  "pi pi-key",
  "pi pi-language",
  "pi pi-lightbulb",
  "pi pi-link",
  "pi pi-linkedin",
  "pi pi-list",
  "pi pi-list-check",
  "pi pi-lock",
  "pi pi-lock-open",
  "pi pi-map",
  "pi pi-map-marker",
  "pi pi-mars",
  "pi pi-megaphone",
  "pi pi-microchip",
  "pi pi-microchip-ai",
  "pi pi-microphone",
  "pi pi-microsoft",
  "pi pi-minus",
  "pi pi-minus-circle",
  "pi pi-mobile",
  "pi pi-money-bill",
  "pi pi-moon",
  "pi pi-objects-column",
  "pi pi-palette",
  "pi pi-paperclip",
  "pi pi-pause",
  "pi pi-pause-circle",
  "pi pi-paypal",
  "pi pi-pen-to-square",
  "pi pi-pencil",
  "pi pi-percentage",
  "pi pi-phone",
  "pi pi-pinterest",
  "pi pi-play",
  "pi pi-play-circle",
  "pi pi-plus",
  "pi pi-plus-circle",
  "pi pi-pound",
  "pi pi-power-off",
  "pi pi-prime",
  "pi pi-print",
  "pi pi-qrcode",
  "pi pi-question",
  "pi pi-question-circle",
  "pi pi-receipt",
  "pi pi-reddit",
  "pi pi-refresh",
  "pi pi-replay",
  "pi pi-reply",
  "pi pi-save",
  "pi pi-search",
  "pi pi-search-minus",
  "pi pi-search-plus",
  "pi pi-send",
  "pi pi-server",
  "pi pi-share-alt",
  "pi pi-shield",
  "pi pi-shop",
  "pi pi-shopping-bag",
  "pi pi-shopping-cart",
  "pi pi-sign-in",
  "pi pi-sign-out",
  "pi pi-sitemap",
  "pi pi-slack",
  "pi pi-sliders-h",
  "pi pi-sliders-v",
  "pi pi-sort",
  "pi pi-sort-alpha-down",
  "pi pi-sort-alpha-down-alt",
  "pi pi-sort-alpha-up",
  "pi pi-sort-alpha-up-alt",
  "pi pi-sort-alt",
  "pi pi-sort-alt-slash",
  "pi pi-sort-amount-down",
  "pi pi-sort-amount-down-alt",
  "pi pi-sort-amount-up",
  "pi pi-sort-amount-up-alt",
  "pi pi-sort-down",
  "pi pi-sort-down-fill",
  "pi pi-sort-numeric-down",
  "pi pi-sort-numeric-down-alt",
  "pi pi-sort-numeric-up",
  "pi pi-sort-numeric-up-alt",
  "pi pi-sort-up",
  "pi pi-sort-up-fill",
  "pi pi-sparkles",
  "pi pi-spinner",
  "pi pi-spinner-dotted",
  "pi pi-star",
  "pi pi-star-fill",
  "pi pi-star-half",
  "pi pi-star-half-fill",
  "pi pi-step-backward",
  "pi pi-step-backward-alt",
  "pi pi-step-forward",
  "pi pi-step-forward-alt",
  "pi pi-stop",
  "pi pi-stop-circle",
  "pi pi-stopwatch",
  "pi pi-sun",
  "pi pi-sync",
  "pi pi-table",
  "pi pi-tablet",
  "pi pi-tag",
  "pi pi-tags",
  "pi pi-telegram",
  "pi pi-th-large",
  "pi pi-thumbs-down",
  "pi pi-thumbs-down-fill",
  "pi pi-thumbs-up",
  "pi pi-thumbs-up-fill",
  "pi pi-thumbtack",
  "pi pi-ticket",
  "pi pi-tiktok",
  "pi pi-times",
  "pi pi-times-circle",
  "pi pi-trash",
  "pi pi-trophy",
  "pi pi-truck",
  "pi pi-turkish-lira",
  "pi pi-twitch",
  "pi pi-twitter",
  "pi pi-undo",
  "pi pi-unlock",
  "pi pi-upload",
  "pi pi-user",
  "pi pi-user-edit",
  "pi pi-user-minus",
  "pi pi-user-plus",
  "pi pi-users",
  "pi pi-venus",
  "pi pi-verified",
  "pi pi-video",
  "pi pi-vimeo",
  "pi pi-volume-down",
  "pi pi-volume-off",
  "pi pi-volume-up",
  "pi pi-wallet",
  "pi pi-warehouse",
  "pi pi-wave-pulse",
  "pi pi-whatsapp",
  "pi pi-wifi",
  "pi pi-window-maximize",
  "pi pi-window-minimize",
  "pi pi-wrench",
  "pi pi-youtube"
];

const filteredIcons = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return icons;
  return icons.filter((name) => name.toLowerCase().includes(q));
});

// Lucide：项目另一套图标（按需 `import { X } from "lucide-vue-next"` 渲染组件）。
// 全量约 1900+，dev 页内全部入包可接受；默认全量展示，搜索即过滤。
const lucideAll = (() => {
  const seen = new Map<Component, string>();
  for (const [name, comp] of Object.entries(LucideIcons)) {
    if (!/^[A-Z]/.test(name)) continue;
    if (name.endsWith("Icon") || name.startsWith("Lucide")) continue;
    if (name === "Icon" || name === "createLucideIcon") continue;
    if (typeof comp !== "function" && typeof comp !== "object") continue;
    if (!seen.has(comp as Component)) seen.set(comp as Component, name);
  }
  return [...seen.entries()]
    .map(([comp, name]) => ({ name: name as string, comp: comp as Component }))
    .sort((a, b) => a.name.localeCompare(b.name));
})();

const filteredLucide = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return lucideAll;
  return lucideAll.filter((it) => it.name.toLowerCase().includes(q));
});

const activeTotal = computed(() => (tab.value === "primevue" ? icons.length : lucideAll.length));
const activeFiltered = computed(() =>
  tab.value === "primevue" ? filteredIcons.value : filteredLucide.value,
);

const groupedLucide = computed(() => {
  const groups = new Map<string, { name: string; comp: Component }[]>();
  for (const it of filteredLucide.value) {
    const key = it.name.charAt(0).toUpperCase();
    const list = groups.get(key) ?? [];
    list.push(it);
    groups.set(key, list);
  }
  return new Map([...groups.entries()].sort((a, b) => a[0].localeCompare(b[0])));
});

const groupedIcons = computed(() => {
  const groups = new Map<string, string[]>();
  for (const name of filteredIcons.value) {
    const key = name.replace("pi pi-", "").charAt(0).toUpperCase();
    const list = groups.get(key) ?? [];
    list.push(name);
    groups.set(key, list);
  }
  return new Map([...groups.entries()].sort((a, b) => a[0].localeCompare(b[0])));
});

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.add({ severity: "success", summary: "已复制", detail: text, life: 1500 });
  } catch {
    toast.add({ severity: "error", summary: "复制失败", detail: "请手动选择复制", life: 2500 });
  }
}

function iconName(klass: string) {
  return klass.replace("pi pi-", "");
}
</script>

<template>
  <div class="ks-root mw-scroll">
    <div class="ks">
      <header class="ks-hero">
        <AppLogo />
        <div>
          <h1 class="tw:text-2xl tw:font-bold tw:tracking-tight">图标库</h1>
          <p class="tw:mt-1 tw:text-muted tw:text-sm">
            项目使用两套图标：PrimeIcons（<code class="ks-code">pi pi-*</code>，class 形式）与 Lucide（<code class="ks-code">import { X } from "lucide-vue-next"</code>，组件形式）。点击任意图标可复制其名称。
          </p>
        </div>
      </header>

      <section class="ks-chapter">
        <div class="ks-kicker">00 · Usage</div>
        <h2 class="ks-h2">使用方法</h2>

        <div class="ks-block">
          <div class="ks-block-title">原生元素</div>
          <div class="ks-stage">
            <code class="ks-code">&lt;i class=&quot;pi pi-search&quot;&gt;&lt;/i&gt;</code>
            <span class="tw:text-muted tw:text-sm">或</span>
            <code class="ks-code">&lt;span class=&quot;pi pi-search&quot;&gt;&lt;/span&gt;</code>
            <i class="pi pi-search tw:text-lg"></i>
          </div>

          <div class="ks-block-title tw:mt-4">PrimeVue 组件</div>
          <div class="ks-stage tw:items-center">
            <code class="ks-code">&lt;Button icon=&quot;pi pi-search&quot; /&gt;</code>
            <Button icon="pi pi-search" severity="secondary" aria-label="搜索" />
          </div>

          <div class="ks-block-title tw:mt-4">Lucide 组件</div>
          <div class="ks-stage tw:items-center">
            <code class="ks-code">&lt;Scissors :size=&quot;14&quot; /&gt;</code>
            <Scissors :size="14" />
            <span class="tw:text-muted tw:text-sm">或作为 Button 的 #icon 插槽</span>
          </div>
        </div>
      </section>

      <section class="ks-chapter">
        <div class="ks-kicker">01 · Catalog</div>
        <h2 class="ks-h2">全部图标</h2>

        <div class="ks-block">
          <div class="ks-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              class="ks-tab"
              :class="tab === 'primevue' && 'ks-tab--active'"
              :aria-selected="tab === 'primevue'"
              @click="tab = 'primevue'"
            >
              PrimeIcons
            </button>
            <button
              type="button"
              role="tab"
              class="ks-tab"
              :class="tab === 'lucide' && 'ks-tab--active'"
              :aria-selected="tab === 'lucide'"
              @click="tab = 'lucide'"
            >
              Lucide
            </button>
          </div>

          <div class="ks-toolbar">
            <IconField>
              <InputIcon class="pi pi-search" />
              <InputText v-model="search" :placeholder="tab === 'primevue' ? '搜索图标…' : '搜索图标（如 scissors）…'" fluid />
            </IconField>
            <Tag :value="`${activeFiltered.length} / ${activeTotal}`" severity="secondary" />
          </div>

          <div v-if="activeFiltered.length === 0" class="ks-empty">
            <i class="pi pi-search tw:text-3xl tw:text-muted"></i>
            <p class="tw:text-muted tw:text-sm">未找到匹配 “{{ search }}” 的图标</p>
          </div>

          <template v-else>
            <div v-if="tab === 'primevue'">
              <div v-for="[letter, list] in groupedIcons" :key="letter" class="ks-letter-group">
                <div class="ks-letter">{{ letter }}</div>
                <div class="ks-grid">
                  <button
                    v-for="klass in list"
                    :key="klass"
                    class="ks-icon-card"
                    type="button"
                    v-tooltip.top="klass"
                    @click="copy(klass)"
                  >
                    <i :class="[klass, 'ks-icon-card__icon']"></i>
                    <code class="ks-icon-card__name">{{ iconName(klass) }}</code>
                    <span class="ks-icon-card__copy">
                      <i class="pi pi-copy"></i>
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div v-else>
              <div v-for="[letter, list] in groupedLucide" :key="letter" class="ks-letter-group">
                <div class="ks-letter">{{ letter }}</div>
                <div class="ks-grid">
                  <button
                    v-for="it in list"
                    :key="it.name"
                    class="ks-icon-card"
                    type="button"
                    v-tooltip.top="it.name"
                    @click="copy(it.name)"
                  >
                    <component :is="it.comp" :size="22" class="ks-icon-card__icon" />
                    <code class="ks-icon-card__name">{{ it.name }}</code>
                    <span class="ks-icon-card__copy">
                      <i class="pi pi-copy"></i>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.ks-root {
  flex: 1;
  min-height: 0;
  height: 100%;
  background: var(--color-bg);
}

.ks {
  max-width: 1080px;
  margin: 0 auto;
  padding: 32px 32px 120px;
}

.ks-hero {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 28px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.ks-chapter {
  padding-top: 40px;
}

.ks-kicker {
  font-family: var(--font-family-mono);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-brand-600);
}

.ks-h2 {
  margin: 8px 0 20px;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.015em;
}

.ks-block {
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  background: var(--color-surface-base);
  box-shadow: var(--shadow-xs);
  padding: 18px 20px 22px;
}

.ks-block-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin: 0 0 12px;
}

.ks-block .ks-block-title:not(:first-child) {
  margin-top: 22px;
}

.ks-stage {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  padding: 18px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  background: var(--color-surface-base);
}

.ks-code {
  font-family: var(--font-family-mono);
  font-size: 12.5px;
  padding: 4px 8px;
  border-radius: var(--radius);
  background: var(--color-bg-soft);
  border: 1px solid var(--color-border-subtle);
  color: var(--color-text-primary);
}

.ks-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.ks-tabs {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  margin-bottom: 16px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  background: var(--color-bg-soft);
}

.ks-tab {
  appearance: none;
  border: none;
  cursor: pointer;
  padding: 6px 16px;
  border-radius: var(--radius);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  background: transparent;
  transition: background 0.15s ease, color 0.15s ease;
}

.ks-tab:hover {
  color: var(--color-text-primary);
}

.ks-tab--active {
  background: var(--color-surface-base);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-xs);
}

.ks-toolbar .p-iconfield {
  flex: 1;
  min-width: 220px;
  max-width: 360px;
}

.ks-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 0;
  color: var(--color-text-tertiary);
}

.ks-letter-group {
  margin-top: 24px;
}

.ks-letter {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius);
  background: var(--color-brand-50);
  color: var(--color-brand-700);
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 10px;
}

.ks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
  gap: 10px;
}

.ks-icon-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 8px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  background: var(--color-bg-soft);
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease, transform 0.1s ease;
  position: relative;
}

.ks-icon-card:hover {
  border-color: var(--color-brand-300);
  background: var(--color-brand-50);
}

.ks-icon-card:active {
  transform: scale(0.98);
}

.ks-icon-card__icon {
  font-size: 22px;
  color: var(--color-text-primary);
}

.ks-icon-card__name {
  font-family: var(--font-family-mono);
  font-size: 10.5px;
  color: var(--color-text-tertiary);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 4px;
}

.ks-icon-card__copy {
  position: absolute;
  top: 6px;
  right: 6px;
  font-size: 11px;
  color: var(--color-text-quaternary);
  opacity: 0;
  transition: opacity 0.15s ease;
}

.ks-icon-card:hover .ks-icon-card__copy {
  opacity: 1;
}
</style>