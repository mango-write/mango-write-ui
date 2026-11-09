<script setup lang="ts">
import { computed, ref } from "vue";
import { RadioButton } from "@mango-write/ui-vue";
import { api } from "../../api/entries/radio-button";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/radio-button";

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "选项少且需要全部平铺展示（特别适合每个选项附带说明文字的表单项）。",
    en: "Few options that must all be laid out (great for form items with a description per option).",
  },
  rule2: {
    zh: "与原生 <code>&lt;label&gt;</code> 配合使用，扩大点击热区。",
    en: "Pair with a native <code>&lt;label&gt;</code> to enlarge the click target.",
  },
  rule3: {
    zh: "用于紧凑工具条的视图切换时用 <code>SelectButton</code>；选项超过 5 个时用 <code>Select</code>。",
    en: "Compact toolbar view switching uses <code>SelectButton</code>; beyond 5 options use <code>Select</code>.",
  },
  rule4: {
    zh: "允许选多个或全部取消时用 <code>Checkbox</code>。",
    en: "Allowing multiple selections or none uses <code>Checkbox</code>.",
  },
  surfaces: { zh: "底面", en: "Surfaces" },
  surfacesDesc: {
    zh: "纸面与霜面并排。选中圆点使用弹性曲线缩放过渡，在浅深主题下保持高对比度。",
    en: "Paper and frost side by side. The selected dot scales with a spring curve, staying high-contrast in light and dark themes.",
  },
  citeApa: { zh: "APA 第 7 版", en: "APA 7th edition" },
  citeGbt: { zh: "GB/T 7714-2015", en: "GB/T 7714-2015" },
  citeIeee: { zh: "IEEE 顺序编码", en: "IEEE numeric" },
  sizes: { zh: "尺寸", en: "Sizes" },
  sizesDesc: {
    zh: "sm / md / lg 三档，默认 md。外圈尺寸与 Checkbox 对齐，内圆点随档位缩放。",
    en: "Three tiers, sm / md / lg, defaulting to md. Outer size aligns with Checkbox; the inner dot scales with the tier.",
  },
  unchecked: { zh: "未选", en: "unchecked" },
  checked: { zh: "已选", en: "checked" },
  states: { zh: "状态", en: "States" },
  statesDesc: {
    zh: "支持键盘焦点环与空格选中；只读与禁用态阻断变更。",
    en: "Keyboard focus ring and space to select; readonly and disabled block changes.",
  },
  colUnchecked: { zh: "未选", en: "Unchecked" },
  colChecked: { zh: "已选", en: "Checked" },
  colReadonly: { zh: "只读", en: "Readonly" },
  colUncheckedDisabled: { zh: "未选禁用", en: "Unchecked disabled" },
  colCheckedDisabled: { zh: "已选禁用", en: "Checked disabled" },
  colInvalid: { zh: "错误", en: "Invalid" },
  api: { zh: "接口", en: "API" },
} as const;

const citeStyle = ref("apa");
const citeStyles = computed(() => [
  { label: t(s.citeApa), value: "apa" },
  { label: t(s.citeGbt), value: "gbt" },
  { label: t(s.citeIeee), value: "ieee" },
]);
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

    <DocSection :title="s.sizes" :desc="s.sizesDesc">
      <Specimen themes="single" layout="stack">
        <div v-for="size in (['sm', 'md', 'lg'] as const)" :key="size" class="doc-row">
          <span class="doc-note" style="width: 24px">{{ size }}</span>
          <RadioButton :model-value="'a'" value="b" :size="size" :aria-label="`${size} ${t(s.unchecked)}`" />
          <RadioButton :model-value="'a'" value="a" :size="size" :aria-label="`${size} ${t(s.checked)}`" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.states" :desc="s.statesDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colUnchecked, s.colChecked, s.colReadonly, s.colUncheckedDisabled, s.colCheckedDisabled, s.colInvalid]" label-width="48px">
          <StateRow v-for="size in (['sm', 'md', 'lg'] as const)" :key="size" :label="size">
            <RadioButton :model-value="'on'" value="off" :size="size" :aria-label="t(s.colUnchecked)" />
            <RadioButton :model-value="'on'" value="on" :size="size" :aria-label="t(s.colChecked)" />
            <RadioButton :model-value="'on'" value="on" readonly :size="size" :aria-label="t(s.colReadonly)" />
            <RadioButton :model-value="'on'" value="off" disabled :size="size" :aria-label="t(s.colUncheckedDisabled)" />
            <RadioButton :model-value="'on'" value="on" disabled :size="size" :aria-label="t(s.colCheckedDisabled)" />
            <RadioButton :model-value="'on'" value="off" invalid :size="size" :aria-label="t(s.colInvalid)" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
