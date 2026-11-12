<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ChevronDown, Crosshair, FileText, RotateCw, Search, Smartphone, X } from "lucide-vue-next";
import {
  Button,
  ConfirmHost,
  IconField,
  InputIcon,
  InputNumber,
  InputText,
  Popover,
  SelectButton,
  Slider,
  ToastHost,
} from "@mango-write/ui-vue";
import { docGroups, type DocSectionId } from "./registry";
import { alt, locale, t } from "./i18n";
import {
  MP_CUSTOM_SCALE_MAX,
  MP_CUSTOM_SCALE_MIN,
  MP_DEVICE_PRESETS,
  activateMpRoute,
  getMpDevicePreset,
  mpSim,
  selectMpDevice,
  setMpCustomScalePercent,
  setMpScaleMode,
  toggleMpOrientation,
  type MpScaleMode,
} from "./mobile-demos/state";
import MpPhoneDock from "./kit/MpPhoneDock.vue";
import SearchDialog from "./kit/SearchDialog.vue";
import TopBar from "./kit/TopBar.vue";
import { version as uiVersion } from "../package.json";

const route = useRoute();
const router = useRouter();
const sheet = ref<HTMLElement | null>(null);
const navQuery = ref("");

const activeSection = computed<DocSectionId>(() => {
  if (route.meta.section) return route.meta.section;
  if (route.path.startsWith("/foundations")) return "foundations";
  if (route.path.startsWith("/mobile")) return "mobile";
  return "desktop";
});

watch(activeSection, () => {
  navQuery.value = "";
});

const visibleGroups = computed(() =>
  docGroups.filter((group) => group.section === activeSection.value),
);

const filteredGroups = computed(() => {
  const tokens = navQuery.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return visibleGroups.value;
  return visibleGroups.value
    .map((group) => ({
      ...group,
      entries: group.entries.filter((entry) => {
        const haystack = `${entry.title.zh} ${entry.title.en} ${entry.slug} ${group.title.zh} ${group.title.en}`.toLowerCase();
        return tokens.every((token) => haystack.includes(token));
      }),
    }))
    .filter((group) => group.entries.length > 0);
});

function openFirstFilteredEntry(): void {
  const firstGroup = filteredGroups.value[0];
  const firstEntry = firstGroup?.entries[0];
  if (firstGroup && firstEntry) {
    router.push(`${firstGroup.base}/${firstEntry.slug}`);
  }
}

watch(
  () => route.path,
  (path) => {
    sheet.value?.scrollTo({ top: 0 });
    if (path.startsWith("/mobile/")) {
      const slug = path.slice("/mobile/".length).split("/")[0];
      if (slug) activateMpRoute(slug);
    }
  },
  { immediate: true },
);

// document.title 跟路由与语言走;index.html 的静态 title 只是首帧兜底。
watchEffect(() => {
  const title = route.meta.title;
  document.title = title ? `${t(title)} · MangoWrite UI` : "MangoWrite UI";
});

const s = {
  searchDocs: { zh: "搜索文档（Ctrl K）", en: "Search docs (Ctrl K)" },
  navDir: { zh: "设计规范目录", en: "Docs directory" },
  navFilter: { zh: "筛选目录…", en: "Filter menu…" },
  navFilterClear: { zh: "清空筛选", en: "Clear filter" },
  navEmpty: { zh: "无匹配目录", en: "No matching items" },
  mpConfig: { zh: "移动端预览配置", en: "Mobile preview settings" },
  mpDevice: { zh: "预览机型", en: "Preview device" },
  mpScale: { zh: "预览比例", en: "Preview scale" },
  mpOptions: { zh: "预览开关", en: "Preview options" },
  mpFit: { zh: "自适应", en: "Fit" },
  mpCustom: { zh: "手调", en: "Custom" },
  mpCustomScale: { zh: "缩放百分比", en: "Zoom percentage" },
  mpScaleHint: {
    zh: "1:1 按屏幕密度自动折算真机物理尺寸",
    en: "1:1 auto-calibrates physical phone size",
  },
  mpRotate: { zh: "横屏", en: "Landscape" },
  mpLong: { zh: "长内容", en: "Long" },
  mpTouch: { zh: "热区", en: "Hit" },
} as const;

const activeDevice = computed(() => getMpDevicePreset(mpSim.deviceId));
const activeDeviceShortName = computed(() => t(activeDevice.value.shortLabel).split(" · ")[0]);
const deviceItems = computed(() =>
  MP_DEVICE_PRESETS.map((preset) => ({
    id: preset.id,
    title: t(preset.name).replace(/[（(].*$/, "").trim(),
    spec: `${preset.width}×${preset.height} · ${preset.diagonal}`,
  })),
);

const scaleOptions = computed(() => [
  { label: t(s.mpFit), value: "fit" },
  { label: "1:1", value: "1:1" }, // i18n-allow 比例符号
  { label: t(s.mpCustom), value: "custom" },
]);

const scaleQuickPresets = [50, 75, 100, 125] as const;
const displayScalePercent = computed(() => Math.round(mpSim.effectiveScale * 100));
const sliderScalePercent = computed(() =>
  mpSim.scaleMode === "custom" ? mpSim.customScalePercent : displayScalePercent.value,
);
const scaleSummaryText = computed(() => {
  if (mpSim.scaleMode === "1:1") return `1:1 · ${displayScalePercent.value}%`;
  if (mpSim.scaleMode === "fit") return `${t(s.mpFit)} · ${displayScalePercent.value}%`;
  return `${mpSim.customScalePercent}%`;
});
const hasActiveMpOptions = computed(
  () => mpSim.orientation === "landscape" || mpSim.longContent || mpSim.debugTouch,
);

function onCustomScaleUpdate(val: unknown): void {
  if (typeof val === "number" && Number.isFinite(val)) {
    setMpCustomScalePercent(val);
  }
}

const searchOpen = ref(false);
function onGlobalKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchOpen.value = !searchOpen.value;
  }
}
onMounted(() => window.addEventListener("keydown", onGlobalKeydown));
onUnmounted(() => window.removeEventListener("keydown", onGlobalKeydown));
</script>

<template>
  <RouterView v-if="route.meta.landing" />
  <div v-else class="dev-app">
    <TopBar>
      <template #append>
        <Popover
          v-if="activeSection === 'mobile'"
          align="end"
          :aria-label="t(s.mpConfig)"
        >
          <template #trigger>
            <Button
              class="dev-mp-trigger"
              size="sm"
              rounded
              :variant="hasActiveMpOptions ? 'tinted' : 'outlined'"
              :severity="hasActiveMpOptions ? 'primary' : 'secondary'"
              :aria-label="t(s.mpConfig)"
            >
              <Smartphone class="mw-btn__icon" aria-hidden="true" />
              <span class="dev-mp-trigger__device">{{ activeDeviceShortName }}</span>
              <span class="dev-mp-trigger__sep" aria-hidden="true">·</span>
              <span class="dev-mp-trigger__scale">{{ displayScalePercent }}%</span>
              <ChevronDown class="mw-btn__icon dev-mp-trigger__chevron" aria-hidden="true" />
            </Button>
          </template>
          <div class="dev-mp-pop">
            <section class="dev-mp-pop__section">
              <div class="dev-mp-pop__head">
                <span class="dev-mp-pop__title">{{ t(s.mpDevice) }}</span>
                <span class="dev-mp-pop__meta">{{ mpSim.width }}×{{ mpSim.height }}</span>
              </div>
              <div class="dev-mp-devices">
                <button
                  v-for="item in deviceItems"
                  :key="item.id"
                  type="button"
                  class="dev-mp-device"
                  :class="{ 'is-active': mpSim.deviceId === item.id }"
                  :aria-pressed="mpSim.deviceId === item.id"
                  @click="selectMpDevice(item.id)"
                >
                  <span class="dev-mp-device__title">{{ item.title }}</span>
                  <span class="dev-mp-device__spec">{{ item.spec }}</span>
                </button>
              </div>
            </section>

            <section class="dev-mp-pop__section">
              <div class="dev-mp-pop__head">
                <span class="dev-mp-pop__title">{{ t(s.mpScale) }}</span>
                <span class="dev-mp-pop__meta">{{ scaleSummaryText }}</span>
              </div>
              <SelectButton
                size="sm"
                :model-value="mpSim.scaleMode"
                :options="scaleOptions"
                option-label="label"
                option-value="value"
                :allow-empty="false"
                :aria-label="t(s.mpScale)"
                @update:model-value="setMpScaleMode($event as MpScaleMode)"
              />
              <div class="dev-mp-pop__row">
                <Slider
                  class="dev-mp-pop__slider"
                  :model-value="sliderScalePercent"
                  :min="MP_CUSTOM_SCALE_MIN"
                  :max="MP_CUSTOM_SCALE_MAX"
                  :step="1"
                  :aria-label="t(s.mpCustomScale)"
                  @update:model-value="onCustomScaleUpdate"
                />
                <InputNumber
                  class="dev-mp-pop__input"
                  size="sm"
                  :model-value="sliderScalePercent"
                  :min="MP_CUSTOM_SCALE_MIN"
                  :max="MP_CUSTOM_SCALE_MAX"
                  :step="5"
                  suffix="%"
                  :use-grouping="false"
                  :allow-empty="false"
                  :aria-label="t(s.mpCustomScale)"
                  @update:model-value="onCustomScaleUpdate"
                />
              </div>
              <div class="dev-mp-pop__presets">
                <Button
                  v-for="pct in scaleQuickPresets"
                  :key="pct"
                  size="xs"
                  rounded
                  :variant="mpSim.scaleMode === 'custom' && mpSim.customScalePercent === pct ? 'tinted' : 'text'"
                  :severity="mpSim.scaleMode === 'custom' && mpSim.customScalePercent === pct ? 'primary' : 'secondary'"
                  :label="`${pct}%`"
                  @click="setMpCustomScalePercent(pct)"
                />
              </div>
              <p class="dev-mp-pop__hint">{{ t(s.mpScaleHint) }}</p>
            </section>

            <section class="dev-mp-pop__section">
              <div class="dev-mp-pop__head">
                <span class="dev-mp-pop__title">{{ t(s.mpOptions) }}</span>
              </div>
              <div class="dev-mp-pop__toggles">
                <Button
                  size="sm"
                  rounded
                  :variant="mpSim.orientation === 'landscape' ? 'tinted' : 'outlined'"
                  :severity="mpSim.orientation === 'landscape' ? 'primary' : 'secondary'"
                  :icon="RotateCw"
                  :label="t(s.mpRotate)"
                  @click="toggleMpOrientation()"
                />
                <Button
                  size="sm"
                  rounded
                  :variant="mpSim.longContent ? 'tinted' : 'outlined'"
                  :severity="mpSim.longContent ? 'primary' : 'secondary'"
                  :icon="FileText"
                  :label="t(s.mpLong)"
                  @click="mpSim.longContent = !mpSim.longContent"
                />
                <Button
                  size="sm"
                  rounded
                  :variant="mpSim.debugTouch ? 'tinted' : 'outlined'"
                  :severity="mpSim.debugTouch ? 'primary' : 'secondary'"
                  :icon="Crosshair"
                  :label="t(s.mpTouch)"
                  @click="mpSim.debugTouch = !mpSim.debugTouch"
                />
              </div>
            </section>
          </div>
        </Popover>
        <a
          class="dev-version"
          href="https://github.com/mango-write/mango-write-ui/blob/main/CHANGELOG.md"
          target="_blank"
          rel="noreferrer"
        >v{{ uiVersion }}</a>
        <Button
          class="dev-search"
          rounded
          variant="text"
          severity="secondary"
          size="sm"
          :icon="Search"
          :aria-label="t(s.searchDocs)"
          @click="searchOpen = true"
        />
      </template>
    </TopBar>
    <div class="dev-body" :class="{ 'dev-body--mobile': activeSection === 'mobile' }">
      <nav class="dev-nav mw-frost" :aria-label="t(s.navDir)">
        <div class="dev-nav__filter">
          <div class="dev-nav__search-box">
            <IconField class="dev-nav__field mw-size-sm">
              <InputIcon><Search /></InputIcon>
              <InputText
                v-model="navQuery"
                class="dev-nav__input"
                :class="{ 'has-clear': Boolean(navQuery) }"
                :placeholder="t(s.navFilter)"
                :aria-label="t(s.navFilter)"
                fluid
                @keydown.escape="navQuery = ''"
                @keydown.enter="openFirstFilteredEntry"
              />
            </IconField>
            <button
              v-if="navQuery"
              type="button"
              class="dev-nav__clear"
              :aria-label="t(s.navFilterClear)"
              @click="navQuery = ''"
            >
              <X />
            </button>
          </div>
        </div>
        <div v-scroll-fade.sm class="dev-nav__scroll mw-scroll">
          <template v-if="filteredGroups.length">
            <section v-for="group in filteredGroups" :key="group.id" class="dev-nav__group">
              <h2 class="dev-nav__heading">{{ t(group.title) }}</h2>
              <RouterLink
                v-for="entry in group.entries"
                :key="entry.slug"
                :to="`${group.base}/${entry.slug}`"
                class="dev-nav__item"
              >
                <span>{{ t(entry.title) }}</span>
                <span class="dev-nav__en">{{ alt(entry.title, locale) }}</span>
              </RouterLink>
            </section>
          </template>
          <p v-else class="dev-nav__empty">{{ t(s.navEmpty) }}</p>
        </div>
      </nav>
      <main class="dev-sheet">
        <div ref="sheet" v-scroll-fade class="dev-sheet__scroll mw-scroll">
          <RouterView />
        </div>
      </main>
      <MpPhoneDock v-if="activeSection === 'mobile'" />
    </div>
  </div>
  <ToastHost position="top-right" />
  <ConfirmHost />
  <SearchDialog v-model:open="searchOpen" />
</template>

<style scoped>
.dev-mp-trigger {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.dev-mp-trigger__sep {
  opacity: 0.55;
}

.dev-mp-trigger__chevron {
  opacity: 0.7;
}

.dev-mp-pop {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: min(296px, calc(100vw - 32px));
  max-height: calc(100dvh - 80px);
  overflow-y: auto;
}

.dev-mp-pop__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.dev-mp-pop__section + .dev-mp-pop__section {
  padding-top: var(--space-2-5);
  border-top: var(--border-width) solid var(--border-subtle);
}

.dev-mp-pop__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.dev-mp-pop__title {
  color: var(--text-secondary);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
  font-weight: var(--weight-semibold);
}

.dev-mp-pop__meta {
  color: var(--text-tertiary);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
  font-variant-numeric: tabular-nums;
}

.dev-mp-devices {
  display: flex;
  flex-direction: column;
  gap: var(--space-0-5);
}

.dev-mp-device {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  width: 100%;
  height: var(--size-sm-h);
  padding: 0 var(--space-2-5);
  border: none;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--text-secondary);
  font-family: inherit;
  font-size: var(--type-body-sm-size);
  cursor: pointer;
  transition:
    color var(--duration-fast) var(--ease-standard),
    background-color var(--duration-fast) var(--ease-standard);
}

.dev-mp-device:hover {
  background: var(--fill-default);
  color: var(--text-primary);
}

.dev-mp-device.is-active {
  background: var(--fill-selected);
  color: var(--text-primary);
  font-weight: var(--weight-medium);
}

.dev-mp-device__title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dev-mp-device__spec {
  flex: none;
  color: var(--text-tertiary);
  font-size: var(--type-micro-size);
  font-variant-numeric: tabular-nums;
}

.dev-mp-pop :deep(.mw-select-button) {
  width: 100%;
}

.dev-mp-pop :deep(.mw-select-button__option) {
  flex: 1;
  justify-content: center;
}

.dev-mp-pop__row {
  display: flex;
  align-items: center;
  gap: var(--space-2-5);
}

.dev-mp-pop__slider {
  flex: 1;
  min-width: 0;
}

.dev-mp-pop__input {
  width: 72px;
  flex: none;
  font-variant-numeric: tabular-nums;
}

.dev-mp-pop__presets {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-1);
  font-variant-numeric: tabular-nums;
}

.dev-mp-pop__hint {
  margin: 0;
  color: var(--text-tertiary);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
}

.dev-mp-pop__toggles {
  display: flex;
  align-items: center;
  gap: var(--space-1-5);
}

.dev-mp-pop__toggles :deep(.mw-btn) {
  flex: 1;
}

.dev-version {
  padding: 0 var(--space-2-5);
  border-radius: var(--radius-full);
  font-size: var(--type-caption-size);
  line-height: var(--size-sm-h);
  color: var(--text-tertiary);
  white-space: nowrap;
}

.dev-version:hover {
  background: var(--fill-default);
  color: var(--text-primary);
}

/* 窄屏按优先级渐进退让:版本号 → 机型名 → 搜索钮 → 触发钮缩纯图标胶囊。 */
@media (max-width: 1080px) {
  .dev-version {
    display: none;
  }
}

@media (max-width: 960px) {
  .dev-mp-trigger__device,
  .dev-mp-trigger__sep {
    display: none;
  }
}

@media (max-width: 560px) {
  .dev-mp-trigger {
    width: var(--size-sm-h);
    padding: 0;
  }

  .dev-mp-trigger__scale,
  .dev-mp-trigger__chevron,
  .dev-search {
    display: none;
  }
}

@media (max-width: 900px) {
  .dev-body--mobile {
    flex-direction: column;
    overflow-y: auto;
  }

  .dev-body--mobile .dev-sheet {
    flex: none;
    overflow: visible;
  }

  .dev-body--mobile .dev-sheet__scroll {
    overflow: visible;
  }

  .dev-body--mobile .mp-dock {
    order: -1;
  }
}
</style>
