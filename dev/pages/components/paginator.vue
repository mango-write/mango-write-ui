<script setup lang="ts">
import { ref } from "vue";
import { Paginator } from "../../../src";
import { api } from "../../api/entries/paginator";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";

const first = ref(20);
const rows = ref(10);
</script>

<template>
  <DocPage lead="分页器：在长列表或表格底部切分数据集，提供页码跳转、首尾页直达与每页条数切换。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">总条数明确且需要稳定页码定位的列表或 <code>DataTable</code>。</li>
        <li data-kind="do">与表格搭配时可直接开启 <code>DataTable</code> 的 <code>paginator</code> 属性。</li>
        <li data-kind="dont">流式阅读或即时搜索候选列表优先用滚动加载，不放分页器。</li>
      </ul>
    </DocSection>

    <DocSection title="底面" desc="纸面与霜面并排。页码按钮等宽对齐（tabular-nums），当前页使用品牌色强调，每页条数复用 Select 组件。">
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

    <DocSection title="深浅主题与自定义模板" desc="支持自定义统计文案与禁用态。">
      <Specimen themes="both" layout="stack">
        <Paginator
          :first="0"
          :rows="20"
          :total-records="240"
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
          current-page-report-template="第 {currentPage} / {totalPages} 页 · 共 {totalRecords} 篇文献"
        />
        <Paginator :first="0" :rows="10" :total-records="50" disabled />
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
