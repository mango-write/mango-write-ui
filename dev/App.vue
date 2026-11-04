<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import {
  AppLogo,
  ConfirmHost,
  SelectButton,
  ToastHost,
  useThemePreference,
  type ThemePreference,
} from "../src";
import { docGroups } from "./registry";

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
</script>

<template>
  <div class="dev-app">
    <header class="dev-topbar">
      <RouterLink to="/dev/ui" class="dev-topbar__brand" aria-label="Mango 设计语言">
        <AppLogo />
      </RouterLink>
      <span class="dev-topbar__title">设计语言 · 纸与霜</span>
      <span class="dev-topbar__spacer" />
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
    <ToastHost position="top-right" />
    <ConfirmHost />
  </div>
</template>
