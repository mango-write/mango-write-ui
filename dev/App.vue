<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { Search } from "lucide-vue-next";
import {
  AppLogo,
  Button,
  ConfirmHost,
  SelectButton,
  ToastHost,
  useThemePreference,
  type ThemePreference,
} from "../src";
import { docGroups } from "./registry";
import SearchDialog from "./kit/SearchDialog.vue";
import { version as uiVersion } from "../package.json";

const { preference, setTheme } = useThemePreference();
const themeOptions: { label: string; value: ThemePreference }[] = [
  { label: "浅色", value: "light" },
  { label: "深色", value: "dark" },
  { label: "系统", value: "system" },
];

function updateTheme(value: unknown) {
  if (value === "light" || value === "dark" || value === "system") setTheme(value);
}

const route = useRoute();
const sheet = ref<HTMLElement | null>(null);
watch(
  () => route.path,
  () => sheet.value?.scrollTo({ top: 0 }),
);

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
    <header class="dev-topbar">
      <RouterLink to="/dev/ui" class="dev-topbar__brand" aria-label="Mango 设计语言">
        <AppLogo />
      </RouterLink>
      <span class="dev-topbar__title">设计语言 · 纸与霜</span>
      <a
        class="dev-topbar__version"
        href="https://github.com/mango-write/mango-write-ui/blob/main/CHANGELOG.md"
        target="_blank"
        rel="noreferrer"
      >v{{ uiVersion }}</a>
      <span class="dev-topbar__spacer" />
      <Button
        variant="text"
        severity="secondary"
        size="sm"
        :icon="Search"
        aria-label="搜索文档（Ctrl K）"
        @click="searchOpen = true"
      />
      <Button
        href="https://rewrite.mangowrite.com"
        target="_blank"
        rel="noreferrer"
        size="sm"
        variant="outlined"
        severity="secondary"
        label="降 AI"
      />
      <Button
        href="https://mangowrite.com"
        target="_blank"
        rel="noreferrer"
        size="sm"
        label="科研平台"
      />
      <SelectButton
        :model-value="preference"
        :options="themeOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        size="sm"
        aria-label="颜色主题"
        @update:model-value="updateTheme"
      />
      <a
        class="dev-topbar__gh"
        href="https://github.com/mango-write/mango-write-ui"
        target="_blank"
        rel="noreferrer"
        aria-label="GitHub 仓库"
      >
        <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"
          />
        </svg>
      </a>
    </header>
    <div class="dev-body">
      <nav class="dev-nav mw-scroll" aria-label="设计规范目录">
        <section v-for="group in docGroups" :key="group.id" class="dev-nav__group">
          <h2 class="dev-nav__heading">{{ group.title }}</h2>
          <RouterLink
            v-for="entry in group.entries"
            :key="entry.slug"
            :to="`${group.base}/${entry.slug}`"
            class="dev-nav__item"
          >
            <span>{{ entry.title }}</span>
            <span class="dev-nav__en">{{ entry.en }}</span>
          </RouterLink>
        </section>
      </nav>
      <main ref="sheet" class="dev-sheet mw-scroll">
        <RouterView />
      </main>
    </div>
  </div>
  <ToastHost position="top-right" />
  <ConfirmHost />
  <SearchDialog v-model:open="searchOpen" />
</template>
