<script setup lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, reactive, ref, watch, type VNode } from "vue";
import { Code2, Copy, RotateCcw, SlidersHorizontal } from "lucide-vue-next";
import {
  Button,
  ColorPicker,
  InputNumber,
  InputText,
  Select,
  SelectButton,
  ToggleSwitch,
  useConfirm,
  useNotify,
  useThemePreference,
} from "@mango-write/ui-vue";
import { FRAMEWORK_OPTIONS, desktopFramework, setDesktopFramework } from "../framework";
import { locale, t } from "../i18n";
import {
  attrName,
  entryCode,
  entryReactCode,
  modelSuffix,
  reactDisplayAttr,
  valueKey,
} from "../usage/codegen";
import { entryRender } from "../usage/render";
import type { UsageControl, UsageEntry, UsageHost, UsageValue, UsageValues } from "../usage/types";
import CodeBlock from "./CodeBlock.vue";

const props = defineProps<{ entry: UsageEntry }>();

const s = {
  paperModal: {
    zh: "纸面 · 当前主题（模态打开时在预览区内展开）",
    en: "Paper · Current theme (expands when modal opens)",
  },
  paper: { zh: "纸面 · 当前主题", en: "Paper · Current theme" },
  frost: { zh: "霜面 · 当前主题", en: "Frost · Current theme" },
  frameworkSwitch: { zh: "切换预览与代码框架", en: "Switch preview and code framework" },
  hideConfig: { zh: "收起配置", en: "Hide controls" },
  showConfig: { zh: "调整配置", en: "Customize" },
  reset: { zh: "重置", en: "Reset" },
  copied: { zh: "已复制", en: "Copied" },
  copyCode: { zh: "复制代码", en: "Copy code" },
  hideCode: { zh: "隐藏源码", en: "Hide code" },
  viewCode: { zh: "查看源码", en: "View code" },
  slot: { zh: "插槽", en: "slot" },
  selectPlaceholder: { zh: "选择取值", en: "Select value" },
  unsetPlaceholder: { zh: "未设置", en: "Unset" },
  generatedVue: { zh: "生成的 Vue SFC", en: "Generated Vue SFC" },
  generatedReact: { zh: "生成的 React TSX", en: "Generated React TSX" },
  reactPaperTitle: { zh: "React 纸面实时预览", en: "React paper live preview" },
  reactFrostTitle: { zh: "React 霜面实时预览", en: "React frost live preview" },
} as const;

// inject 只能发生在 setup 期:宿主能力在这里取好,渲染期经 entryRender 传给 entry.render
const host: UsageHost = { confirm: useConfirm(), notify: useNotify() };
const { resolved: themeResolved } = useThemePreference();

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

watch(
  () => props.entry,
  (nextEntry) => {
    for (const k of Object.keys(values)) delete values[k];
    Object.assign(values, initialValues(nextEntry));
  },
);

const changed = computed(() => props.entry.controls.some((c) => values[valueKey(c)] !== c.default));

function reset() {
  Object.assign(values, initialValues(props.entry));
}

const showConfig = ref(false);
const showCode = ref(false);

const code = computed(() =>
  desktopFramework.value === "react"
    ? entryReactCode(props.entry, values)
    : entryCode(props.entry, values),
);

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

// ---- React 沙箱桥接:同构隔离渲染 @mango-write/ui-react,经 postMessage 同步状态与高度 ----
const paperFrame = ref<HTMLIFrameElement | null>(null);
const frostFrame = ref<HTMLIFrameElement | null>(null);

function parseMinHeightPx(minHeight?: string): number {
  if (!minHeight) return 128;
  const parsed = Number.parseInt(minHeight, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 128;
}

const minHeightPx = computed(() => parseMinHeightPx(props.entry.minHeight));
const paperHeight = ref(minHeightPx.value);
const frostHeight = ref(minHeightPx.value);

watch(
  () => props.entry.slug,
  () => {
    paperHeight.value = minHeightPx.value;
    frostHeight.value = minHeightPx.value;
  },
);

const effectiveIframeHeight = computed(() =>
  props.entry.flatPreview
    ? Math.max(minHeightPx.value, paperHeight.value)
    : Math.max(minHeightPx.value, paperHeight.value, frostHeight.value),
);

// src 仅随组件 entry 或框架切换重建,主题/语言/属性变更走 postMessage 无刷同步
const iframeInitParams = ref({ theme: themeResolved.value, locale: locale.value });
watch(
  [() => props.entry.slug, desktopFramework],
  () => {
    iframeInitParams.value = { theme: themeResolved.value, locale: locale.value };
  },
);

function buildIframeSrc(surface: "paper" | "frost", slug: string): string {
  const q = new URLSearchParams({
    entry: slug,
    surface,
    theme: iframeInitParams.value.theme,
    locale: iframeInitParams.value.locale,
  });
  return `/react.html?${q.toString()}`;
}

const paperSrc = computed(() => buildIframeSrc("paper", props.entry.slug));
const frostSrc = computed(() => buildIframeSrc("frost", props.entry.slug));

function plainValuesSnapshot(): Record<string, UsageValue> {
  const out: Record<string, UsageValue> = {};
  for (const [k, v] of Object.entries(values)) {
    if (v === undefined || typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      out[k] = v;
    }
  }
  return out;
}

function postSyncToWindow(target: Window | null | undefined) {
  if (!target) return;
  target.postMessage(
    {
      type: "mw-react-usage-sync",
      entry: props.entry.slug,
      values: plainValuesSnapshot(),
      theme: themeResolved.value,
      locale: locale.value,
    },
    "*",
  );
}

function syncAllFrames() {
  if (desktopFramework.value !== "react") return;
  postSyncToWindow(paperFrame.value?.contentWindow);
  postSyncToWindow(frostFrame.value?.contentWindow);
}

watch(
  [() => plainValuesSnapshot(), themeResolved, locale, desktopFramework],
  () => {
    syncAllFrames();
  },
  { deep: true },
);

function onWindowMessage(event: MessageEvent) {
  const isPaper = Boolean(paperFrame.value && event.source === paperFrame.value.contentWindow);
  const isFrost = Boolean(frostFrame.value && event.source === frostFrame.value.contentWindow);
  if (!isPaper && !isFrost) return;

  const data = event.data as Record<string, unknown> | null;
  if (!data || typeof data !== "object") return;
  if (data.entry && data.entry !== props.entry.slug) return;

  if (data.type === "mw-react-usage-ready") {
    postSyncToWindow(event.source as Window);
    return;
  }

  if (data.type === "mw-react-usage-value" && typeof data.key === "string") {
    const nextVal = data.value as UsageValue;
    if (values[data.key] !== nextVal) {
      values[data.key] = nextVal;
    }
    return;
  }

  if (data.type === "mw-react-usage-resize" && typeof data.height === "number") {
    const h = Math.max(minHeightPx.value, Math.ceil(data.height));
    if (isPaper) paperHeight.value = h;
    if (isFrost) frostHeight.value = h;
  }
}

onMounted(() => window.addEventListener("message", onWindowMessage));
onUnmounted(() => window.removeEventListener("message", onWindowMessage));

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
  if (desktopFramework.value === "react") {
    return reactDisplayAttr(c, props.entry.tag, values);
  }
  if (c.vmodel) return `v-model${modelSuffix(c)}="${valueKey(c)}"`;
  if (c.slot) return t(s.slot);
  const name = attrName(c);
  if (c.kind === "boolean" && values[valueKey(c)] === false && c.default !== false) return `:${name}="false"`;
  return name;
}
</script>

<template>
  <figure class="usage">
    <div class="usage__preview" :style="entry.minHeight ? { '--usage-min-h': entry.minHeight } : undefined">
      <template v-if="desktopFramework === 'vue'">
        <div class="usage__cell">
          <span class="usage__label">{{ entry.flatPreview ? t(s.paperModal) : t(s.paper) }}</span>
          <Preview :render="renderPreview" />
        </div>
        <div v-if="!entry.flatPreview" class="usage__cell">
          <span class="usage__label">{{ t(s.frost) }}</span>
          <div class="usage__frost mw-frost">
            <Preview :render="renderPreview" />
          </div>
        </div>
      </template>

      <template v-else>
        <div class="usage__cell usage__cell--iframe">
          <span class="usage__label">{{ entry.flatPreview ? t(s.paperModal) : t(s.paper) }}</span>
          <iframe
            ref="paperFrame"
            class="usage__iframe"
            :src="paperSrc"
            :title="`${entry.tag} · ${t(s.reactPaperTitle)}`"
            :style="{ height: `${effectiveIframeHeight}px` }"
          />
        </div>
        <div v-if="!entry.flatPreview" class="usage__cell usage__cell--iframe">
          <span class="usage__label">{{ t(s.frost) }}</span>
          <iframe
            ref="frostFrame"
            class="usage__iframe"
            :src="frostSrc"
            :title="`${entry.tag} · ${t(s.reactFrostTitle)}`"
            :style="{ height: `${effectiveIframeHeight}px` }"
          />
        </div>
      </template>
    </div>

    <div class="usage__bar">
      <div class="usage__bar-group">
        <div class="usage__fw" role="group" :aria-label="t(s.frameworkSwitch)">
          <button
            v-for="opt in FRAMEWORK_OPTIONS"
            :key="opt.value"
            type="button"
            class="usage__fw-btn"
            :class="{ 'is-active': desktopFramework === opt.value }"
            :aria-pressed="desktopFramework === opt.value"
            @click="setDesktopFramework(opt.value)"
          >{{ opt.label }}</button>
        </div>
        <Button
          v-if="entry.controls.length"
          variant="text"
          severity="secondary"
          size="sm"
          :label="showConfig ? t(s.hideConfig) : t(s.showConfig)"
          :icon="SlidersHorizontal"
          @click="showConfig = !showConfig"
        />
        <Button
          variant="text"
          severity="secondary"
          size="sm"
          :label="t(s.reset)"
          :icon="RotateCcw"
          :disabled="!changed"
          @click="reset"
        />
      </div>
      <div class="usage__bar-group">
        <Button
          variant="text"
          severity="secondary"
          size="sm"
          :label="copied ? t(s.copied) : t(s.copyCode)"
          :icon="Copy"
          @click="copy"
        />
        <Button
          variant="text"
          severity="secondary"
          size="sm"
          :label="showCode ? t(s.hideCode) : t(s.viewCode)"
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
          :placeholder="t(s.selectPlaceholder)"
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
          :placeholder="t(s.unsetPlaceholder)"
          @update:model-value="setText(c, $event)"
        />
      </div>
    </div>

    <div v-if="showCode" class="usage__code">
      <CodeBlock
        :code="code"
        :title="desktopFramework === 'react' ? t(s.generatedReact) : t(s.generatedVue)"
      />
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

.usage__cell--iframe {
  padding: 0;
  align-items: stretch;
}

.usage__iframe {
  display: block;
  width: 100%;
  min-height: var(--usage-min-h);
  border: 0;
  background: transparent;
  transition: height var(--duration-fast) var(--ease-standard);
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
  z-index: 2;
  pointer-events: none;
  color: var(--text-tertiary);
  font-size: var(--type-micro-size);
  line-height: var(--type-micro-line);
  font-weight: var(--weight-medium);
}

.usage__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
  border-top: var(--border-width) solid var(--border-subtle);
}

.usage__bar-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-1);
  min-width: 0;
}

.usage__fw {
  display: inline-flex;
  align-items: center;
  gap: var(--space-0-5);
  height: var(--size-xs-h, 24px);
  padding: var(--space-0-5);
  margin-right: var(--space-1);
  border: var(--border-width) solid var(--border-subtle);
  border-radius: var(--radius-full);
  background: var(--fill-default);
}

.usage__fw-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 var(--space-2);
  border: none;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--text-secondary);
  font-family: inherit;
  font-size: var(--type-micro-size);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition:
    color var(--duration-fast) var(--ease-standard),
    background-color var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard);
}

.usage__fw-btn:hover {
  color: var(--text-primary);
}

.usage__fw-btn.is-active {
  background: var(--bg-elevated);
  color: var(--text-primary);
  font-weight: var(--weight-semibold);
  box-shadow: var(--shadow-xs);
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
