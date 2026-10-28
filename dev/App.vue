<script setup lang="ts">
import ConfirmDialog from "primevue/confirmdialog";
import ConfirmPopup from "primevue/confirmpopup";
import DynamicDialog from "primevue/dynamicdialog";
import SelectButton from "primevue/selectbutton";
import Toast from "primevue/toast";
import { AppLogo, useThemePreference, type ThemePreference } from "../src";

const { preference, setTheme } = useThemePreference();
const themeOptions: { label: string; value: ThemePreference }[] = [
  { label: "浅色", value: "light" },
  { label: "深色", value: "dark" },
  { label: "系统", value: "system" },
];

function updateTheme(value: unknown) {
  if (value === "light" || value === "dark" || value === "system") setTheme(value);
}
</script>

<template>
  <div class="dev-app">
    <header class="dev-chrome">
      <RouterLink to="/dev/ui" class="dev-chrome__brand" aria-label="MangoWrite UI 组件库">
        <AppLogo />
      </RouterLink>
      <nav class="dev-chrome__nav" aria-label="开发页面">
        <RouterLink to="/dev/ui">组件</RouterLink>
        <RouterLink to="/dev/icon">图标</RouterLink>
      </nav>
      <SelectButton
        :model-value="preference"
        :options="themeOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        aria-label="颜色主题"
        @update:model-value="updateTheme"
      />
    </header>
    <main class="dev-main">
      <RouterView />
    </main>
    <Toast position="top-right" />
    <ConfirmDialog />
    <ConfirmPopup />
    <DynamicDialog />
  </div>
</template>
