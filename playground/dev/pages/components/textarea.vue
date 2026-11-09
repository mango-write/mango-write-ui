<script setup lang="ts">
import { ref } from "vue";
import { Textarea } from "@mango-write/ui-vue";
import { api } from "../../api/entries/textarea";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/textarea";

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "内容可能超过一行：批注正文、摘要、审稿意见。",
    en: "Content that may exceed one line: annotation bodies, abstracts, review comments.",
  },
  rule2: {
    zh: "对话式输入用 <code>autoResize</code>，随内容增高，避免内部滚动条。",
    en: "Conversational input uses <code>autoResize</code> to grow with content instead of an inner scrollbar.",
  },
  rule3: {
    zh: "不用它编辑草稿正文：正文走编辑器与 EditProposal。",
    en: "Don't edit draft body text with it: the body goes through the editor and EditProposal.",
  },
  rule4: {
    zh: "一行能写完的值用 <code>InputText</code>。",
    en: "Single-line values use <code>InputText</code>.",
  },
  surfaces: { zh: "底面", en: "Surfaces" },
  surfacesDesc: {
    zh: "纸面与霜面并排；放进批注气泡或弹出层时仍是半透明面。",
    en: "Paper and frost side by side; still a translucent surface inside annotation bubbles or popups.",
  },
  demoNote: {
    zh: "第 3 节的对照实验缺少样本量说明，建议补充 n 值与统计检验方法。",
    en: "Section 3 lacks a sample size statement in its controlled experiment; add the n and the statistical test.",
  },
  aiPrompt: { zh: "向 AI 描述你想如何改写这一段…", en: "Tell the AI how to rewrite this paragraph…" },
  density: { zh: "密度", en: "Density" },
  densityDesc: {
    zh: "Textarea 没有 size 参数，读继承的 --control-*：容器挂 .mw-size-sm 即缩小字号与内距。rows=1 时高度等于同档控件高度。",
    en: "Textarea has no size prop and reads inherited --control-*: put .mw-size-sm on the container to shrink font and padding. With rows=1 the height matches the same-tier control.",
  },
  singleLine: { zh: "单行起步", en: "Starts single-line" },
  defaultMd: { zh: "默认 md", en: "Default md" },
  states: { zh: "状态", en: "States" },
  colEmpty: { zh: "空", en: "Empty" },
  colFilled: { zh: "有值", en: "Filled" },
  colDisabled: { zh: "禁用", en: "Disabled" },
  colReadonly: { zh: "只读", en: "Readonly" },
  colInvalid: { zh: "错误", en: "Invalid" },
  stateDefault: { zh: "默认", en: "Default" },
  reviewHint: { zh: "写下审稿意见", en: "Write a review comment" },
  demoAbstract: {
    zh: "本文提出一种面向长文献的分段摘要方法。",
    en: "This paper proposes a sectioned summarization method for long documents.",
  },
  tooLong: { zh: "摘要超过 300 字", en: "Abstract exceeds 300 characters" },
  api: { zh: "接口", en: "API" },
} as const;

const note = ref(t(s.demoNote));
const abstract = ref(t(s.demoAbstract));
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
        <Textarea v-model="note" :rows="3" />
        <Textarea :placeholder="t(s.aiPrompt)" :rows="2" auto-resize />
      </Specimen>
    </DocSection>

    <DocSection :title="s.density" :desc="s.densityDesc">
      <Specimen themes="single" layout="stack">
        <div class="doc-row mw-size-sm">
          <span class="doc-note" style="width: 88px">.mw-size-sm</span>
          <Textarea :rows="1" :placeholder="t(s.singleLine)" style="width: 280px" />
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 88px">{{ t(s.defaultMd) }}</span>
          <Textarea :rows="1" :placeholder="t(s.singleLine)" style="width: 280px" />
        </div>
        <div class="doc-row mw-size-lg">
          <span class="doc-note" style="width: 88px">.mw-size-lg</span>
          <Textarea :rows="1" :placeholder="t(s.singleLine)" style="width: 280px" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.states">
      <Specimen themes="both">
        <StateGrid :columns="[s.colEmpty, s.colFilled, s.colDisabled, s.colReadonly, s.colInvalid]" label-width="48px">
          <StateRow :label="s.stateDefault">
            <Textarea :placeholder="t(s.reviewHint)" :rows="2" style="width: 160px" />
            <Textarea v-model="abstract" :rows="2" style="width: 160px" />
            <Textarea :model-value="abstract" :rows="2" disabled style="width: 160px" />
            <Textarea :model-value="abstract" :rows="2" readonly style="width: 160px" />
            <Textarea :model-value="t(s.tooLong)" :rows="2" invalid style="width: 160px" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
