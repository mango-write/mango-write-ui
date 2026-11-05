<script setup lang="ts">
import { ref } from "vue";
import { InputNumber } from "../../../src";
import { api } from "../../api/entries/input-number";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/input-number";

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "需要格式化（千分位、货币、小数位）或边界钳制的数值。",
    en: "Numbers that need formatting (thousands separators, currency, decimals) or clamping to bounds.",
  },
  rule2: {
    zh: "步进按钮只在「微调」是主要操作时开启，例如每页条数。",
    en: "Show stepper buttons only when fine-tuning is the primary action, e.g. per-page counts.",
  },
  rule3: {
    zh: "连续范围的粗调用 <code>Slider</code>；编号、电话等「看起来像数字的文本」用 <code>InputText</code>。",
    en: "Coarse adjustment of a continuous range uses <code>Slider</code>; number-like text (IDs, phone numbers) uses <code>InputText</code>.",
  },
  buttonLayout: { zh: "按钮布局", en: "Button layout" },
  buttonLayoutDesc: {
    zh: "stacked 收在输入框内；horizontal / vertical 与输入框拼成一个整体，按钮底是半透明填充。",
    en: "stacked tucks the buttons inside the input; horizontal / vertical merge with the input into one piece with translucent button fills.",
  },
  wordsSuffix: { zh: " 字", en: " words" },
  sizes: { zh: "尺寸", en: "Sizes" },
  sizesDesc: {
    zh: "xs / sm / md / lg，默认跟随密度上下文。步进图标随档位缩放。",
    en: "xs / sm / md / lg, following the density context by default. Stepper icons scale with the tier.",
  },
  states: { zh: "状态", en: "States" },
  statesDesc: {
    zh: "到达边界时对应步进按钮禁用。",
    en: "The stepper button disables when the value reaches its bound.",
  },
  colEmpty: { zh: "空", en: "Empty" },
  colFilled: { zh: "有值", en: "Filled" },
  colAtMax: { zh: "到上限", en: "At max" },
  colDisabled: { zh: "禁用", en: "Disabled" },
  colReadonly: { zh: "只读", en: "Readonly" },
  colInvalid: { zh: "错误", en: "Invalid" },
  stateDefault: { zh: "默认", en: "Default" },
  countPlaceholder: { zh: "条数", en: "Count" },
  api: { zh: "接口", en: "API" },
} as const;

const words = ref<number | null>(3000);
const refs = ref<number | null>(40);
const ratio = ref<number | null>(0.25);
const price = ref<number | null>(199);
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
      </ul>
    </DocSection>

    <DocSection :title="s.buttonLayout" :desc="s.buttonLayoutDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <div class="doc-row">
          <InputNumber v-model="words" :min="0" :step="500" :suffix="t(s.wordsSuffix)" />
          <InputNumber v-model="refs" show-buttons :min="0" :max="200" />
          <InputNumber v-model="refs" show-buttons button-layout="horizontal" :min="0" :max="200" />
        </div>
        <div class="doc-row">
          <InputNumber v-model="refs" show-buttons button-layout="vertical" :min="0" :max="200" />
          <InputNumber v-model="price" mode="currency" currency="CNY" locale="zh-CN" show-clear />
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.sizes" :desc="s.sizesDesc">
      <Specimen themes="single" layout="stack">
        <div v-for="size in (['xs', 'sm', 'md', 'lg'] as const)" :key="size" class="doc-row">
          <span class="doc-note" style="width: 24px">{{ size }}</span>
          <InputNumber v-model="refs" :size="size" show-buttons />
          <InputNumber v-model="refs" :size="size" show-buttons button-layout="horizontal" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.states" :desc="s.statesDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colEmpty, s.colFilled, s.colAtMax, s.colDisabled, s.colReadonly, s.colInvalid]" label-width="48px">
          <StateRow :label="s.stateDefault">
            <InputNumber :model-value="null" :placeholder="t(s.countPlaceholder)" show-buttons />
            <InputNumber v-model="ratio" :max-fraction-digits="2" show-buttons :step="0.05" />
            <InputNumber :model-value="200" :max="200" show-buttons />
            <InputNumber :model-value="40" show-buttons disabled />
            <InputNumber :model-value="40" show-buttons readonly />
            <InputNumber :model-value="-3" show-buttons invalid />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
