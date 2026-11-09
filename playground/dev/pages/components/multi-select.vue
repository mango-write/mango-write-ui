<script setup lang="ts">
import { computed, ref } from "vue";
import { MultiSelect } from "@mango-write/ui-vue";
import { api } from "../../api/entries/multi-select";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/multi-select";

/* MultiSelect 直读字符串字段,候选数据按当前语言整体重建 */
const selectedTopics = ref<string[]>(["nlp", "ir"]);
const selectedDatabases = ref<string[]>(["openalex", "pubmed", "arxiv"]);
const manySelected = ref<string[]>(["nlp", "cv", "ir", "hci"]);

const topicOptions = computed(() => [
  { label: t({ zh: "自然语言处理 (NLP)", en: "Natural language processing (NLP)" }), value: "nlp" },
  { label: t({ zh: "计算机视觉 (CV)", en: "Computer vision (CV)" }), value: "cv" },
  { label: t({ zh: "信息检索 (IR)", en: "Information retrieval (IR)" }), value: "ir" },
  { label: t({ zh: "人机交互 (HCI)", en: "Human-computer interaction (HCI)" }), value: "hci" },
  { label: t({ zh: "生物信息学 (Bio)", en: "Bioinformatics" }), value: "bio" },
  { label: t({ zh: "计算神经科学 (Neuro)", en: "Computational neuroscience" }), value: "neuro" },
  { label: t({ zh: "知识图谱与推理 (KG)", en: "Knowledge graphs & reasoning (KG)" }), value: "kg" },
  { label: t({ zh: "科学智能 (AI4Science)", en: "AI for science (AI4Science)" }), value: "ai4s" },
  { label: t({ zh: "历史归档方向", en: "Archived topic" }), value: "archived", disabled: true },
]);

const dbOptions = [
  { label: "OpenAlex", value: "openalex" },
  { label: "PubMed / MEDLINE", value: "pubmed" },
  { label: "arXiv", value: "arxiv" },
  { label: "Semantic Scholar", value: "s2" },
  { label: "Crossref", value: "crossref" },
];

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "从预设枚举中多选，需要面板内带复选框、全选（<code>showToggleAll</code>）或上限计数摘要（<code>maxSelectedLabels</code>）。",
    en: "Multi-pick from a fixed enum with in-panel checkboxes, select-all (<code>showToggleAll</code>), or a capped count summary (<code>maxSelectedLabels</code>).",
  },
  rule2: {
    zh: "用 <code>display=\"chip\"</code> 让用户在收起态直接点击单个标签的 × 移除；标签单行铺开，容器不够宽时收进 <code>+N</code>。",
    en: "Use <code>display=\"chip\"</code> so users remove a single chip by clicking its × while collapsed; chips lay out on one line and fold into <code>+N</code> when the container is too narrow.",
  },
  rule3: {
    zh: "若希望直接在触发框内打字过滤并按容器宽度自动折叠为 <code>+N</code>，用 <code>SearchableMultiSelect</code>。",
    en: "If you want typing to filter directly in the trigger, with automatic folding into <code>+N</code> by container width, use <code>SearchableMultiSelect</code>.",
  },
  rule4: {
    zh: "选择团队成员或协作者时用专用的 <code>UserSelect</code>。",
    en: "For picking team members or collaborators, use the dedicated <code>UserSelect</code>.",
  },
  baseTitle: { zh: "底面", en: "Surfaces" },
  baseDesc: {
    zh: "纸面与霜面并排。触发器与内部标签（chip）在霜面上保持半透明层次感。",
    en: "Paper and frost side by side. On frost, the trigger and its chips keep their translucent layering.",
  },
  topicPh: { zh: "选择研究方向", en: "Choose research topics" },
  topicAria: { zh: "研究方向（逗号模式）", en: "Research topics (comma mode)" },
  dbPh: { zh: "选择检索源", en: "Choose databases" },
  dbAria: { zh: "检索源（标签模式）", en: "Databases (chip mode)" },
  displayTitle: { zh: "展示模式与面板能力", en: "Display modes and panel features" },
  displayDesc: {
    zh: "comma 超出 maxSelectedLabels 收拢为计数文案；chip 模式宽度足够则撑长、不够则折成 +N（悬停显示剩余项）。面板头部支持全选与关键字筛选。",
    en: "With comma, overflow past maxSelectedLabels collapses into a count; chip mode stretches to fit and folds into +N when space runs out (hover to see the rest). The panel header supports select-all and keyword filtering.",
  },
  selectedCount: { zh: "已选 {0} 个学科方向", en: "{0} disciplines selected" },
  filterPh: { zh: "搜索方向…", en: "Search topics…" },
  filterAria: { zh: "带全选与过滤的多选", en: "Multi-select with select-all and filter" },
  sizes: { zh: "尺寸", en: "Sizes" },
  sizesDesc: { zh: "sm / md / lg 三档，默认 md。", en: "Three tiers, sm / md / lg, default md." },
  sizeAria: { zh: "档多选", en: "multi-select" },
  states: { zh: "状态", en: "States" },
  statesDesc: {
    zh: "支持方向键移动高亮、空格/回车勾选、Esc 收起。",
    en: "Move the highlight with the arrow keys, toggle with Space/Enter, collapse with Esc.",
  },
  colEmpty: { zh: "空态占位", en: "Empty" },
  colComma: { zh: "逗号回显", en: "Comma echo" },
  colChip: { zh: "标签回显", en: "Chip echo" },
  colDisabled: { zh: "禁用", en: "Disabled" },
  colError: { zh: "错误", en: "Error" },
  pleaseSelect: { zh: "请选择…", en: "Select…" },
  pickOne: { zh: "至少选一项", en: "Pick at least one" },
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
        <MultiSelect
          v-model="selectedTopics"
          :options="topicOptions"
          option-label="label"
          option-value="value"
          option-disabled="disabled"
          :placeholder="t(s.topicPh)"
          :aria-label="t(s.topicAria)"
        />
        <MultiSelect
          v-model="selectedDatabases"
          :options="dbOptions"
          option-label="label"
          option-value="value"
          display="chip"
          show-clear
          :placeholder="t(s.dbPh)"
          :aria-label="t(s.dbAria)"
        />
      </Specimen>
    </DocSection>

    <DocSection :title="s.displayTitle" :desc="s.displayDesc">
      <Specimen themes="single">
        <MultiSelect
          v-model="manySelected"
          :options="topicOptions"
          option-label="label"
          option-value="value"
          :max-selected-labels="2"
          :selected-items-label="t(s.selectedCount)"
          filter
          show-toggle-all
          show-clear
          :filter-placeholder="t(s.filterPh)"
          :aria-label="t(s.filterAria)"
        />
      </Specimen>
    </DocSection>

    <DocSection :title="s.sizes" :desc="s.sizesDesc">
      <Specimen themes="single" layout="stack">
        <div v-for="sz in (['sm', 'md', 'lg'] as const)" :key="sz" class="doc-row">
          <span class="doc-note" style="width: 24px">{{ sz }}</span>
          <MultiSelect
            v-model="selectedTopics"
            :size="sz"
            :options="topicOptions"
            option-label="label"
            option-value="value"
            :aria-label="`${sz} ${t(s.sizeAria)}`"
          />
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.states" :desc="s.statesDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colEmpty, s.colComma, s.colChip, s.colDisabled, s.colError]" label-width="48px">
          <StateRow label="md">
            <MultiSelect :model-value="[]" :options="topicOptions" option-label="label" option-value="value" :placeholder="t(s.pleaseSelect)" :aria-label="t(s.colEmpty)" />
            <MultiSelect v-model="selectedTopics" :options="topicOptions" option-label="label" option-value="value" :aria-label="t(s.colComma)" />
            <MultiSelect v-model="selectedTopics" :options="topicOptions" option-label="label" option-value="value" display="chip" :aria-label="t(s.colChip)" />
            <MultiSelect v-model="selectedTopics" :options="topicOptions" option-label="label" option-value="value" disabled :aria-label="t(s.colDisabled)" />
            <MultiSelect :model-value="[]" :options="topicOptions" option-label="label" option-value="value" invalid :placeholder="t(s.pickOne)" :aria-label="t(s.colError)" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
