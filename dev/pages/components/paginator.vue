<script setup lang="ts">
import { computed, ref } from "vue";
import { Paginator } from "../../../src";
import { api } from "../../api/entries/paginator";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/paginator";

const first = ref(20);
const rows = ref(10);

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  do1: {
    zh: "总条数明确且需要稳定页码定位的列表或 <code>DataTable</code>。",
    en: "Lists or <code>DataTable</code>s with a known total that need stable page addressing.",
  },
  do2: {
    zh: "与表格搭配时可直接开启 <code>DataTable</code> 的 <code>paginator</code> 属性。",
    en: "With a table, enable the <code>DataTable</code> <code>paginator</code> prop directly instead.",
  },
  dont1: {
    zh: "流式阅读或即时搜索候选列表优先用滚动加载，不放分页器。",
    en: "Prefer scroll loading for streaming reads and instant-search candidate lists; skip the paginator.",
  },
  surfaceTitle: { zh: "底面", en: "Surface" },
  surfaceDesc: {
    zh: "纸面与霜面并排。页码按钮等宽对齐（tabular-nums），当前页使用品牌色强调，每页条数复用 Select 组件。",
    en: "Paper and frost side by side. Page links align on tabular numerals, the current page takes the brand accent, and the rows-per-page select reuses the Select component.",
  },
  themeTitle: { zh: "深浅主题与自定义模板", en: "Light/dark themes and custom templates" },
  themeDesc: { zh: "支持自定义统计文案与禁用态。", en: "Supports a custom summary line and the disabled state." },
  api: { zh: "接口", en: "API" },
} as const;

/* Paginator 直读模板字符串,统计文案按当前语言重建 */
const reportTemplate = computed(() =>
  t({
    zh: "第 {currentPage} / {totalPages} 页 · 共 {totalRecords} 篇文献",
    en: "Page {currentPage} / {totalPages} · {totalRecords} references in total",
  }),
);
</script>

<template>
  <DocPage>
    <DocSection :title="s.demo" :desc="s.demoDesc">
      <UsagePlayground :entry="usage" />
    </DocSection>
    <DocSection :title="s.whenToUse">
      <ul class="doc-rules">
        <li data-kind="do" v-html="t(s.do1)" />
        <li data-kind="do" v-html="t(s.do2)" />
        <li data-kind="dont" v-html="t(s.dont1)" />
      </ul>
    </DocSection>

    <DocSection :title="s.surfaceTitle" :desc="s.surfaceDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <Paginator
          v-model:first="first"
          v-model:rows="rows"
          :total-records="128"
          :page-link-size="3"
          :rows-per-page-options="[10, 20, 50]"
        />
      </Specimen>
    </DocSection>

    <DocSection :title="s.themeTitle" :desc="s.themeDesc">
      <Specimen themes="both" layout="stack">
        <Paginator
          :first="0"
          :rows="20"
          :total-records="240"
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
          :current-page-report-template="reportTemplate"
        />
        <Paginator :first="0" :rows="10" :total-records="50" disabled />
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
