<script setup lang="ts">
import { ref } from "vue";
import { RadioButton } from "../../../src";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const citeStyle = ref("apa");
const citeStyles = [
  { label: "APA 第 7 版", value: "apa" },
  { label: "GB/T 7714-2015", value: "gbt" },
  { label: "IEEE 顺序编码", value: "ieee" },
];
</script>

<template>
  <DocPage lead="单选按钮：在 2–5 个互斥选项中择一。未选态为圆形控件面与强边框，选中后填充品牌色并弹出中心圆点。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">选项少且需要全部平铺展示（特别适合每个选项附带说明文字的表单项）。</li>
        <li data-kind="do">与原生 <code>&lt;label&gt;</code> 配合使用，扩大点击热区。</li>
        <li data-kind="dont">用于紧凑工具条的视图切换时用 <code>SelectButton</code>；选项超过 5 个时用 <code>Select</code>。</li>
        <li data-kind="dont">允许选多个或全部取消时用 <code>Checkbox</code>。</li>
      </ul>
    </DocSection>

    <DocSection title="底面" desc="纸面与霜面并排。选中圆点使用弹性曲线缩放过渡，在浅深主题下保持高对比度。">
      <Specimen :surfaces="['paper', 'frost']">
        <label
          v-for="item in citeStyles"
          :key="item.value"
          class="doc-row"
          style="gap: var(--space-2); cursor: pointer"
        >
          <RadioButton v-model="citeStyle" name="cite-style" :value="item.value" />
          <span>{{ item.label }}</span>
        </label>
      </Specimen>
    </DocSection>

    <DocSection title="尺寸" desc="sm / md / lg 三档，默认 md。外圈尺寸与 Checkbox 对齐，内圆点随档位缩放。">
      <Specimen themes="single" layout="stack">
        <div v-for="s in (['sm', 'md', 'lg'] as const)" :key="s" class="doc-row">
          <span class="doc-note" style="width: 24px">{{ s }}</span>
          <RadioButton :model-value="'a'" value="b" :size="s" :aria-label="`${s} 未选`" />
          <RadioButton :model-value="'a'" value="a" :size="s" :aria-label="`${s} 已选`" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="状态" desc="支持键盘焦点环与空格选中；只读与禁用态阻断变更。">
      <Specimen themes="both">
        <StateGrid :columns="['未选', '已选', '只读', '未选禁用', '已选禁用', '错误']" label-width="48px">
          <StateRow v-for="s in (['sm', 'md', 'lg'] as const)" :key="s" :label="s">
            <RadioButton :model-value="'on'" value="off" :size="s" aria-label="未选" />
            <RadioButton :model-value="'on'" value="on" :size="s" aria-label="已选" />
            <RadioButton :model-value="'on'" value="on" readonly :size="s" aria-label="只读" />
            <RadioButton :model-value="'on'" value="off" disabled :size="s" aria-label="未选禁用" />
            <RadioButton :model-value="'on'" value="on" disabled :size="s" aria-label="已选禁用" />
            <RadioButton :model-value="'on'" value="off" invalid :size="s" aria-label="错误" />
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
          <tr><td><code>modelValue</code></td><td><code>T</code></td><td>当前选中值（<code>v-model</code>）</td></tr>
          <tr><td><code>value</code></td><td><code>T</code></td><td>当前单选框代表的选项值，支持基本类型与对象比较</td></tr>
          <tr><td><code>binary</code></td><td><code>boolean</code></td><td>独立布尔模式，点击切换布尔值</td></tr>
          <tr><td><code>name</code> / <code>inputId</code></td><td><code>string</code></td><td>原生表单分组名与关联标签 ID</td></tr>
          <tr><td><code>size</code></td><td><code>sm · md · lg</code></td><td>尺寸档位，默认 <code>md</code></td></tr>
          <tr><td><code>disabled</code> / <code>readonly</code> / <code>invalid</code></td><td><code>boolean</code></td><td>禁用、只读与错误态</td></tr>
        </tbody>
      </table>
    </DocSection>
  </DocPage>
</template>
