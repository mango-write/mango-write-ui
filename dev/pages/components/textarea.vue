<script setup lang="ts">
import { ref } from "vue";
import { Textarea } from "../../../src";
import { api } from "../../api/entries/textarea";
import ApiTable from "../../kit/ApiTable.vue";
import CodeBlock from "../../kit/CodeBlock.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const note = ref("第 3 节的对照实验缺少样本量说明，建议补充 n 值与统计检验方法。");
const abstract = ref("本文提出一种面向长文献的分段摘要方法。");
</script>

<template>
  <DocPage lead="输入多行文本：摘要、批注、给 AI 的指令。与单行输入框共享同一控件面与焦点晕，单行高度与同档控件对齐。">
    <DocSection title="示例">
      <CodeBlock
        v-for="ex in api.examples"
        :key="ex.title"
        :code="ex.code"
        :title="ex.title"
      />
    </DocSection>
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">内容可能超过一行：批注正文、摘要、审稿意见。</li>
        <li data-kind="do">对话式输入用 <code>autoResize</code>，随内容增高，避免内部滚动条。</li>
        <li data-kind="dont">不用它编辑草稿正文：正文走编辑器与 EditProposal。</li>
        <li data-kind="dont">一行能写完的值用 <code>InputText</code>。</li>
      </ul>
    </DocSection>

    <DocSection title="底面" desc="纸面与霜面并排；放进批注气泡或弹出层时仍是半透明面。">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <Textarea v-model="note" :rows="3" />
        <Textarea placeholder="向 AI 描述你想如何改写这一段…" :rows="2" auto-resize />
      </Specimen>
    </DocSection>

    <DocSection title="密度" desc="Textarea 没有 size 参数，读继承的 --control-*：容器挂 .mw-size-sm 即缩小字号与内距。rows=1 时高度等于同档控件高度。">
      <Specimen themes="single" layout="stack">
        <div class="doc-row mw-size-sm">
          <span class="doc-note" style="width: 88px">.mw-size-sm</span>
          <Textarea :rows="1" placeholder="单行起步" style="width: 280px" />
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 88px">默认 md</span>
          <Textarea :rows="1" placeholder="单行起步" style="width: 280px" />
        </div>
        <div class="doc-row mw-size-lg">
          <span class="doc-note" style="width: 88px">.mw-size-lg</span>
          <Textarea :rows="1" placeholder="单行起步" style="width: 280px" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="状态">
      <Specimen themes="both">
        <StateGrid :columns="['空', '有值', '禁用', '只读', '错误']" label-width="48px">
          <StateRow label="默认">
            <Textarea placeholder="写下审稿意见" :rows="2" style="width: 160px" />
            <Textarea v-model="abstract" :rows="2" style="width: 160px" />
            <Textarea :model-value="abstract" :rows="2" disabled style="width: 160px" />
            <Textarea :model-value="abstract" :rows="2" readonly style="width: 160px" />
            <Textarea model-value="摘要超过 300 字" :rows="2" invalid style="width: 160px" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
