<script setup lang="ts">
import { computed } from "vue";
import { MpFilterBar, MpFilterChip, MpPageHeader, MpSectionHeader, MpTag } from "@mango-write/ui-mp";
import { mpSim } from "./state";
import { t } from "../i18n";

const categories = computed(() => [
  { id: "all", label: t({ zh: "全部", en: "All" }) },
  { id: "experiment", label: t({ zh: "实验", en: "Experiment" }) },
  { id: "reading", label: t({ zh: "阅读", en: "Reading" }) },
  { id: "idea", label: t({ zh: "灵感", en: "Ideas" }) },
]);
const tags = ["experiment", "reading", "idea"] as const;
const tagLabels = {
  experiment: { zh: "实验", en: "Experiment" },
  reading: { zh: "阅读", en: "Reading" },
  idea: { zh: "灵感", en: "Ideas" },
} as const;
function toggle(tag: string): void {
  mpSim.filters.tags = mpSim.filters.tags.includes(tag) ? mpSim.filters.tags.filter((item) => item !== tag) : [...mpSim.filters.tags, tag];
}
</script>

<template>
  <main class="mp-preview__scroll mp-preview__pad">
    <MpPageHeader :title="t({ zh: '筛选与选择', en: 'Filters and selection' })" :description="t({ zh: '静态标签不承担动作，选择芯片始终有 44px 目标。', en: 'Static tags never act; selectable chips always have 44px targets.' })" />
    <MpFilterBar v-model="mpSim.filters.category" :items="categories" />
    <MpSectionHeader :title="t({ zh: '多选标签', en: 'Multi-select tags' })" :meta="`${mpSim.filters.tags.length}`" />
    <div class="mp-preview__row"><MpFilterChip v-for="tag in tags" :key="tag" :label="t(tagLabels[tag])" :selected="mpSim.filters.tags.includes(tag)" :disabled="mpSim.filters.disabled" @click="toggle(tag)" /></div>
    <MpSectionHeader :title="t({ zh: '静态语义标签', en: 'Static semantic tags' })" />
    <div class="mp-preview__row"><MpTag label="Primary" severity="primary" /><MpTag label="Info" severity="info" /><MpTag label="Success" severity="success" /><MpTag label="Warning" severity="warning" /></div>
  </main>
</template>
