<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { Crosshair, FileText, RotateCw, Search } from "lucide-vue-next";
import { Button, ConfirmHost, Select, SelectButton, ToastHost } from "@mango-write/ui-vue";
import { docGroups, type DocSectionId } from "./registry";
import { alt, locale, t } from "./i18n";
import {
  MP_DEVICE_PRESETS,
  activateMpRoute,
  mpSim,
  selectMpDevice,
  toggleMpOrientation,
  type MpDeviceId,
} from "./mobile-demos/state";
import MpPhoneDock from "./kit/MpPhoneDock.vue";
import SearchDialog from "./kit/SearchDialog.vue";
import TopBar from "./kit/TopBar.vue";
import { version as uiVersion } from "../package.json";

const route = useRoute();
const sheet = ref<HTMLElement | null>(null);

const activeSection = computed<DocSectionId>(() => {
  if (route.meta.section) return route.meta.section;
  if (route.path.startsWith("/foundations")) return "foundations";
  if (route.path.startsWith("/mobile")) return "mobile";
  return "desktop";
});

const visibleGroups = computed(() =>
  docGroups.filter((group) => group.section === activeSection.value),
);

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
  mpDevice: { zh: "预览机型", en: "Preview device" },
  mpScale: { zh: "预览比例", en: "Preview scale" },
  mpFit: { zh: "自适应", en: "Fit" },
  mpRotate: { zh: "横屏", en: "Landscape" },
  mpLong: { zh: "长内容", en: "Long" },
  mpTouch: { zh: "热区", en: "Hit" },
} as const;

const deviceOptions = computed(() =>
  MP_DEVICE_PRESETS.map((preset) => ({
    label: t(preset.shortLabel),
    value: preset.id,
  })),
);

const scaleOptions = computed(() => [
  { label: "1:1", value: "1:1" }, // i18n-allow 比例符号
  { label: t(s.mpFit), value: "fit" },
]);

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
        <div v-if="activeSection === 'mobile'" class="dev-mp-bar">
          <Select
            class="dev-mp-bar__device"
            size="sm"
            :model-value="mpSim.deviceId"
            :options="deviceOptions"
            option-label="label"
            option-value="value"
            :allow-empty="false"
            :aria-label="t(s.mpDevice)"
            @update:model-value="selectMpDevice($event as MpDeviceId)"
          />
          <SelectButton
            size="sm"
            :model-value="mpSim.scaleMode"
            :options="scaleOptions"
            option-label="label"
            option-value="value"
            :allow-empty="false"
            :aria-label="t(s.mpScale)"
            @update:model-value="mpSim.scaleMode = $event as '1:1' | 'fit'"
          />
          <Button
            size="sm"
            :variant="mpSim.orientation === 'landscape' ? 'tinted' : 'text'"
            :severity="mpSim.orientation === 'landscape' ? 'primary' : 'secondary'"
            :icon="RotateCw"
            :label="t(s.mpRotate)"
            @click="toggleMpOrientation()"
          />
          <Button
            size="sm"
            :variant="mpSim.longContent ? 'tinted' : 'text'"
            :severity="mpSim.longContent ? 'primary' : 'secondary'"
            :icon="FileText"
            :label="t(s.mpLong)"
            @click="mpSim.longContent = !mpSim.longContent"
          />
          <Button
            size="sm"
            :variant="mpSim.debugTouch ? 'tinted' : 'text'"
            :severity="mpSim.debugTouch ? 'primary' : 'secondary'"
            :icon="Crosshair"
            :label="t(s.mpTouch)"
            @click="mpSim.debugTouch = !mpSim.debugTouch"
          />
        </div>
        <a
          class="dev-version"
          href="https://github.com/mango-write/mango-write-ui/blob/main/CHANGELOG.md"
          target="_blank"
          rel="noreferrer"
        >v{{ uiVersion }}</a>
        <Button
          class="dev-search"
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
        <div v-scroll-fade.sm class="dev-nav__scroll mw-scroll">
          <section v-for="group in visibleGroups" :key="group.id" class="dev-nav__group">
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
.dev-mp-bar {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1-5);
  padding-right: var(--space-2);
  border-right: var(--border-width) solid var(--border-subtle);
}

.dev-mp-bar__device {
  width: 196px;
}

.dev-version {
  padding: 0 var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--type-caption-size);
  line-height: var(--size-sm-h);
  color: var(--text-tertiary);
}

.dev-version:hover {
  background: var(--fill-default);
  color: var(--text-primary);
}

/* 窄屏让位给顶栏的首页/文档切换胶囊;版本号走 GitHub CHANGELOG,
   手机档再收搜索钮(Ctrl+K 是桌面习惯,搜索先让位给区域切换)。 */
@media (max-width: 720px) {
  .dev-version {
    display: none;
  }
}

@media (max-width: 480px) {
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
