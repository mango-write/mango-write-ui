<script setup lang="ts">
// 可搜索单选 — Element Plus 风格：收起态就是一个可输入的框，直接在框里打字
// 过滤，选中后框内显示所选项文字。不是「面板里另起一行搜索框」。
//
// 外形不自造 token，直接引用全局注入的 `--p-select-*` 变量（styled 模式下挂在
// :root），边框/圆角/聚焦光环/箭头列宽/选项行内边距与原生 Select 逐像素对齐。
// 面板用自管的 Teleport 浮层（见 useComboPanel），避免 PrimeVue Popover 在
// 「聚焦即输入过滤」场景下中途自我关闭。
//
// 输入框宽度按内容用一个隐藏镜像 span 量算（inputWidth），所以选中后字段直接缩到
// 文字宽度、不预留多余的输入空当；打字时随查询串增长。
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useComboPanel } from "../lib/useComboPanel";

const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    modelValue: unknown;
    options: readonly Record<string, unknown>[];
    optionLabel: string;
    optionValue?: string;
    placeholder?: string;
    showClear?: boolean;
    disabled?: boolean;
    size?: "small" | "large";
    emptyMessage?: string;
  }>(),
  {
    optionValue: undefined,
    placeholder: undefined,
    showClear: false,
    disabled: false,
    size: undefined,
    emptyMessage: undefined,
  },
);
const emit = defineEmits<{ (e: "update:modelValue", value: unknown): void; (e: "show"): void }>();

const emptyMessageText = computed(() => props.emptyMessage ?? t("common.select.noMatch"));

function labelOf(option: Record<string, unknown>): string {
  return String(option[props.optionLabel] ?? "");
}
function valueOf(option: Record<string, unknown>): unknown {
  return props.optionValue ? option[props.optionValue] : option;
}

const rootRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const mirrorRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const { open, panelStyle, openPanel, closePanel } = useComboPanel(rootRef, panelRef);

const typing = ref(false);
const query = ref("");
const activeIndex = ref(-1);
const inputWidth = ref(0);

const sizeClass = computed(() =>
  props.size === "small" ? "mw-ss-sm" : props.size === "large" ? "mw-ss-lg" : "mw-ss-md",
);

const selectedOption = computed<Record<string, unknown> | null>(() => {
  if (!props.optionValue) return (props.modelValue as Record<string, unknown> | null) ?? null;
  return props.options.find((o) => valueOf(o) === props.modelValue) ?? null;
});
const selectedLabel = computed(() => (selectedOption.value ? labelOf(selectedOption.value) : ""));
const filled = computed(() => selectedOption.value != null && selectedLabel.value !== "");

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q ? props.options.filter((o) => labelOf(o).toLowerCase().includes(q)) : [...props.options];
});

// 未打字时框内呈现所选项文字；打字时呈现查询串。
const inputValue = computed(() => (typing.value ? query.value : selectedLabel.value));
// 镜像文字：有内容量内容，否则量 placeholder（保证空态也能容纳提示语）。
const mirrorText = computed(() => inputValue.value || props.placeholder || "");

function measure() {
  if (mirrorRef.value) inputWidth.value = Math.ceil(mirrorRef.value.getBoundingClientRect().width) + 2;
}
onMounted(measure);
watch(mirrorText, () => nextTick(measure));

function reveal() {
  if (props.disabled || open.value) return;
  emit("show");
  activeIndex.value = filtered.value.findIndex((o) => valueOf(o) === props.modelValue);
  openPanel();
}
function dismiss() {
  closePanel();
  typing.value = false;
  query.value = "";
}

function onFocus() {
  reveal();
  nextTick(() => inputRef.value?.select());
}
function onInput(event: Event) {
  typing.value = true;
  query.value = (event.target as HTMLInputElement).value;
  reveal();
  activeIndex.value = filtered.value.length ? 0 : -1;
}
function onFieldMousedown(event: MouseEvent) {
  if (open.value) {
    event.preventDefault();
    dismiss();
    inputRef.value?.blur();
  }
}
function selectOption(option: Record<string, unknown>) {
  emit("update:modelValue", valueOf(option));
  dismiss();
  inputRef.value?.blur();
}
function clear(event: Event) {
  event.stopPropagation();
  emit("update:modelValue", null);
  typing.value = false;
  query.value = "";
  inputRef.value?.focus();
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (!open.value) return reveal();
    activeIndex.value = Math.min(activeIndex.value + 1, filtered.value.length - 1);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    activeIndex.value = Math.max(activeIndex.value - 1, 0);
  } else if (event.key === "Enter") {
    event.preventDefault();
    const option = filtered.value[activeIndex.value] ?? filtered.value[0];
    if (option) selectOption(option);
  } else if (event.key === "Escape") {
    if (open.value) {
      event.stopPropagation();
      dismiss();
    }
  }
}
</script>

<template>
  <div
    ref="rootRef"
    class="mw-ss"
    :class="[sizeClass, { 'mw-ss-focus': open, 'mw-ss-disabled': disabled }]"
    @mousedown="onFieldMousedown"
    @click="!open && inputRef?.focus()"
  >
    <div class="mw-ss-field">
      <input
        ref="inputRef"
        class="mw-ss-input"
        :class="{ 'mw-ss-placeholder': !filled && !typing }"
        :style="{ width: inputWidth ? inputWidth + 'px' : undefined }"
        :value="inputValue"
        :placeholder="placeholder"
        :disabled="disabled"
        type="text"
        autocomplete="off"
        spellcheck="false"
        @focus="onFocus"
        @input="onInput"
        @keydown="onKeydown"
      />
      <span ref="mirrorRef" class="mw-ss-mirror" aria-hidden="true">{{ mirrorText }}</span>
    </div>
    <span
      v-if="showClear && filled && !disabled"
      class="mw-ss-clear"
      @mousedown.stop.prevent
      @click="clear"
    >
      <i class="pi pi-times" />
    </span>
    <span class="mw-ss-dropdown"><i class="pi pi-chevron-down" /></span>

    <Teleport to="body">
      <ul v-if="open" ref="panelRef" class="mw-ss-overlay" :style="panelStyle">
        <li
          v-for="(option, i) in filtered"
          :key="labelOf(option)"
          class="mw-ss-option"
          :class="{
            'mw-ss-option-selected': valueOf(option) === modelValue,
            'mw-ss-option-active': i === activeIndex,
          }"
          @mousedown.prevent="selectOption(option)"
          @mousemove="activeIndex = i"
        >
          {{ labelOf(option) }}
        </li>
        <li v-if="!filtered.length" class="mw-ss-empty">{{ emptyMessageText }}</li>
      </ul>
    </Teleport>
  </div>
</template>

<style scoped>
/* ── Field — mirrors .p-select geometry via the global --p-select-* tokens ──
   颜色不走 --p-* 间接引用：PrimeVue 的组件 token 按需注入（页面没挂过该组件时
   变量不存在，会落进浅色兜底，深色下就是白块），直接用 var.css token + 仿玻璃
   字段配方（与 primevue-theme.css 的 .p-inputtext 族逐项一致）。几何 token
   （padding/radius/宽度）与主题无关，保留 --p-* 引用。 */
.mw-ss {
  position: relative;
  display: inline-flex;
  align-items: stretch;
  /* Hug content (value + chevron) so the field shrinks to its minimum after a
     selection instead of reserving slack. `fit-content` is a definite width, so
     a flex parent's `align-items: stretch` won't blow it back out to full width. */
  width: fit-content;
  max-width: 100%;
  cursor: text;
  background-color: var(--color-surface-base);
  background-image: var(--material-control-face);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--p-select-border-radius, var(--radius));
  box-shadow: var(--material-control-inset);
  transition:
    border-color 0.18s,
    box-shadow 0.18s,
    outline-color 0.18s;
  outline: 3px solid transparent;
  outline-offset: 0;
}
.mw-ss:not(.mw-ss-disabled):hover {
  border-color: var(--color-border-strong);
}
.mw-ss-focus {
  border-color: var(--color-brand-500);
  outline-color: rgb(var(--color-brand-500-rgb) / 0.18);
}
.mw-ss-disabled {
  opacity: var(--p-disabled-opacity, 0.6);
  cursor: default;
  background: var(--color-bg-soft);
}

/* Field text column — hugs the input's content width (no reserved slack). */
.mw-ss-field {
  position: relative;
  flex: 0 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  padding: var(--p-select-padding-y, 0.375rem) 0
    var(--p-select-padding-y, 0.375rem) var(--p-select-padding-x, 0.625rem);
}
.mw-ss-input {
  min-width: 1.5rem;
  max-width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.25;
  padding: 0;
  text-overflow: ellipsis;
  cursor: text;
}
.mw-ss-input::placeholder {
  color: var(--color-text-tertiary);
  opacity: 1;
}
.mw-ss-disabled .mw-ss-input {
  cursor: default;
}
/* Hidden width probe — same font metrics as the input. */
.mw-ss-mirror {
  position: absolute;
  left: 0;
  top: 0;
  visibility: hidden;
  pointer-events: none;
  white-space: pre;
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.25;
}

/* Chevron column — same 2rem width + 0.75rem glyph as .p-select-dropdown. */
.mw-ss-dropdown {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: var(--p-select-dropdown-width, 2rem);
  color: var(--color-text-tertiary);
}
.mw-ss-dropdown .pi {
  font-size: 0.75rem;
}

/* Clear — a round hit-target with a clear hover state (design 3.3). */
.mw-ss-clear {
  align-self: center;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: var(--radius-pill, 999px);
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
}
.mw-ss-clear:hover {
  background: var(--color-surface-muted);
  color: var(--color-text-primary);
}
.mw-ss-clear .pi {
  font-size: 0.6875rem;
}

/* ── Size ramp — matches formField sm/lg tokens ── */
.mw-ss-sm .mw-ss-field {
  padding: 0.292em 0 0.292em 0.5rem;
}
.mw-ss-sm .mw-ss-input,
.mw-ss-sm .mw-ss-mirror {
  font-size: var(--p-select-sm-font-size, 0.75rem);
}
.mw-ss-sm .mw-ss-dropdown {
  width: 1.75rem;
}
.mw-ss-lg .mw-ss-field {
  padding: 0.5rem 0 0.5rem 0.75rem;
}
.mw-ss-lg .mw-ss-input,
.mw-ss-lg .mw-ss-mirror {
  font-size: var(--p-select-lg-font-size, 1rem);
}
</style>

<style>
/* Panel — teleported to <body>, styled to read as a .p-select overlay. */
.mw-ss-overlay {
  margin: 0;
  padding: var(--p-select-list-padding, 0.25rem);
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--p-select-list-gap, 2px);
  max-height: 15rem;
  overflow-y: auto;
  /* 真玻璃（浮层档）：配方与 .mw-glass 一致，见 styles.css 的 Material 节。
     这块是自绘浮层（不是 PrimeVue 的 .p-*-overlay），所以在这里显式声明。 */
  background-color: var(--material-scrim);
  background-image: var(--material-specular);
  -webkit-backdrop-filter: var(--material-blur);
  backdrop-filter: var(--material-blur);
  border: 1px solid var(--material-hairline);
  border-radius: var(--p-select-overlay-border-radius, var(--radius));
  box-shadow: var(--material-lens), var(--material-glass-shadow);
}
.mw-ss-overlay .mw-ss-option {
  padding: var(--p-select-option-padding, 0.375rem 0.625rem);
  border-radius: var(--p-select-option-border-radius, var(--radius-sm));
  color: var(--color-text-primary);
  font-size: 0.875rem;
  line-height: 1.25;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* 玻璃面上的行态一律半透明——实心底色会把材质打断。inlay 是白叠层，浅色下压在
   近白的玻璃面板上读不出来，行态走随 mode 翻转的 --material-hover。 */
.mw-ss-overlay .mw-ss-option-active:not(.mw-ss-option-selected) {
  background: var(--material-hover);
}
.mw-ss-overlay .mw-ss-option-selected {
  background: rgb(var(--color-brand-500-rgb) / 0.16);
  color: var(--color-brand-700);
}
.mw-ss-overlay .mw-ss-empty {
  padding: var(--p-select-empty-message-padding, 0.375rem 0.625rem);
  color: var(--color-text-tertiary);
  font-size: 0.875rem;
}
</style>
