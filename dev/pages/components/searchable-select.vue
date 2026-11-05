<script setup lang="ts">
import { ref } from "vue";
import { SearchableSelect } from "../../../src";
import { api } from "../../api/entries/searchable-select";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const lang = ref<string | null>("zh-CN");
const citationKey = ref<string | null>("vaswani2017attention");

const langOptions = [
  { label: "简体中文 (zh-CN)", value: "zh-CN" },
  { label: "English (en-US)", value: "en-US" },
  { label: "日本語 (ja-JP)", value: "ja-JP" },
  { label: "Deutsch (de-DE)", value: "de-DE" },
  { label: "Français (fr-FR)", value: "fr-FR" },
];

const citeOptions = [
  { label: "vaswani2017attention · Attention Is All You Need", value: "vaswani2017attention" },
  { label: "devlin2019bert · BERT: Pre-training of Deep Bidirectional Transformers", value: "devlin2019bert" },
  { label: "he2016deep · Deep Residual Learning for Image Recognition", value: "he2016deep" },
  { label: "jumper2021highly · Highly accurate protein structure prediction with AlphaFold", value: "jumper2021highly" },
];
</script>

<template>
  <DocPage lead="可搜索单选：收起态本身就是输入框，聚焦即可打字过滤，面板不再另起搜索行。输入框宽度通过隐藏镜像按文字真实宽度自适应收缩。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">选项列表已在前端内存中，且用户习惯直接敲键盘检索（如选择语言、学科分类、本地 citeKey）。</li>
        <li data-kind="do">放在工具条或紧凑表单中：选中后宽度自动贴合所选项文字，不留多余空白。</li>
        <li data-kind="dont">需要远程防抖拉取后端接口时用 <code>AsyncSearchSelect</code>。</li>
        <li data-kind="dont">不需要输入过滤、或需要复杂选项插槽时用常规 <code>Select</code>。</li>
      </ul>
    </DocSection>

    <DocSection title="底面" desc="纸面与霜面并排。聚焦即展开霜面浮层并全选当前文字，方便直接覆盖输入。">
      <Specimen :surfaces="['paper', 'frost']">
        <SearchableSelect
          v-model="lang"
          :options="langOptions"
          option-label="label"
          option-value="value"
          placeholder="搜索写作语言…"
          aria-label="写作语言"
        />
        <SearchableSelect
          v-model="citationKey"
          :options="citeOptions"
          option-label="label"
          option-value="value"
          show-clear
          placeholder="输入 citeKey 或标题过滤…"
          aria-label="引用键"
        />
      </Specimen>
    </DocSection>

    <DocSection title="尺寸" desc="支持 small / 默认 md / large 三档，与 Select 同高同圆角。">
      <Specimen themes="single" layout="stack">
        <div class="doc-row">
          <span class="doc-note" style="width: 48px">small</span>
          <SearchableSelect
            v-model="lang"
            size="small"
            :options="langOptions"
            option-label="label"
            option-value="value"
            aria-label="小号可搜索单选"
          />
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 48px">md</span>
          <SearchableSelect
            v-model="lang"
            :options="langOptions"
            option-label="label"
            option-value="value"
            aria-label="默认可搜索单选"
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
            aria-label="大号可搜索单选"
          />
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="状态" desc="聚焦时呈现品牌色焦点环；未命中时显示无匹配提示。">
      <Specimen themes="both">
        <StateGrid :columns="['未选占位', '已选自适应', '带清空按钮', '禁用', '错误']" label-width="48px">
          <StateRow label="md">
            <SearchableSelect :model-value="null" :options="langOptions" option-label="label" option-value="value" placeholder="搜索语言…" aria-label="未选占位" />
            <SearchableSelect v-model="lang" :options="langOptions" option-label="label" option-value="value" aria-label="已选自适应" />
            <SearchableSelect v-model="lang" :options="langOptions" option-label="label" option-value="value" show-clear aria-label="带清空按钮" />
            <SearchableSelect v-model="lang" :options="langOptions" option-label="label" option-value="value" disabled aria-label="禁用" />
            <SearchableSelect :model-value="null" :options="langOptions" option-label="label" option-value="value" invalid placeholder="必选项" aria-label="错误" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
