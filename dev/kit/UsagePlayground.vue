<script setup lang="ts">
import { computed, defineComponent, reactive, ref, type VNode } from "vue";
import { Code2, Copy, RotateCcw, SlidersHorizontal } from "lucide-vue-next";
import { Button, ColorPicker, InputNumber, InputText, Select, SelectButton, ToggleSwitch, useConfirm, useNotify } from "../../src";
import { attrName, entryCode, modelSuffix, valueKey } from "../usage/codegen";
import { entryRender } from "../usage/render";
import type { UsageControl, UsageEntry, UsageHost, UsageValues } from "../usage/types";
import CodeBlock from "./CodeBlock.vue";

const props = defineProps<{ entry: UsageEntry }>();

// inject 只能发生在 setup 期:宿主能力在这里取好,渲染期经 entryRender 传给 entry.render
const host: UsageHost = { confirm: useConfirm(), notify: useNotify() };

// 预览节点以函数组件包裹:纸/霜两格各自调用 entryRender,拿到独立 VNode 树
const Preview = defineComponent({
  props: { render: { type: Function, required: true } },
  setup: (p) => () => (p.render as () => VNode | VNode[])(),
});

const renderPreview = () => entryRender(props.entry, values, host);

function initialValues(entry: UsageEntry): UsageValues {
  const v: UsageValues = {};
  for (const c of entry.controls) v[valueKey(c)] = c.default;
  return v;
}

const values = reactive<UsageValues>(initialValues(props.entry));

const changed = computed(() => props.entry.controls.some((c) => values[valueKey(c)] !== c.default));

function reset() {
  Object.assign(values, initialValues(props.entry));
}

const showConfig = ref(false);
const showCode = ref(false);

const code = computed(() => entryCode(props.entry, values));

const copied = ref(false);
let copiedTimer: ReturnType<typeof setTimeout> | undefined;
async function copy() {
  try {
    await navigator.clipboard.writeText(code.value);
  } catch {
    return; // 剪贴板不可用(非安全上下文)静默失败,与 CodeBlock 同策略
  }
  copied.value = true;
  clearTimeout(copiedTimer);
  copiedTimer = setTimeout(() => (copied.value = false), 1600);
}

// ---- 配置控件绑定:UsageValues 是宽类型,按 kind 收敛为控件各自接受类型 ----
function enumOptions(c: UsageControl) {
  if (c.options) return c.options.map((o) => ({ ...o }));
  return (c.componentOptions ?? []).map((o) => ({ label: o.name, value: o.name }));
}

function textOf(c: UsageControl): string | null {
  const x = values[valueKey(c)];
  return x === undefined ? null : String(x);
}

function setText(c: UsageControl, x: string | null) {
  values[valueKey(c)] = x === null || x === "" ? undefined : x;
}

function numOf(c: UsageControl): number | null {
  const x = values[valueKey(c)];
  return typeof x === "number" ? x : null;
}

function setNum(c: UsageControl, x: number | null) {
  values[valueKey(c)] = x === null ? undefined : x;
}

function displayAttr(c: UsageControl): string {
  if (c.vmodel) return `v-model${modelSuffix(c)}="${valueKey(c)}"`;
  if (c.slot) return "插槽";
  const name = attrName(c);
  if (c.kind === "boolean" && values[valueKey(c)] === false && c.default !== false) return `:${name}="false"`;
  return name;
}
</script>

<template>
  <figure class="usage">
    <div class="usage__preview" :style="entry.minHeight ? { '--usage-min-h': entry.minHeight } : undefined">
      <div class="usage__cell">
        <span class="usage__label">{{ entry.flatPreview ? "纸面 · 当前主题（模态打开时铺满视口）" : "纸面 · 当前主题" }}</span>
        <Preview :render="renderPreview" />
      </div>
      <div v-if="!entry.flatPreview" class="usage__cell">
        <span class="usage__label">霜面 · 当前主题</span>
        <div class="usage__frost mw-frost">
          <Preview :render="renderPreview" />
        </div>
      </div>
    </div>

    <div class="usage__bar">
      <div class="usage__bar-group">
        <Button
          v-if="entry.controls.length"
          variant="text"
          severity="secondary"
          size="sm"
          :label="showConfig ? '收起配置' : '调整配置'"
          :icon="SlidersHorizontal"
          @click="showConfig = !showConfig"
        />
        <Button
          variant="text"
          severity="secondary"
          size="sm"
          label="重置"
          :icon="RotateCcw"
          :disabled="!changed"
          @click="reset"
        />
      </div>
      <div class="usage__bar-group">
        <Button variant="text" severity="secondary" size="sm" :label="copied ? '已复制' : '复制代码'" :icon="Copy" @click="copy" />
        <Button
          variant="text"
          severity="secondary"
          size="sm"
          :label="showCode ? '隐藏源码' : '查看源码'"
          :icon="Code2"
          @click="showCode = !showCode"
        />
      </div>
    </div>

    <div v-if="showConfig" class="usage__config">
      <div v-for="c in entry.controls" :key="c.prop" class="usage__field">
        <div class="usage__field-head">
          <span class="usage__field-label">{{ c.label }}</span>
          <code class="usage__field-attr">{{ displayAttr(c) }}</code>
        </div>
        <ToggleSwitch
          v-if="c.kind === 'boolean'"
          :model-value="Boolean(values[valueKey(c)])"
          :aria-label="c.label"
          @update:model-value="values[valueKey(c)] = $event"
        />
        <SelectButton
          v-else-if="c.kind === 'enum' && enumOptions(c).length <= 4"
          size="sm"
          :options="enumOptions(c)"
          option-label="label"
          option-value="value"
          :model-value="values[valueKey(c)]"
          :aria-label="c.label"
          @update:model-value="values[valueKey(c)] = $event"
        />
        <Select
          v-else-if="c.kind === 'enum'"
          size="sm"
          fluid
          :options="enumOptions(c)"
          option-label="label"
          option-value="value"
          :model-value="values[valueKey(c)]"
          :aria-label="c.label"
          placeholder="选择取值"
          @update:model-value="values[valueKey(c)] = $event"
        />
        <InputNumber
          v-else-if="c.kind === 'number'"
          size="sm"
          fluid
          :model-value="numOf(c)"
          :aria-label="c.label"
          @update:model-value="setNum(c, $event)"
        />
        <ColorPicker
          v-else-if="c.kind === 'color'"
          :model-value="textOf(c) ?? undefined"
          :aria-label="c.label"
          @update:model-value="values[valueKey(c)] = $event"
        />
        <InputText
          v-else
          size="sm"
          fluid
          :model-value="textOf(c)"
          :aria-label="c.label"
          placeholder="未设置"
          @update:model-value="setText(c, $event)"
        />
      </div>
    </div>

    <div v-if="showCode" class="usage__code">
      <CodeBlock :code="code" title="生成的代码" />
    </div>
  </figure>
</template>

<style scoped>
.usage {
  margin: 0;
  border: var(--border-width) solid var(--border-subtle);
  border-radius: var(--radius-card);
  overflow: hidden;
  background: var(--bg-surface);
}

/* 预览台:纸/霜双格,缝用发丝色垫底,横竖排都能出正确的分隔线 */
.usage__preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: var(--border-width);
  background: var(--border-subtle);
  --usage-min-h: 128px;
}

.usage__cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: var(--usage-min-h);
  padding: var(--space-8) var(--space-5) var(--space-5);
  background: var(--bg-surface);
  overflow: hidden;
}

.usage__frost {
  flex: 1;
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-5);
  border-radius: var(--radius-float);
}

.usage__label {
  position: absolute;
  top: var(--space-2-5);
  left: var(--space-3);
  color: var(--text-tertiary);
  font-size: var(--type-micro-size);
  line-height: var(--type-micro-line);
  font-weight: var(--weight-medium);
}

.usage__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
  border-top: var(--border-width) solid var(--border-subtle);
}

.usage__bar-group {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  min-width: 0;
}

.usage__config {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 210px), 1fr));
  gap: var(--space-3) var(--space-4);
  padding: var(--space-4);
  border-top: var(--border-width) solid var(--border-subtle);
  background: var(--bg-sunken);
}

.usage__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1-5);
}

.usage__field-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2);
  min-width: 0;
}

.usage__field-label {
  color: var(--text-secondary);
  font-size: var(--type-caption-size);
  font-weight: var(--weight-medium);
}

.usage__field-attr {
  overflow: hidden;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: var(--type-micro-size);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.usage__code {
  padding: var(--space-2);
  border-top: var(--border-width) solid var(--border-subtle);
}
</style>
