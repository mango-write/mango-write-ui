<script setup lang="ts">
// 首页一族（meta.shell: "home"）的统一页面头：钉在岛顶（壳不滚、岛自滚，
// 所以放滚动容器之外即可，禁 sticky/fixed）。规章见 frontend-design-guide「主站页面头」。
defineProps<{ title: string }>();
</script>

<template>
  <header class="mw-page-header">
    <span
      v-if="$slots.icon"
      class="mw-page-header__icon tw:grid tw:h-8 tw:w-8 tw:shrink-0 tw:place-items-center tw:rounded-lg tw:bg-primary-50 tw:text-primary-600"
    >
      <slot name="icon" />
    </span>
    <h1 class="tw:m-0 tw:min-w-0 tw:text-lg tw:font-semibold tw:leading-tight">{{ title }}</h1>
    <div v-if="$slots.actions" class="tw:ml-auto tw:flex tw:shrink-0 tw:items-center tw:gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.mw-page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  padding: 8px var(--layout-card-padding-compact);
  border-bottom: 1px solid var(--color-border-subtle);
}
</style>
