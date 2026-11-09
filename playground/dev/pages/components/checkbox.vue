<script setup lang="ts">
import { computed, ref } from "vue";
import { Checkbox } from "@mango-write/ui-vue";
import { api } from "../../api/entries/checkbox";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/checkbox";

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "在表单或配置面板中勾选一或多个独立选项，或用 <code>binary</code> 表达需点击「保存」才生效的布尔项。",
    en: "Check one or more independent options in forms or settings, or use <code>binary</code> for booleans that apply on “Save”.",
  },
  rule2: {
    zh: "在树或表格表头配合 <code>indeterminate</code> 表达「子项部分选中」。",
    en: "Pair with <code>indeterminate</code> in trees or table headers to show “some children selected”.",
  },
  rule3: {
    zh: "拨动即刻生效的系统开关用 <code>ToggleSwitch</code>；多选一的互斥项用 <code>RadioButton</code> 或 <code>SelectButton</code>。",
    en: "Instant-effect switches use <code>ToggleSwitch</code>; single-choice exclusives use <code>RadioButton</code> or <code>SelectButton</code>.",
  },
  rule4: {
    zh: "候选超过 6 项且空间紧凑时改用 <code>MultiSelect</code> 或 <code>SearchableMultiSelect</code>。",
    en: "Beyond 6 compact options, switch to <code>MultiSelect</code> or <code>SearchableMultiSelect</code>.",
  },
  surfaces: { zh: "底面", en: "Surfaces" },
  surfacesDesc: {
    zh: "纸面与霜面并排。未选框体复用 --control-bg 与 --border-strong，在半透明霜面上同样清晰。",
    en: "Paper and frost side by side. The unchecked box reuses --control-bg and --border-strong, equally crisp on translucent frost.",
  },
  syncMetadata: { zh: "自动同步题录元数据", en: "Auto-sync bibliographic metadata" },
  includeMarginNotes: { zh: "导出时附带页边批注", en: "Include margin notes on export" },
  selectAllSections: { zh: "全选章节", en: "Select all sections" },
  partAbstract: { zh: "摘要与关键词", en: "Abstract & keywords" },
  partBody: { zh: "正文与图表", en: "Body & figures" },
  partReferences: { zh: "参考文献与附录", en: "References & appendix" },
  sizes: { zh: "尺寸", en: "Sizes" },
  sizesDesc: {
    zh: "sm / md / lg 三档，默认 md。盒体边长对应 --icon-sm / --icon-md / --icon-lg。",
    en: "Three tiers, sm / md / lg, defaulting to md. Box size maps to --icon-sm / --icon-md / --icon-lg.",
  },
  unchecked: { zh: "未选", en: "unchecked" },
  checked: { zh: "已选", en: "checked" },
  indeterminate: { zh: "半选", en: "indeterminate" },
  states: { zh: "状态", en: "States" },
  statesDesc: {
    zh: "支持空格键切换；聚焦呈现品牌色外环，错误态描边切换为 --danger。",
    en: "Toggle with the space key; focus shows a brand-color ring and the invalid state switches the outline to --danger.",
  },
  colUnchecked: { zh: "未选", en: "Unchecked" },
  colChecked: { zh: "已选", en: "Checked" },
  colIndeterminate: { zh: "半选", en: "Indeterminate" },
  colReadonly: { zh: "只读", en: "Readonly" },
  colUncheckedDisabled: { zh: "未选禁用", en: "Unchecked disabled" },
  colCheckedDisabled: { zh: "已选禁用", en: "Checked disabled" },
  colInvalid: { zh: "错误", en: "Invalid" },
  api: { zh: "接口", en: "API" },
} as const;

const syncBib = ref(true);
const includeNotes = ref(false);
const exportParts = ref<string[]>(["abstract", "references"]);
const partOptions = computed(() => [
  { label: t(s.partAbstract), value: "abstract" },
  { label: t(s.partBody), value: "body" },
  { label: t(s.partReferences), value: "references" },
]);

const allSelected = computed(() => exportParts.value.length === partOptions.value.length);
const isIndeterminate = computed(
  () => exportParts.value.length > 0 && exportParts.value.length < partOptions.value.length,
);

function toggleAll(checked: boolean) {
  exportParts.value = checked ? partOptions.value.map((o) => o.value) : [];
}
</script>

<template>
  <DocPage>
    <DocSection :title="s.demo" :desc="s.demoDesc">
      <UsagePlayground :entry="usage" />
    </DocSection>
    <DocSection :title="s.whenToUse">
      <ul class="doc-rules">
        <li data-kind="do" v-html="t(s.rule1)" />
        <li data-kind="do" v-html="t(s.rule2)" />
        <li data-kind="dont" v-html="t(s.rule3)" />
        <li data-kind="dont" v-html="t(s.rule4)" />
      </ul>
    </DocSection>

    <DocSection :title="s.surfaces" :desc="s.surfacesDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <div class="doc-row">
          <label class="doc-row" style="gap: var(--space-2); cursor: pointer">
            <Checkbox v-model="syncBib" binary />
            <span>{{ t(s.syncMetadata) }}</span>
          </label>
          <label class="doc-row" style="gap: var(--space-2); cursor: pointer">
            <Checkbox v-model="includeNotes" binary />
            <span>{{ t(s.includeMarginNotes) }}</span>
          </label>
        </div>
        <div class="doc-row">
          <label class="doc-row" style="gap: var(--space-2); cursor: pointer">
            <Checkbox
              :model-value="allSelected"
              :indeterminate="isIndeterminate"
              binary
              @update:model-value="toggleAll"
            />
            <span>{{ t(s.selectAllSections) }}</span>
          </label>
          <label
            v-for="item in partOptions"
            :key="item.value"
            class="doc-row"
            style="gap: var(--space-2); cursor: pointer"
          >
            <Checkbox v-model="exportParts" :value="item.value" />
            <span>{{ item.label }}</span>
          </label>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.sizes" :desc="s.sizesDesc">
      <Specimen themes="single" layout="stack">
        <div v-for="size in (['sm', 'md', 'lg'] as const)" :key="size" class="doc-row">
          <span class="doc-note" style="width: 24px">{{ size }}</span>
          <Checkbox :model-value="false" binary :size="size" :aria-label="`${size} ${t(s.unchecked)}`" />
          <Checkbox :model-value="true" binary :size="size" :aria-label="`${size} ${t(s.checked)}`" />
          <Checkbox :model-value="false" indeterminate binary :size="size" :aria-label="`${size} ${t(s.indeterminate)}`" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.states" :desc="s.statesDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colUnchecked, s.colChecked, s.colIndeterminate, s.colReadonly, s.colUncheckedDisabled, s.colCheckedDisabled, s.colInvalid]" label-width="48px">
          <StateRow v-for="size in (['sm', 'md', 'lg'] as const)" :key="size" :label="size">
            <Checkbox :model-value="false" binary :size="size" :aria-label="t(s.colUnchecked)" />
            <Checkbox :model-value="true" binary :size="size" :aria-label="t(s.colChecked)" />
            <Checkbox :model-value="false" indeterminate binary :size="size" :aria-label="t(s.colIndeterminate)" />
            <Checkbox :model-value="true" binary readonly :size="size" :aria-label="t(s.colReadonly)" />
            <Checkbox :model-value="false" binary disabled :size="size" :aria-label="t(s.colUncheckedDisabled)" />
            <Checkbox :model-value="true" binary disabled :size="size" :aria-label="t(s.colCheckedDisabled)" />
            <Checkbox :model-value="false" binary invalid :size="size" :aria-label="t(s.colInvalid)" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
