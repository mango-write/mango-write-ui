<script setup lang="ts">
import { ref } from "vue";
import { AsyncSearchSelect, type AsyncSearchOption } from "../../../src";
import { api } from "../../api/entries/async-search-select";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/async-search-select";

const CORPUS: AsyncSearchOption[] = [
  {
    value: "W2741809807",
    label: "Attention Is All You Need",
    description: "Vaswani et al. · NeurIPS 2017 · 10.48550/arXiv.1706.03762",
  },
  {
    value: "W2963403868",
    label: "BERT: Pre-training of Deep Bidirectional Transformers",
    description: "Devlin et al. · NAACL 2019 · 10.18653/v1/N19-1423",
  },
  {
    value: "W3177828909",
    label: "Highly accurate protein structure prediction with AlphaFold",
    description: "Jumper et al. · Nature 2021 · 10.1038/s41586-021-03819-2",
  },
  {
    value: "W2194775991",
    label: "Deep Residual Learning for Image Recognition",
    description: "He et al. · CVPR 2016 · 10.1109/CVPR.2016.90",
  },
  {
    value: "W3030163527",
    label: "Language Models are Few-Shot Learners",
    description: "Brown et al. · NeurIPS 2020 · 10.48550/arXiv.2005.14165",
  },
  {
    value: "W4221157946",
    label: "Training language models to follow instructions with human feedback",
    description: "Ouyang et al. · NeurIPS 2022 · 10.48550/arXiv.2203.02155",
  },
  {
    value: "W4322618308",
    label: "LLaMA: Open and Efficient Foundation Language Models",
    description: "Touvron et al. · arXiv 2023 · 10.48550/arXiv.2302.13971",
  },
];

async function searchWorks(query: string): Promise<AsyncSearchOption[]> {
  await new Promise((r) => setTimeout(r, 180));
  const q = query.trim().toLowerCase();
  if (!q) return CORPUS;
  return CORPUS.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      (item.description ?? "").toLowerCase().includes(q),
  );
}

const selectedWork = ref<string | null>("W2741809807");
const initialWork: AsyncSearchOption = CORPUS[0];
const emptyWork = ref<string | null>(null);
const filteredWork = ref<string | null>(null);

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "数据量过大无法一次下发前端，需随输入调 API 检索（如 OpenAlex 题录、DOI 查询、跨机构作者检索）。",
    en: "Too much data to ship to the frontend at once — search the API per keystroke (OpenAlex works, DOI lookups, cross-institution author search).",
  },
  rule2: {
    zh: "编辑已有记录时传入 <code>initialOption</code>，无需先发请求即可正确回显标题。",
    en: "When editing an existing record, pass <code>initialOption</code> so the title echoes correctly without firing a request first.",
  },
  rule3: {
    zh: "候选已在本地内存时，用零延迟的 <code>SearchableSelect</code>。",
    en: "When the candidates already live in local memory, use the zero-latency <code>SearchableSelect</code>.",
  },
  baseTitle: { zh: "底面", en: "Surfaces" },
  baseDesc: {
    zh: "纸面与霜面并排。内置 250ms 防抖与加载旋转指示，选项默认支持标题 + 副标题（description）双行排版。",
    en: "Paper and frost side by side. A 250ms debounce and loading spinner are built in; options support a title + subtitle (description) two-line layout by default.",
  },
  workPh: { zh: "输入论文标题、作者或 DOI 检索…", en: "Search by title, author, or DOI…" },
  workAria: { zh: "关联中心文献", en: "Link a work" },
  excludeTitle: { zh: "排除已选项与自定义插槽", en: "Excluding values and custom slots" },
  excludeDesc: {
    zh: "通过 excludeValues 剔除已关联条目，避免重复添加；或用 #option 定制复杂行布局。",
    en: "excludeValues drops already-linked entries so they cannot be added twice; use #option for richer row layouts.",
  },
  excludeNote: { zh: "剔除首篇文献", en: "First work excluded" },
  excludedPh: {
    zh: "Attention Is All You Need 已被排除…",
    en: "“Attention Is All You Need” is excluded…",
  },
  excludeAria: { zh: "排除已选文献", en: "Excluded work" },
  states: { zh: "状态", en: "States" },
  statesDesc: {
    zh: "失焦时若未确认新选项，自动恢复为上一次已选的标题回显。",
    en: "If focus leaves without confirming a new option, the display restores the previously selected title.",
  },
  colEmpty: { zh: "空态待搜", en: "Empty" },
  colInitial: { zh: "初始回显", en: "Initial echo" },
  colNoClear: { zh: "不可清空", en: "No clear" },
  colDisabled: { zh: "禁用", en: "Disabled" },
  searchPh: { zh: "搜索题录…", en: "Search works…" },
  defaultRow: { zh: "默认", en: "Default" },
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
        <AsyncSearchSelect
          v-model="selectedWork"
          :search="searchWorks"
          :initial-option="initialWork"
          fluid
          :placeholder="t(s.workPh)"
          :aria-label="t(s.workAria)"
        />
      </Specimen>
    </DocSection>

    <DocSection :title="s.excludeTitle" :desc="s.excludeDesc">
      <Specimen themes="single" layout="stack">
        <div class="doc-row">
          <span class="doc-note" style="width: 96px">{{ t(s.excludeNote) }}</span>
          <div style="flex: 1">
            <AsyncSearchSelect
              v-model="filteredWork"
              :search="searchWorks"
              :exclude-values="['W2741809807']"
              fluid
              :placeholder="t(s.excludedPh)"
              :aria-label="t(s.excludeAria)"
            />
          </div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.states" :desc="s.statesDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colEmpty, s.colInitial, s.colNoClear, s.colDisabled]" label-width="48px">
          <StateRow :label="s.defaultRow">
            <AsyncSearchSelect v-model="emptyWork" :search="searchWorks" :placeholder="t(s.searchPh)" :aria-label="t(s.colEmpty)" />
            <AsyncSearchSelect v-model="selectedWork" :search="searchWorks" :initial-option="initialWork" :aria-label="t(s.colInitial)" />
            <AsyncSearchSelect v-model="selectedWork" :search="searchWorks" :initial-option="initialWork" :show-clear="false" :aria-label="t(s.colNoClear)" />
            <AsyncSearchSelect v-model="selectedWork" :search="searchWorks" :initial-option="initialWork" disabled :aria-label="t(s.colDisabled)" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
