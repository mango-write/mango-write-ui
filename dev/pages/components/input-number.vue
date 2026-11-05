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

const words = ref<number | null>(3000);
const refs = ref<number | null>(40);
const ratio = ref<number | null>(0.25);
const price = ref<number | null>(199);
</script>

<template>
  <DocPage lead="输入数值：字数上限、参考文献条数、比例、金额。按区间钳制，清空归 null，绝不静默产出 0。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">需要格式化（千分位、货币、小数位）或边界钳制的数值。</li>
        <li data-kind="do">步进按钮只在「微调」是主要操作时开启，例如每页条数。</li>
        <li data-kind="dont">连续范围的粗调用 <code>Slider</code>；编号、电话等「看起来像数字的文本」用 <code>InputText</code>。</li>
      </ul>
    </DocSection>

    <DocSection title="按钮布局" desc="stacked 收在输入框内；horizontal / vertical 与输入框拼成一个整体，按钮底是半透明填充。">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <div class="doc-row">
          <InputNumber v-model="words" :min="0" :step="500" suffix=" 字" />
          <InputNumber v-model="refs" show-buttons :min="0" :max="200" />
          <InputNumber v-model="refs" show-buttons button-layout="horizontal" :min="0" :max="200" />
        </div>
        <div class="doc-row">
          <InputNumber v-model="refs" show-buttons button-layout="vertical" :min="0" :max="200" />
          <InputNumber v-model="price" mode="currency" currency="CNY" locale="zh-CN" show-clear />
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="尺寸" desc="xs / sm / md / lg，默认跟随密度上下文。步进图标随档位缩放。">
      <Specimen themes="single" layout="stack">
        <div v-for="s in (['xs', 'sm', 'md', 'lg'] as const)" :key="s" class="doc-row">
          <span class="doc-note" style="width: 24px">{{ s }}</span>
          <InputNumber v-model="refs" :size="s" show-buttons />
          <InputNumber v-model="refs" :size="s" show-buttons button-layout="horizontal" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="状态" desc="到达边界时对应步进按钮禁用。">
      <Specimen themes="both">
        <StateGrid :columns="['空', '有值', '到上限', '禁用', '只读', '错误']" label-width="48px">
          <StateRow label="默认">
            <InputNumber :model-value="null" placeholder="条数" show-buttons />
            <InputNumber v-model="ratio" :max-fraction-digits="2" show-buttons :step="0.05" />
            <InputNumber :model-value="200" :max="200" show-buttons />
            <InputNumber :model-value="40" show-buttons disabled />
            <InputNumber :model-value="40" show-buttons readonly />
            <InputNumber :model-value="-3" show-buttons invalid />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
