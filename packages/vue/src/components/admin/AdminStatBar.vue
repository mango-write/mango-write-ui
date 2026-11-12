<script setup lang="ts">
import type { AdminStatBarProps } from "./admin-defs";

defineOptions({
  name: "MwAdminStatBar",
});

defineProps<AdminStatBarProps>();
</script>

<template>
  <div class="admin-stats">
    <div
      v-for="(item, idx) in items"
      :key="item.key ?? idx"
      class="admin-stats__item"
      :data-tone="item.tone ?? 'default'"
    >
      <span class="admin-stats__label">{{ item.label }}</span>
      <span class="admin-stats__num">{{ item.value }}</span>
      <span v-if="item.sub" class="admin-stats__sub">{{ item.sub }}</span>
    </div>
  </div>
</template>
