<script setup lang="ts">
// 展示站统一顶栏,首页与文档壳共用:霜面贴边栏 + 品牌回首页 + 主题档位 +
// 产品入口 + GitHub。文档壳经 #append 注入版本号与搜索入口,首页留空。
import {
  AppLogo,
  Button,
  SelectButton,
  useThemePreference,
  type ThemePreference,
} from "../../src";

const githubUrl = "https://github.com/mango-write/mango-write-ui";

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
  <header class="dev-topbar mw-frost">
    <RouterLink to="/" class="dev-topbar__brand" aria-label="MangoWrite UI 首页">
      <AppLogo />
      <span class="dev-topbar__name">MangoWrite UI</span>
    </RouterLink>
    <span class="dev-topbar__spacer" />
    <slot name="append" />
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
    <Button
      class="dev-topbar__product"
      href="https://rewrite.mangowrite.com"
      target="_blank"
      rel="noreferrer"
      size="sm"
      variant="outlined"
      severity="secondary"
      label="降 AI"
    />
    <Button
      class="dev-topbar__product"
      href="https://mangowrite.com"
      target="_blank"
      rel="noreferrer"
      size="sm"
      label="科研平台"
    />
    <a class="dev-topbar__gh" :href="githubUrl" target="_blank" rel="noreferrer" aria-label="GitHub 仓库">
      <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path
          d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"
        />
      </svg>
    </a>
  </header>
</template>

<style scoped>
/* 借霜材质但属贴边壳而非浮层:直角、只留底边。sticky 仅首页文档流生效,文档壳内是普通 flex 行。 */
.dev-topbar {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-6);
  border-radius: 0;
  border-width: 0 0 var(--border-width);
}

.dev-topbar__brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-primary);
  text-decoration: none;
}

.dev-topbar__name {
  font-size: var(--type-title-size);
  font-weight: var(--weight-semibold);
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
    padding: var(--space-3) var(--space-3);
  }

  .dev-topbar__product {
    display: none;
  }
}

@media (max-width: 480px) {
  .dev-topbar__name {
    display: none;
  }
}
</style>
