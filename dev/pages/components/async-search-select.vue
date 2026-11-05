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
</script>

<template>
  <DocPage lead="异步搜索选择：面向远端题录库、机构库或全量用户的防抖检索单选。内置请求竞态丢弃、已选 ID 回显（initialOption）与双行副标题展示。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">数据量过大无法一次下发前端，需随输入调 API 检索（如 OpenAlex 题录、DOI 查询、跨机构作者检索）。</li>
        <li data-kind="do">编辑已有记录时传入 <code>initialOption</code>，无需先发请求即可正确回显标题。</li>
        <li data-kind="dont">候选已在本地内存时，用零延迟的 <code>SearchableSelect</code>。</li>
      </ul>
    </DocSection>

    <DocSection title="底面" desc="纸面与霜面并排。内置 250ms 防抖与加载旋转指示，选项默认支持标题 + 副标题（description）双行排版。">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <AsyncSearchSelect
          v-model="selectedWork"
          :search="searchWorks"
          :initial-option="initialWork"
          fluid
          placeholder="输入论文标题、作者或 DOI 检索…"
          aria-label="关联中心文献"
        />
      </Specimen>
    </DocSection>

    <DocSection title="排除已选项与自定义插槽" desc="通过 excludeValues 剔除已关联条目，避免重复添加；或用 #option 定制复杂行布局。">
      <Specimen themes="single" layout="stack">
        <div class="doc-row">
          <span class="doc-note" style="width: 96px">剔除首篇文献</span>
          <div style="flex: 1">
            <AsyncSearchSelect
              v-model="filteredWork"
              :search="searchWorks"
              :exclude-values="['W2741809807']"
              fluid
              placeholder="Attention Is All You Need 已被排除…"
              aria-label="排除已选文献"
            />
          </div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="状态" desc="失焦时若未确认新选项，自动恢复为上一次已选的标题回显。">
      <Specimen themes="both">
        <StateGrid :columns="['空态待搜', '初始回显', '不可清空', '禁用']" label-width="48px">
          <StateRow label="默认">
            <AsyncSearchSelect v-model="emptyWork" :search="searchWorks" placeholder="搜索题录…" aria-label="空态待搜" />
            <AsyncSearchSelect v-model="selectedWork" :search="searchWorks" :initial-option="initialWork" aria-label="初始回显" />
            <AsyncSearchSelect v-model="selectedWork" :search="searchWorks" :initial-option="initialWork" :show-clear="false" aria-label="不可清空" />
            <AsyncSearchSelect v-model="selectedWork" :search="searchWorks" :initial-option="initialWork" disabled aria-label="禁用" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
