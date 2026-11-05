<script setup lang="ts">
import { ref } from "vue";
import { MultiSelect } from "../../../src";
import { api } from "../../api/entries/multi-select";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const selectedTopics = ref<string[]>(["nlp", "ir"]);
const selectedDatabases = ref<string[]>(["openalex", "pubmed", "arxiv"]);
const manySelected = ref<string[]>(["nlp", "cv", "ir", "hci"]);

const topicOptions = [
  { label: "自然语言处理 (NLP)", value: "nlp" },
  { label: "计算机视觉 (CV)", value: "cv" },
  { label: "信息检索 (IR)", value: "ir" },
  { label: "人机交互 (HCI)", value: "hci" },
  { label: "生物信息学 (Bio)", value: "bio" },
  { label: "历史归档方向", value: "archived", disabled: true },
];

const dbOptions = [
  { label: "OpenAlex", value: "openalex" },
  { label: "PubMed / MEDLINE", value: "pubmed" },
  { label: "arXiv", value: "arxiv" },
  { label: "Semantic Scholar", value: "s2" },
  { label: "Crossref", value: "crossref" },
];
</script>

<template>
  <DocPage lead="下拉多选：在霜面弹出面板中勾选多个候选项。支持逗号拼接（comma）与可移除标签（chip）两种回显模式，超出上限时自动收拢计数。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">从预设枚举中多选，需要面板内带复选框、全选（<code>showToggleAll</code>）或上限计数摘要（<code>maxSelectedLabels</code>）。</li>
        <li data-kind="do">用 <code>display="chip"</code> 让用户在收起态直接点击单个标签的 × 移除。</li>
        <li data-kind="dont">若希望直接在触发框内打字过滤并按容器宽度自动折叠为 <code>+N</code>，用 <code>SearchableMultiSelect</code>。</li>
        <li data-kind="dont">选择团队成员或协作者时用专用的 <code>UserSelect</code>。</li>
      </ul>
    </DocSection>

    <DocSection title="底面" desc="纸面与霜面并排。触发器与内部标签（chip）在霜面上保持半透明层次感。">
      <Specimen :surfaces="['paper', 'frost']">
        <MultiSelect
          v-model="selectedTopics"
          :options="topicOptions"
          option-label="label"
          option-value="value"
          option-disabled="disabled"
          placeholder="选择研究方向"
          aria-label="研究方向（逗号模式）"
        />
        <MultiSelect
          v-model="selectedDatabases"
          :options="dbOptions"
          option-label="label"
          option-value="value"
          display="chip"
          show-clear
          placeholder="选择检索源"
          aria-label="检索源（标签模式）"
        />
      </Specimen>
    </DocSection>

    <DocSection title="展示模式与面板能力" desc="支持逗号拼接、标签 chip、超出 maxSelectedLabels 收拢文案，以及面板头部的全选与关键字筛选。">
      <Specimen themes="single">
        <MultiSelect
          v-model="manySelected"
          :options="topicOptions"
          option-label="label"
          option-value="value"
          :max-selected-labels="2"
          selected-items-label="已选 {0} 个学科方向"
          filter
          show-toggle-all
          show-clear
          filter-placeholder="搜索方向…"
          aria-label="带全选与过滤的多选"
        />
      </Specimen>
    </DocSection>

    <DocSection title="尺寸" desc="sm / md / lg 三档，默认 md。">
      <Specimen themes="single" layout="stack">
        <div v-for="s in (['sm', 'md', 'lg'] as const)" :key="s" class="doc-row">
          <span class="doc-note" style="width: 24px">{{ s }}</span>
          <MultiSelect
            v-model="selectedTopics"
            :size="s"
            :options="topicOptions"
            option-label="label"
            option-value="value"
            :aria-label="`${s} 档多选`"
          />
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="状态" desc="支持方向键移动高亮、空格/回车勾选、Esc 收起。">
      <Specimen themes="both">
        <StateGrid :columns="['空态占位', '逗号回显', '标签回显', '禁用', '错误']" label-width="48px">
          <StateRow label="md">
            <MultiSelect :model-value="[]" :options="topicOptions" option-label="label" option-value="value" placeholder="请选择…" aria-label="空态占位" />
            <MultiSelect v-model="selectedTopics" :options="topicOptions" option-label="label" option-value="value" aria-label="逗号回显" />
            <MultiSelect v-model="selectedTopics" :options="topicOptions" option-label="label" option-value="value" display="chip" aria-label="标签回显" />
            <MultiSelect v-model="selectedTopics" :options="topicOptions" option-label="label" option-value="value" disabled aria-label="禁用" />
            <MultiSelect :model-value="[]" :options="topicOptions" option-label="label" option-value="value" invalid placeholder="至少选一项" aria-label="错误" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
