<script setup lang="ts">
import { computed, ref } from "vue";
import { SearchableSelect } from "../../../src";
import { api } from "../../api/entries/searchable-select";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/searchable-select";

/* SearchableSelect 直读字符串字段,候选数据按当前语言整体重建 */
const lang = ref<string | null>("zh-CN");
const citationKey = ref<string | null>("vaswani2017attention");

const langOptions = computed(() => [
  { label: t({ zh: "简体中文 (zh-CN)", en: "Simplified Chinese (zh-CN)" }), value: "zh-CN" },
  { label: "English (en-US)", value: "en-US" },
  { label: t({ zh: "日本語 (ja-JP)", en: "Japanese (ja-JP)" }), value: "ja-JP" },
  { label: "Deutsch (de-DE)", value: "de-DE" },
  { label: "Français (fr-FR)", value: "fr-FR" },
]);

const citeOptions = [
  { label: "vaswani2017attention · Attention Is All You Need", value: "vaswani2017attention" },
  { label: "devlin2019bert · BERT: Pre-training of Deep Bidirectional Transformers", value: "devlin2019bert" },
  { label: "he2016deep · Deep Residual Learning for Image Recognition", value: "he2016deep" },
  { label: "jumper2021highly · Highly accurate protein structure prediction with AlphaFold", value: "jumper2021highly" },
  { label: "brown2020language · Language Models are Few-Shot Learners", value: "brown2020language" },
  { label: "ouyang2022training · Training language models to follow instructions", value: "ouyang2022training" },
  { label: "touvron2023llama · LLaMA: Open and Efficient Foundation Language Models", value: "touvron2023llama" },
  { label: "abramson2024accurate · Accurate structure prediction of biomolecular interactions", value: "abramson2024accurate" },
];

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "选项列表已在前端内存中，且用户习惯直接敲键盘检索（如选择语言、学科分类、本地 citeKey）。",
    en: "The option list already lives in frontend memory and users search by typing (language pickers, subject categories, local citeKeys).",
  },
  rule2: {
    zh: "放在工具条或紧凑表单中：选中后宽度自动贴合所选项文字，不留多余空白。",
    en: "In toolbars or compact forms: after picking, the width hugs the selected option's text with no leftover space.",
  },
  rule3: {
    zh: "需要远程防抖拉取后端接口时用 <code>AsyncSearchSelect</code>。",
    en: "For remote debounced API calls, use <code>AsyncSearchSelect</code>.",
  },
  rule4: {
    zh: "不需要输入过滤、或需要复杂选项插槽时用常规 <code>Select</code>。",
    en: "When you don't need type-to-filter, or need complex option slots, use the regular <code>Select</code>.",
  },
  baseTitle: { zh: "底面", en: "Surfaces" },
  baseDesc: {
    zh: "纸面与霜面并排。聚焦即展开霜面浮层并全选当前文字，方便直接覆盖输入。",
    en: "Paper and frost side by side. Focusing opens the frost overlay and selects the current text for direct overtyping.",
  },
  langPh: { zh: "搜索写作语言…", en: "Search writing languages…" },
  langAria: { zh: "写作语言", en: "Writing language" },
  citePh: { zh: "输入 citeKey 或标题过滤…", en: "Filter by citeKey or title…" },
  citeAria: { zh: "引用键", en: "Citation key" },
  sizes: { zh: "尺寸", en: "Sizes" },
  sizesDesc: {
    zh: "支持 small / 默认 md / large 三档，与 Select 同高同圆角。",
    en: "Three tiers — small, default md, large — matching Select's height and radius.",
  },
  smallAria: { zh: "小号可搜索单选", en: "Small searchable select" },
  defaultAria: { zh: "默认可搜索单选", en: "Default searchable select" },
  largeAria: { zh: "大号可搜索单选", en: "Large searchable select" },
  states: { zh: "状态", en: "States" },
  statesDesc: {
    zh: "聚焦时呈现品牌色焦点环；未命中时显示无匹配提示。",
    en: "A brand-color focus ring when focused; a no-matches message when nothing hits.",
  },
  colEmpty: { zh: "未选占位", en: "Empty" },
  colAdaptive: { zh: "已选自适应", en: "Adaptive echo" },
  colClearable: { zh: "带清空按钮", en: "Clearable" },
  colDisabled: { zh: "禁用", en: "Disabled" },
  colError: { zh: "错误", en: "Error" },
  langSearchPh: { zh: "搜索语言…", en: "Search languages…" },
  required: { zh: "必选项", en: "Required" },
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
        <li data-kind="dont" v-html="t(s.rule4)" />
      </ul>
    </DocSection>

    <DocSection :title="s.baseTitle" :desc="s.baseDesc">
      <Specimen :surfaces="['paper', 'frost']">
        <SearchableSelect
          v-model="lang"
          :options="langOptions"
          option-label="label"
          option-value="value"
          :placeholder="t(s.langPh)"
          :aria-label="t(s.langAria)"
        />
        <SearchableSelect
          v-model="citationKey"
          :options="citeOptions"
          option-label="label"
          option-value="value"
          show-clear
          :placeholder="t(s.citePh)"
          :aria-label="t(s.citeAria)"
        />
      </Specimen>
    </DocSection>

    <DocSection :title="s.sizes" :desc="s.sizesDesc">
      <Specimen themes="single" layout="stack">
        <div class="doc-row">
          <span class="doc-note" style="width: 48px">small</span>
          <SearchableSelect
            v-model="lang"
            size="small"
            :options="langOptions"
            option-label="label"
            option-value="value"
            :aria-label="t(s.smallAria)"
          />
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 48px">md</span>
          <SearchableSelect
            v-model="lang"
            :options="langOptions"
            option-label="label"
            option-value="value"
            :aria-label="t(s.defaultAria)"
          />
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 48px">large</span>
          <SearchableSelect
            v-model="lang"
            size="large"
            :options="langOptions"
            option-label="label"
            option-value="value"
            :aria-label="t(s.largeAria)"
          />
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.states" :desc="s.statesDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colEmpty, s.colAdaptive, s.colClearable, s.colDisabled, s.colError]" label-width="48px">
          <StateRow label="md">
            <SearchableSelect :model-value="null" :options="langOptions" option-label="label" option-value="value" :placeholder="t(s.langSearchPh)" :aria-label="t(s.colEmpty)" />
            <SearchableSelect v-model="lang" :options="langOptions" option-label="label" option-value="value" :aria-label="t(s.colAdaptive)" />
            <SearchableSelect v-model="lang" :options="langOptions" option-label="label" option-value="value" show-clear :aria-label="t(s.colClearable)" />
            <SearchableSelect v-model="lang" :options="langOptions" option-label="label" option-value="value" disabled :aria-label="t(s.colDisabled)" />
            <SearchableSelect :model-value="null" :options="langOptions" option-label="label" option-value="value" invalid :placeholder="t(s.required)" :aria-label="t(s.colError)" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
