<script setup lang="ts">
import { computed, ref } from "vue";
import { Checkbox } from "../../../src";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const syncBib = ref(true);
const includeNotes = ref(false);
const exportParts = ref<string[]>(["abstract", "references"]);
const partOptions = [
  { label: "摘要与关键词", value: "abstract" },
  { label: "正文与图表", value: "body" },
  { label: "参考文献与附录", value: "references" },
];

const allSelected = computed(() => exportParts.value.length === partOptions.length);
const isIndeterminate = computed(
  () => exportParts.value.length > 0 && exportParts.value.length < partOptions.length,
);

function toggleAll(checked: boolean) {
  exportParts.value = checked ? partOptions.map((o) => o.value) : [];
}
</script>

<template>
  <DocPage lead="复选框：在布尔开关或一组互不排斥的选项中勾选。未选态保持控件面与强边框，选中与半选态切换为品牌实心底与反白勾线。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">在表单或配置面板中勾选一或多个独立选项，或用 <code>binary</code> 表达需点击「保存」才生效的布尔项。</li>
        <li data-kind="do">在树或表格表头配合 <code>indeterminate</code> 表达「子项部分选中」。</li>
        <li data-kind="dont">拨动即刻生效的系统开关用 <code>ToggleSwitch</code>；多选一的互斥项用 <code>RadioButton</code> 或 <code>SelectButton</code>。</li>
        <li data-kind="dont">候选超过 6 项且空间紧凑时改用 <code>MultiSelect</code> 或 <code>SearchableMultiSelect</code>。</li>
      </ul>
    </DocSection>

    <DocSection title="底面" desc="纸面与霜面并排。未选框体复用 --control-bg 与 --border-strong，在半透明霜面上同样清晰。">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <div class="doc-row">
          <label class="doc-row" style="gap: var(--space-2); cursor: pointer">
            <Checkbox v-model="syncBib" binary />
            <span>自动同步题录元数据</span>
          </label>
          <label class="doc-row" style="gap: var(--space-2); cursor: pointer">
            <Checkbox v-model="includeNotes" binary />
            <span>导出时附带页边批注</span>
          </label>
        </div>
        <div class="doc-row">
          <label class="doc-row" style="gap: var(--space-2); cursor: pointer">
            <Checkbox
              :model-value="allSelected"
              :indeterminate="isIndeterminate"
              binary
              @update:model-value="toggleAll"
            />
            <span>全选章节</span>
          </label>
          <label
            v-for="item in partOptions"
            :key="item.value"
            class="doc-row"
            style="gap: var(--space-2); cursor: pointer"
          >
            <Checkbox v-model="exportParts" :value="item.value" />
            <span>{{ item.label }}</span>
          </label>
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="尺寸" desc="sm / md / lg 三档，默认 md。盒体边长对应 --icon-sm / --icon-md / --icon-lg。">
      <Specimen themes="single" layout="stack">
        <div v-for="s in (['sm', 'md', 'lg'] as const)" :key="s" class="doc-row">
          <span class="doc-note" style="width: 24px">{{ s }}</span>
          <Checkbox :model-value="false" binary :size="s" :aria-label="`${s} 未选`" />
          <Checkbox :model-value="true" binary :size="s" :aria-label="`${s} 已选`" />
          <Checkbox :model-value="false" indeterminate binary :size="s" :aria-label="`${s} 半选`" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="状态" desc="支持空格键切换；聚焦呈现品牌色外环，错误态描边切换为 --danger。">
      <Specimen themes="both">
        <StateGrid :columns="['未选', '已选', '半选', '只读', '未选禁用', '已选禁用', '错误']" label-width="48px">
          <StateRow v-for="s in (['sm', 'md', 'lg'] as const)" :key="s" :label="s">
            <Checkbox :model-value="false" binary :size="s" aria-label="未选" />
            <Checkbox :model-value="true" binary :size="s" aria-label="已选" />
            <Checkbox :model-value="false" indeterminate binary :size="s" aria-label="半选" />
            <Checkbox :model-value="true" binary readonly :size="s" aria-label="只读" />
            <Checkbox :model-value="false" binary disabled :size="s" aria-label="未选禁用" />
            <Checkbox :model-value="true" binary disabled :size="s" aria-label="已选禁用" />
            <Checkbox :model-value="false" binary invalid :size="s" aria-label="错误" />
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
          <tr><td><code>modelValue</code></td><td><code>any | any[]</code></td><td>绑定值；传数组且未开启 <code>binary</code> 时按集合模式增删 <code>value</code></td></tr>
          <tr><td><code>value</code></td><td><code>any</code></td><td>数组模式下的当前项值</td></tr>
          <tr><td><code>binary</code></td><td><code>boolean</code></td><td>单一布尔模式，在 <code>trueValue</code> 与 <code>falseValue</code> 间切换</td></tr>
          <tr><td><code>indeterminate</code></td><td><code>boolean</code></td><td>半选态（<code>aria-checked="mixed"</code>），点击后进入选中态</td></tr>
          <tr><td><code>size</code></td><td><code>sm · md · lg</code></td><td>尺寸档位，默认 <code>md</code></td></tr>
          <tr><td><code>disabled</code> / <code>readonly</code> / <code>invalid</code></td><td><code>boolean</code></td><td>禁用、只读与校验失败态</td></tr>
        </tbody>
      </table>
    </DocSection>
  </DocPage>
</template>
