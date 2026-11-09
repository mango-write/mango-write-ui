<script setup lang="ts">
import { Comment, Fragment, inject, useSlots, type VNode } from "vue";
import { t, type Bi } from "../i18n";
import { stateGridColumnsKey } from "./stateGrid";

defineProps<{ label: string | Bi }>();

const slots = useSlots();
const columns = inject(stateGridColumnsKey);

// 平铺默认槽 vnode(v-for 片段展开、注释剔除)并按列序配题注。
// 不做 memo:父页重渲染时必须取到新槽,缓存会让单元格内容变陈旧。
function cells(): VNode[] {
  const flat: VNode[] = [];
  const walk = (vnodes: VNode[]): void => {
    for (const vnode of vnodes) {
      if (vnode.type === Fragment) walk(vnode.children as VNode[]);
      else if (vnode.type !== Comment) flat.push(vnode);
    }
  };
  walk((slots.default?.() ?? []) as VNode[]);
  return flat;
}
</script>

<template>
  <div class="state-row">
    <span class="state-row__label">{{ t(label) }}</span>
    <div class="state-row__cells">
      <div v-for="(cell, i) in cells()" :key="i" class="state-row__cell">
        <span v-if="columns && columns[i]" class="state-row__caption">{{ columns[i] }}</span>
        <component :is="cell" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.state-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2) var(--space-4);
}

.state-row__label {
  flex: none;
  width: var(--state-label);
  color: var(--text-secondary);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
}

.state-row__cells {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3) var(--space-5);
  min-width: 0;
}

.state-row__cell {
  display: grid;
  justify-items: start;
  gap: var(--space-1);
  min-width: 0;
}

.state-row__caption {
  color: var(--text-tertiary);
  font-size: var(--type-micro-size);
  line-height: var(--type-micro-line);
  font-weight: var(--weight-medium);
}
</style>
