<script setup lang="ts">
import { computed } from "vue";
import { SelectButton, ToggleSwitch } from "@mango-write/ui-vue";
import MpDocPage from "../../kit/MpDocPage.vue";
import { mobileApi } from "../../mobile-demos/api";
import { mpSim } from "../../mobile-demos/state";
import { t } from "../../i18n";

const categoryOptions = computed(() => [
  { label: t({ zh: "全部 all", en: "all" }), value: "all" },
  { label: t({ zh: "日志 journal", en: "journal" }), value: "journal" },
  { label: t({ zh: "文献 paper", en: "paper" }), value: "paper" },
]);

const code = computed(() =>
  t({
    zh: `<MpFilterBar v-model="category" :items="categories"${mpSim.filters.disabled ? " disabled" : ""} />
<MpFilterChip label="实验记录" :selected="tags.includes('experiment')"${mpSim.filters.disabled ? " disabled" : ""} @click="toggle('experiment')" />
<MpTag label="静态标签" tone="info" />`,
    en: `<MpFilterBar v-model="category" :items="categories"${mpSim.filters.disabled ? " disabled" : ""} />
<MpFilterChip label="Experiment" :selected="tags.includes('experiment')"${mpSim.filters.disabled ? " disabled" : ""} @click="toggle('experiment')" />
<MpTag label="Static tag" tone="info" />`,
  }),
);
</script>

<template>
  <MpDocPage slug="filters" :code="code" :api="mobileApi.filters" :guidelines="[
    { kind: 'do', zh: '<strong>筛选胶囊</strong>（MpFilterChip / MpFilterBar）：承担单选或多选过滤，32px 紧凑视觉高度配合 44px 透明触控热区。', en: '<strong>Filter chips</strong> (MpFilterChip / MpFilterBar): handle selection with a 32px visual pill and 44px touch target.' },
    { kind: 'do', zh: '<strong>静态标签</strong>（MpTag）：28px 高度，只用于元信息分类展示，不绑定点击事件。', en: '<strong>Static tags</strong> (MpTag): 28px height for metadata classification only, never clickable.' },
    { kind: 'dont', zh: '不混用 MpTag 与 MpFilterChip 的语义；所有可点选胶囊必须同步 aria-pressed。', en: 'Never mix MpTag and MpFilterChip semantics; interactive chips must sync aria-pressed.' },
  ]">
    <div class="mp-field">
      <div class="mp-field__head"><span class="mp-field__label">{{ t({ zh: "当前分类", en: "Active category" }) }}</span><code class="mp-field__prop">v-model="category"</code></div>
      <SelectButton size="sm" :model-value="mpSim.filters.category" :options="categoryOptions" option-label="label" option-value="value" :allow-empty="false" @update:model-value="mpSim.filters.category = $event as string" />
    </div>
    <div class="mp-field">
      <div class="mp-field__head"><span class="mp-field__label">{{ t({ zh: "禁用筛选", en: "Disabled" }) }}</span><code class="mp-field__prop">disabled</code></div>
      <ToggleSwitch v-model="mpSim.filters.disabled" />
    </div>
  </MpDocPage>
</template>
