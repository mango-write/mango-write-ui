<script setup lang="ts">
// 首页一族（meta.shell: "home"）的统一页面头：钉在岛顶（壳不滚、岛自滚，
// 所以放滚动容器之外即可，禁 sticky/fixed）。规章见 frontend-design-guide「主站页面头」。
defineProps<{ title: string }>();
</script>

<template>
  <header class="mw-page-header">
    <span v-if="$slots.icon" class="mw-page-header__icon">
      <slot name="icon" />
    </span>
    <h1 class="mw-page-header__title">{{ title }}</h1>
    <div v-if="$slots.actions" class="mw-page-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.mw-page-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
  min-height: calc(var(--size-lg-h) + var(--space-2) * 2);
  padding: var(--space-2) var(--space-4);
  border-bottom: var(--border-width) solid var(--border-subtle);
}

.mw-page-header__icon {
  display: grid;
  flex: none;
  place-items: center;
  width: var(--size-md-h);
  height: var(--size-md-h);
  border-radius: var(--radius-md);
  background: var(--accent-subtle);
  color: var(--text-accent);
  font-size: var(--icon-md);
}

.mw-page-header__icon > :deep(svg) {
  width: var(--icon-md);
  height: var(--icon-md);
}

.mw-page-header__title {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: var(--text-primary);
  font-size: var(--type-title-lg-size);
  font-weight: var(--weight-semibold);
  line-height: var(--type-title-lg-line);
  letter-spacing: var(--tracking-title);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mw-page-header__actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: var(--space-2);
  margin-inline-start: auto;
}
</style>
