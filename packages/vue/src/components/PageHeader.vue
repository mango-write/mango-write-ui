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
