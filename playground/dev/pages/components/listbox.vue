<script setup lang="ts">
import { computed, ref } from "vue";
import { Listbox } from "@mango-write/ui-vue";
import { api } from "../../api/entries/listbox";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/listbox";

/* Listbox 直读字符串字段,候选数据按当前语言整体重建 */
const folders = computed(() => [
  { label: t({ zh: "深度学习与表征", en: "Deep learning & representation" }), value: "dl" },
  { label: t({ zh: "计算语言学", en: "Computational linguistics" }), value: "cl" },
  { label: t({ zh: "生物信息学", en: "Bioinformatics" }), value: "bio" },
  { label: t({ zh: "人机交互（只读）", en: "HCI (read-only)" }), value: "hci", disabled: true },
  { label: t({ zh: "知识检索与图谱", en: "Knowledge retrieval & graphs" }), value: "ir" },
  { label: t({ zh: "多模态生成", en: "Multimodal generation" }), value: "mm" },
  { label: t({ zh: "科学可视化", en: "Scientific visualization" }), value: "vis" },
  { label: t({ zh: "统计因果推断", en: "Statistical causal inference" }), value: "causal" },
]);
const selectedFolder = ref("dl");
const selectedMulti = ref<string[]>(["dl", "bio"]);

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "面板内直接平铺选项（如归档目录选择、标签分配），无需二次下拉点击。",
    en: "Options lay flat inside the panel (archive folders, tag assignment) with no extra dropdown click.",
  },
  rule2: {
    zh: "选项超过 8 条时开启 <code>filter</code> 提供顶部即时检索。",
    en: "Past eight options, turn on <code>filter</code> for instant search at the top.",
  },
  rule3: {
    zh: "表单行内空间有限时用 <code>Select</code> 或 <code>MultiSelect</code>。",
    en: "When inline form space is tight, use <code>Select</code> or <code>MultiSelect</code>.",
  },
  baseTitle: { zh: "底面", en: "Surfaces" },
  baseDesc: {
    zh: "纸面与霜面并排。列表框继承 .mw-control 底座，选中行使用 --fill-selected 半透明高亮。",
    en: "Paper and frost side by side. The listbox inherits the .mw-control base; selected rows highlight with translucent --fill-selected.",
  },
  folderAria: { zh: "文库文件夹", en: "Library folders" },
  statesTitle: { zh: "状态与检索", en: "States and filtering" },
  statesDesc: {
    zh: "支持单选、多选、内置过滤框、禁用与校验失败态。",
    en: "Single select, multi select, a built-in filter box, disabled, and invalid states.",
  },
  colFiltered: { zh: "带过滤单选", en: "Filtered" },
  colMulti: { zh: "多选", en: "Multi" },
  colDisabled: { zh: "禁用", en: "Disabled" },
  colError: { zh: "错误", en: "Error" },
  listRow: { zh: "列表", en: "List" },
  filterPh: { zh: "筛选目录…", en: "Filter folders…" },
  filteredAria: { zh: "带过滤单选", en: "Filtered single select" },
  multiAria: { zh: "多选列表", en: "Multi-select list" },
  disabledAria: { zh: "禁用列表", en: "Disabled list" },
  errorAria: { zh: "错误列表", en: "Invalid list" },
  api: { zh: "接口", en: "API" },
} as const;
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
      </ul>
    </DocSection>

    <DocSection :title="s.baseTitle" :desc="s.baseDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <Listbox
          v-model="selectedFolder"
          :options="folders"
          option-label="label"
          option-value="value"
          option-disabled="disabled"
          :aria-label="t(s.folderAria)"
        />
      </Specimen>
    </DocSection>

    <DocSection :title="s.statesTitle" :desc="s.statesDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colFiltered, s.colMulti, s.colDisabled, s.colError]" label-width="48px">
          <StateRow :label="s.listRow">
            <Listbox
              v-model="selectedFolder"
              :options="folders"
              option-label="label"
              option-value="value"
              option-disabled="disabled"
              filter
              :filter-placeholder="t(s.filterPh)"
              :aria-label="t(s.filteredAria)"
            />
            <Listbox
              v-model="selectedMulti"
              :options="folders"
              option-label="label"
              option-value="value"
              option-disabled="disabled"
              multiple
              :aria-label="t(s.multiAria)"
            />
            <Listbox
              v-model="selectedFolder"
              :options="folders"
              option-label="label"
              option-value="value"
              disabled
              :aria-label="t(s.disabledAria)"
            />
            <Listbox
              v-model="selectedFolder"
              :options="folders"
              option-label="label"
              option-value="value"
              invalid
              :aria-label="t(s.errorAria)"
            />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
