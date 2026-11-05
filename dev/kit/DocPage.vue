<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { locale, t, type Bi } from "../i18n";

// lead 缺省取路由 meta(registry-data 单源);installation 这类 lead 复用
// content.ts 文案的页面经 prop 覆盖,避免同一句进两份数据。
const props = defineProps<{ lead?: string | Bi }>();

const route = useRoute();
const title = computed(() => t(route.meta.title ?? ""));
const group = computed(() => t(route.meta.group ?? ""));
// zh 页 eyebrow 带组件英文名(=API 名,检索键);en 页 h1 已是英文名,只留分区。
const eyebrow = computed(() => {
  const en = route.meta.title?.en;
  return locale.value === "zh-CN" && en ? `${group.value} · ${en}` : group.value;
});
const leadText = computed(() => {
  const value = props.lead ?? route.meta.lead;
  return value ? t(value) : undefined;
});
</script>

<template>
  <article class="doc">
    <p class="doc__eyebrow">{{ eyebrow }}</p>
    <h1 class="doc__title">{{ title }}</h1>
    <p v-if="leadText" class="doc__lead">{{ leadText }}</p>
    <slot />
  </article>
</template>
