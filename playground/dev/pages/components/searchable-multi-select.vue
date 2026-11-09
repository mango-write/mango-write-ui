<script setup lang="ts">
import { computed, ref } from "vue";
import { SearchableMultiSelect } from "@mango-write/ui-vue";
import { api } from "../../api/entries/searchable-multi-select";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/searchable-multi-select";

/* 候选数据按当前语言整体重建,过滤谓词匹配的是取词后的 label/code */
const tags = ref<string[]>(["methodology", "dataset", "benchmark"]);
const crowdedTags = ref<string[]>(["methodology", "dataset", "benchmark", "ablation", "reproducible"]);

const tagOptions = computed(() => [
  { label: t({ zh: "方法论 (Methodology)", en: "Methodology" }), value: "methodology", code: "MTH" },
  { label: t({ zh: "数据集 (Dataset)", en: "Dataset" }), value: "dataset", code: "DAT" },
  { label: t({ zh: "基准评测 (Benchmark)", en: "Benchmark" }), value: "benchmark", code: "BMK" },
  { label: t({ zh: "消融实验 (Ablation)", en: "Ablation" }), value: "ablation", code: "ABL" },
  { label: t({ zh: "可复现性 (Reproducible)", en: "Reproducibility" }), value: "reproducible", code: "REP" },
  { label: t({ zh: "综述 (Survey)", en: "Survey" }), value: "survey", code: "SRV" },
  { label: t({ zh: "理论证明 (Theoretical)", en: "Theory" }), value: "theory", code: "THM" },
  { label: t({ zh: "实证研究 (Empirical)", en: "Empirical" }), value: "empirical", code: "EMP" },
  { label: t({ zh: "临床试验 (Clinical)", en: "Clinical trial" }), value: "clinical", code: "CLN" },
]);

function filterByLabelOrCode(option: Record<string, unknown>, query: string): boolean {
  const label = String(option.label ?? "").toLowerCase();
  const code = String(option.code ?? "").toLowerCase();
  return label.includes(query) || code.includes(query);
}

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "需要高频输入检索并多选（如文献标签、关键词、分类），且工具栏或表单列宽有限。",
    en: "Frequent type-to-search with multiple picks (tags, keywords, categories) in a toolbar or narrow form column.",
  },
  rule2: {
    zh: "工具条档（mw-toolbar）宽度按最宽候选定死（封顶 13rem），chip 增减只折叠进 +N 不改变宽度；表单/面板档仍是撑满容器。",
    en: "Toolbar tier (mw-toolbar) locks to the widest option (capped at 13rem); chips fold into +N without changing width. Form/panel tier still fills the container.",
  },
  rule3: {
    zh: "通过 <code>optionFilter</code> 自定义多字段匹配（如同时匹配名称、拼音或缩写码）。",
    en: "Custom multi-field matching via <code>optionFilter</code> (e.g. match name, romanization, and code at once).",
  },
  rule4: {
    zh: "需要远程异步搜索时用 <code>AsyncSearchSelect</code>；选人场景直接用封装好头像的 <code>UserSelect</code>。",
    en: "For remote async search use <code>AsyncSearchSelect</code>; for picking people use <code>UserSelect</code>, which ships avatars out of the box.",
  },
  baseTitle: { zh: "底面", en: "Surfaces" },
  baseDesc: {
    zh: "纸面与霜面并排。框内 chip 使用 --fill-default，点击 × 或按 Backspace 即可移除末尾项。",
    en: "Paper and frost side by side. In-trigger chips use --fill-default; click × or press Backspace to remove the last one.",
  },
  tagsPh: { zh: "输入过滤并添加文献标签…", en: "Type to filter and add tags…" },
  tagsAria: { zh: "文献标签", en: "Reference tags" },
  foldTitle: { zh: "动态宽度折叠与自定义过滤", en: "Dynamic width folding and custom filtering" },
  foldDesc: {
    zh: "根据容器真实宽度测量每个 chip，放不下的自动收进 +N；下方右例支持输入缩写码（如 MTH / BMK）过滤。",
    en: "Each chip is measured against the container's real width and overflow folds into +N; the lower-right example also matches abbreviation codes (e.g. MTH / BMK).",
  },
  narrowNote: { zh: "窄容器 260px", en: "Narrow container 260px" },
  customNote: { zh: "自定义过滤", en: "Custom filter" },
  narrowPh: { zh: "选择标签", en: "Pick tags" },
  narrowAria: { zh: "窄容器折叠演示", en: "Narrow-container folding demo" },
  codePh: { zh: "试试输入 MTH、DAT 或中文…", en: "Try MTH, DAT, or Chinese…" },
  codeAria: { zh: "支持缩写码检索", en: "Search by abbreviation code" },
  sizes: { zh: "尺寸", en: "Sizes" },
  sizesDesc: { zh: "支持 small / 默认 md / large 三档。", en: "Three tiers: small, default md, large." },
  smallAria: { zh: "小号", en: "Small" },
  defaultAria: { zh: "默认", en: "Default" },
  largeAria: { zh: "大号", en: "Large" },
  states: { zh: "状态", en: "States" },
  statesDesc: {
    zh: "窄宽下自动收拢；禁用态隐藏单个 chip 的移除按钮。",
    en: "Collapses automatically at narrow widths; disabled hides each chip's remove button.",
  },
  colEmpty: { zh: "空态占位", en: "Empty" },
  colWide: { zh: "宽容器展开", en: "Expanded" },
  colNarrow: { zh: "窄容器 +N", en: "+N folded" },
  colDisabled: { zh: "禁用", en: "Disabled" },
  colError: { zh: "错误", en: "Error" },
  addPh: { zh: "添加标签…", en: "Add tags…" },
  pickOne: { zh: "至少一项", en: "At least one" },
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
        <li data-kind="do" v-html="t(s.rule3)" />
        <li data-kind="dont" v-html="t(s.rule4)" />
      </ul>
    </DocSection>

    <DocSection :title="s.baseTitle" :desc="s.baseDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <SearchableMultiSelect
          v-model="tags"
          :options="tagOptions"
          option-label="label"
          option-value="value"
          :placeholder="t(s.tagsPh)"
          :aria-label="t(s.tagsAria)"
        />
      </Specimen>
    </DocSection>

    <DocSection :title="s.foldTitle" :desc="s.foldDesc">
      <Specimen themes="single" layout="stack">
        <div class="doc-row">
          <span class="doc-note" style="width: 88px">{{ t(s.narrowNote) }}</span>
          <div style="width: 260px">
            <SearchableMultiSelect
              v-model="crowdedTags"
              :options="tagOptions"
              option-label="label"
              option-value="value"
              :placeholder="t(s.narrowPh)"
              :aria-label="t(s.narrowAria)"
            />
          </div>
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 88px">{{ t(s.customNote) }}</span>
          <div style="flex: 1; min-width: 240px">
            <SearchableMultiSelect
              v-model="tags"
              :options="tagOptions"
              option-label="label"
              option-value="value"
              :option-filter="filterByLabelOrCode"
              :placeholder="t(s.codePh)"
              :aria-label="t(s.codeAria)"
            >
              <template #option="{ option }">
                <span class="doc-row" style="justify-content: space-between; width: 100%">
                  <span>{{ option.label }}</span>
                  <span class="doc-note">{{ option.code }}</span>
                </span>
              </template>
            </SearchableMultiSelect>
          </div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.sizes" :desc="s.sizesDesc">
      <Specimen themes="single" layout="stack">
        <div class="doc-row">
          <span class="doc-note" style="width: 48px">small</span>
          <div style="flex: 1">
            <SearchableMultiSelect v-model="tags" size="small" :options="tagOptions" option-label="label" option-value="value" :aria-label="t(s.smallAria)" />
          </div>
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 48px">md</span>
          <div style="flex: 1">
            <SearchableMultiSelect v-model="tags" :options="tagOptions" option-label="label" option-value="value" :aria-label="t(s.defaultAria)" />
          </div>
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 48px">large</span>
          <div style="flex: 1">
            <SearchableMultiSelect v-model="tags" size="large" :options="tagOptions" option-label="label" option-value="value" :aria-label="t(s.largeAria)" />
          </div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.states" :desc="s.statesDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colEmpty, s.colWide, s.colNarrow, s.colDisabled, s.colError]" label-width="48px">
          <StateRow label="md">
            <div style="width: 180px">
              <SearchableMultiSelect :model-value="[]" :options="tagOptions" option-label="label" option-value="value" :placeholder="t(s.addPh)" :aria-label="t(s.colEmpty)" />
            </div>
            <div style="width: 240px">
              <SearchableMultiSelect :model-value="['methodology', 'dataset']" :options="tagOptions" option-label="label" option-value="value" :aria-label="t(s.colWide)" />
            </div>
            <div style="width: 190px">
              <SearchableMultiSelect v-model="crowdedTags" :options="tagOptions" option-label="label" option-value="value" :aria-label="t(s.colNarrow)" />
            </div>
            <div style="width: 200px">
              <SearchableMultiSelect :model-value="['methodology', 'dataset']" :options="tagOptions" option-label="label" option-value="value" disabled :aria-label="t(s.colDisabled)" />
            </div>
            <div style="width: 180px">
              <SearchableMultiSelect :model-value="[]" :options="tagOptions" option-label="label" option-value="value" invalid :placeholder="t(s.pickOne)" :aria-label="t(s.colError)" />
            </div>
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
