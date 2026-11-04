<script setup lang="ts">
import { ref } from "vue";
import { Listbox } from "../../../src";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const folders = [
  { label: "深度学习与表征", value: "dl" },
  { label: "计算语言学", value: "cl" },
  { label: "生物信息学", value: "bio" },
  { label: "人机交互（只读）", value: "hci", disabled: true },
];
const selectedFolder = ref("dl");
const selectedMulti = ref<string[]>(["dl", "bio"]);
</script>

<template>
  <DocPage lead="列表框：常驻展开的单选或多选列表，支持内置关键词过滤与键盘上下巡航。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">面板内直接平铺选项（如归档目录选择、标签分配），无需二次下拉点击。</li>
        <li data-kind="do">选项超过 8 条时开启 <code>filter</code> 提供顶部即时检索。</li>
        <li data-kind="dont">表单行内空间有限时用 <code>Select</code> 或 <code>MultiSelect</code>。</li>
      </ul>
    </DocSection>

    <DocSection title="底面" desc="纸面与霜面并排。列表框继承 .mw-control 底座，选中行使用 --fill-selected 半透明高亮。">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <Listbox
          v-model="selectedFolder"
          :options="folders"
          option-label="label"
          option-value="value"
          option-disabled="disabled"
          aria-label="文库文件夹"
        />
      </Specimen>
    </DocSection>

    <DocSection title="状态与检索" desc="支持单选、多选、内置过滤框、禁用与校验失败态。">
      <Specimen themes="both">
        <StateGrid :columns="['带过滤单选', '多选', '禁用', '错误']" label-width="48px">
          <StateRow label="列表">
            <Listbox
              v-model="selectedFolder"
              :options="folders"
              option-label="label"
              option-value="value"
              option-disabled="disabled"
              filter
              filter-placeholder="筛选目录…"
              aria-label="带过滤单选"
            />
            <Listbox
              v-model="selectedMulti"
              :options="folders"
              option-label="label"
              option-value="value"
              option-disabled="disabled"
              multiple
              aria-label="多选列表"
            />
            <Listbox
              v-model="selectedFolder"
              :options="folders"
              option-label="label"
              option-value="value"
              disabled
              aria-label="禁用列表"
            />
            <Listbox
              v-model="selectedFolder"
              :options="folders"
              option-label="label"
              option-value="value"
              invalid
              aria-label="错误列表"
            />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <table class="doc-table">
        <thead>
          <tr><th>属性</th><th>取值</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><code>options</code> / <code>optionLabel</code> / <code>optionValue</code> / <code>optionDisabled</code></td><td>—</td><td>选项数组与字段映射</td></tr>
          <tr><td><code>multiple</code></td><td><code>boolean</code></td><td>启用多选模式</td></tr>
          <tr><td><code>filter</code> / <code>filterPlaceholder</code></td><td><code>boolean · string</code></td><td>显示顶部过滤输入框</td></tr>
          <tr><td><code>disabled</code> / <code>invalid</code></td><td><code>boolean</code></td><td>禁用态与错误态</td></tr>
        </tbody>
      </table>
    </DocSection>
  </DocPage>
</template>
