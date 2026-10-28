<script setup lang="ts">
// 可搜索多选 — Element Plus 风格：选中项以 chip 摆在框内，直接在框里打字过滤，
// 面板里只放过滤后的选项（点击行即勾/取消，选中态用高亮，不用 checkbox，也没有
// 「全选」）。
//
// 三个关键点：
// 1）外形与原生 MultiSelect 逐像素对齐——不自造 token，直接引用全局 --p-multiselect-*
//    变量（styled 模式下挂在 :root），chip 复用 .p-chip 的几何，箭头列/边框/圆角
//    /聚焦光环全部一致。
// 2）chip 折叠是「按可用宽度动态计算」（参考 element-plus el-select 的 calcCollapse
//    思路）：用一层隐藏的量算行测每个 chip 的真实宽度，再按容器宽度决定显示几个，
//    放不下的收进 "+N"，而不是固定只显示 1 个、后面留大片空白。
// 3）面板用自管的 Teleport 浮层（见 useComboPanel），避免 PrimeVue Popover 在
//    「聚焦即输入过滤」场景下中途自我关闭。
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useComboPanel } from "../lib/useComboPanel";

const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    modelValue: unknown[];
    options: readonly Record<string, unknown>[];
    optionLabel: string;
    optionValue?: string;
    // 自定义过滤谓词（收到的是小写查询串）；缺省保持按 optionLabel 子串匹配。
    optionFilter?: (option: Record<string, unknown>, query: string) => boolean;
    inputId?: string;
    ariaLabel?: string;
    ariaLabelledby?: string;
    ariaDescribedby?: string;
    placeholder?: string;
    disabled?: boolean;
    invalid?: boolean;
    required?: boolean;
    size?: "small" | "large";
    emptyMessage?: string;
  }>(),
  {
    optionValue: undefined,
    optionFilter: undefined,
    inputId: undefined,
    ariaLabel: undefined,
    ariaLabelledby: undefined,
    ariaDescribedby: undefined,
    placeholder: undefined,
    disabled: false,
    invalid: false,
    required: false,
    size: undefined,
    emptyMessage: undefined,
  },
);
const emit = defineEmits<{
  (e: "update:modelValue", value: unknown[]): void;
  (e: "show"): void;
}>();

const emptyMessageText = computed(() => props.emptyMessage ?? t("common.select.noMatch"));

function labelOf(option: Record<string, unknown>): string {
  return String(option[props.optionLabel] ?? "");
}
function valueOf(option: Record<string, unknown>): unknown {
  return props.optionValue ? option[props.optionValue] : option;
}
function isSelected(option: Record<string, unknown>): boolean {
  return props.modelValue.includes(valueOf(option));
}

const rootRef = ref<HTMLElement | null>(null);
const labelRef = ref<HTMLElement | null>(null);
const measureRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const { open, panelStyle, openPanel, closePanel, reposition } = useComboPanel(rootRef, panelRef);

const generatedId = useId();
const fieldId = computed(() => props.inputId ?? `mw-ms-${generatedId}`);
const listboxId = computed(() => `${fieldId.value}-listbox`);
const optionId = (index: number) => `${listboxId.value}-option-${index}`;

const query = ref("");
const activeIndex = ref(-1);
const visibleCount = ref(props.modelValue.length);

const sizeClass = computed(() =>
  props.size === "small" ? "mw-ms-sm" : props.size === "large" ? "mw-ms-lg" : "mw-ms-md",
);

const selectedOptions = computed(() => props.options.filter((o) => isSelected(o)));
const selectedLabels = computed(() => selectedOptions.value.map((o) => labelOf(o)));
const hasSelection = computed(() => selectedLabels.value.length > 0);

const visibleLabels = computed(() => selectedLabels.value.slice(0, visibleCount.value));
// 供 chip 插槽使用的可见项（与 visibleLabels 同序同长）
const visibleOptions = computed(() => selectedOptions.value.slice(0, visibleCount.value));
const overflowCount = computed(() => selectedLabels.value.length - visibleLabels.value.length);

const filteredOptions = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return props.options;
  return props.optionFilter
    ? props.options.filter((o) => props.optionFilter!(o, q))
    : props.options.filter((o) => labelOf(o).toLowerCase().includes(q));
});

// ── 动态折叠：量算隐藏行里每个 chip 的宽度，按容器可用宽度决定 visibleCount ──
const INPUT_MIN = 24; // 至少给输入光标留出的宽度
const PLUS_RESERVE = 42; // "+N" chip 的预留宽度（含前置 gap）

function recalc() {
  const total = selectedLabels.value.length;
  if (total === 0) {
    visibleCount.value = 0;
    return;
  }
  const label = labelRef.value;
  const measure = measureRef.value;
  if (!label || !measure) {
    visibleCount.value = total;
    return;
  }
  const style = getComputedStyle(label);
  const gap = parseFloat(style.columnGap || style.gap || "0") || 0;
  const padX = parseFloat(style.paddingLeft || "0") + parseFloat(style.paddingRight || "0");
  const avail = label.clientWidth - padX;
  const widths = Array.from(measure.children).map((el) => (el as HTMLElement).offsetWidth);

  const totalWidth = widths.reduce((a, w) => a + w, 0) + gap * (total - 1);
  if (totalWidth + gap + INPUT_MIN <= avail) {
    visibleCount.value = total; // 全放得下，不折叠
    return;
  }
  let used = 0;
  let count = 0;
  for (let i = 0; i < total; i++) {
    const add = (count > 0 ? gap : 0) + widths[i];
    if (used + add + gap + PLUS_RESERVE + INPUT_MIN <= avail) {
      used += add;
      count++;
    } else {
      break;
    }
  }
  visibleCount.value = Math.max(count, 1);
}

let ro: ResizeObserver | null = null;
onMounted(() => {
  ro = new ResizeObserver(() => recalc());
  if (rootRef.value) ro.observe(rootRef.value);
  nextTick(recalc);
});
onBeforeUnmount(() => ro?.disconnect());
watch(selectedLabels, () => nextTick(recalc), { flush: "post" });

function scrollActiveIntoView() {
  nextTick(() => {
    const option = panelRef.value?.querySelectorAll<HTMLElement>('[role="option"]')[activeIndex.value];
    option?.scrollIntoView?.({ block: "nearest" });
  });
}
watch(activeIndex, scrollActiveIntoView);

// ── open / close ──
function reveal() {
  if (props.disabled || open.value) return;
  emit("show");
  activeIndex.value = filteredOptions.value.length ? 0 : -1;
  openPanel();
  nextTick(() => inputRef.value?.focus());
}
function dismiss() {
  closePanel();
  query.value = "";
  activeIndex.value = -1;
}
// 宽度受限时，选满后继续输入会让标签行横向滚动把 chip 顶出视野；失焦时清空查询
// 并把滚动位置复原，让 chip 从头显示。
function onBlur() {
  query.value = "";
  if (labelRef.value) labelRef.value.scrollLeft = 0;
  nextTick(recalc);
}
function onInput() {
  if (!open.value) reveal();
  activeIndex.value = filteredOptions.value.length ? 0 : -1;
}
function onFieldMousedown(event: MouseEvent) {
  const t = event.target as HTMLElement;
  if (open.value && (t === rootRef.value || t === labelRef.value || t.closest(".mw-ms-dropdown"))) {
    event.preventDefault();
    dismiss();
    inputRef.value?.blur();
  }
}

function toggleOption(option: Record<string, unknown>) {
  if (props.disabled) return;
  const v = valueOf(option);
  const next = props.modelValue.includes(v)
    ? props.modelValue.filter((x) => x !== v)
    : [...props.modelValue, v];
  emit("update:modelValue", next);
  query.value = "";
  nextTick(() => {
    inputRef.value?.focus();
    reposition();
  });
}
function removeAt(index: number) {
  if (props.disabled) return;
  const option = selectedOptions.value[index];
  if (!option) return;
  const v = valueOf(option);
  emit("update:modelValue", props.modelValue.filter((x) => x !== v));
}
function onBackspace() {
  if (props.disabled || query.value.length > 0 || props.modelValue.length === 0) return;
  emit("update:modelValue", props.modelValue.slice(0, -1));
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (!open.value) return reveal();
    if (filteredOptions.value.length) activeIndex.value = Math.min(activeIndex.value + 1, filteredOptions.value.length - 1);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    if (!open.value) return reveal();
    if (filteredOptions.value.length) activeIndex.value = Math.max(activeIndex.value - 1, 0);
  } else if (event.key === "Home" && open.value) {
    event.preventDefault();
    activeIndex.value = filteredOptions.value.length ? 0 : -1;
  } else if (event.key === "End" && open.value) {
    event.preventDefault();
    activeIndex.value = filteredOptions.value.length - 1;
  } else if (event.key === "Enter") {
    event.preventDefault();
    if (!open.value) return reveal();
    const option = filteredOptions.value[activeIndex.value] ?? filteredOptions.value[0];
    if (option) toggleOption(option);
  } else if (event.key === "Escape" && open.value) {
    event.stopPropagation();
    dismiss();
  }
}
</script>

<template>
  <div
    ref="rootRef"
    class="mw-ms"
    :class="[sizeClass, { 'mw-ms-focus': open, 'mw-ms-disabled': disabled, 'mw-ms-invalid': invalid }]"
    @mousedown="onFieldMousedown"
    @click="!open && inputRef?.focus()"
  >
    <div ref="labelRef" class="mw-ms-label">
      <slot
        v-for="(o, i) in visibleOptions"
        :key="`${String(valueOf(o))}-${i}`"
        name="chip"
        :option="o"
        :label="labelOf(o)"
        :index="i"
        :remove="() => removeAt(i)"
      >
        <span class="mw-ms-chip">
          <span class="mw-ms-chip-label">{{ labelOf(o) }}</span>
          <button
            v-if="!disabled"
            type="button"
            class="mw-ms-chip-remove"
            :aria-label="t('common.select.remove', { label: labelOf(o) })"
            @mousedown.stop.prevent
            @click.stop="removeAt(i)"
          >
            <i class="pi pi-times" aria-hidden="true" />
          </button>
        </span>
      </slot>
      <span v-if="overflowCount > 0" class="mw-ms-chip mw-ms-chip-more">+{{ overflowCount }}</span>
      <input
        :id="fieldId"
        ref="inputRef"
        v-model="query"
        class="mw-ms-input"
        :placeholder="hasSelection ? '' : placeholder"
        :disabled="disabled"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="ariaDescribedby"
        :aria-invalid="invalid || undefined"
        :aria-required="required || undefined"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        :aria-expanded="open"
        :aria-controls="listboxId"
        :aria-activedescendant="open && activeIndex >= 0 ? optionId(activeIndex) : undefined"
        role="combobox"
        type="text"
        autocomplete="off"
        spellcheck="false"
        @focus="reveal"
        @blur="onBlur"
        @input="onInput"
        @keydown.backspace="onBackspace"
        @keydown="onKeydown"
      />
    </div>

    <!-- 隐藏量算行：始终渲染全部 chip 供 recalc 测宽（不参与可见布局） -->
    <div ref="measureRef" class="mw-ms-measure" aria-hidden="true">
      <slot
        v-for="(o, i) in selectedOptions"
        :key="`${String(valueOf(o))}-${i}`"
        name="chip"
        :option="o"
        :label="labelOf(o)"
        :index="i"
        :remove="() => {}"
      >
        <span class="mw-ms-chip">
          <span class="mw-ms-chip-label">{{ labelOf(o) }}</span>
          <i class="pi pi-times mw-ms-chip-remove" aria-hidden="true" />
        </span>
      </slot>
    </div>

    <span class="mw-ms-dropdown" aria-hidden="true"><i class="pi pi-chevron-down" /></span>

    <Teleport to="body">
      <ul
        v-if="open"
        :id="listboxId"
        ref="panelRef"
        class="mw-ms-overlay"
        :style="panelStyle"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        aria-multiselectable="true"
        role="listbox"
      >
        <li
          v-for="(option, i) in filteredOptions"
          :id="optionId(i)"
          :key="`${String(valueOf(option))}-${i}`"
          class="mw-ms-option"
          :class="{
            'mw-ms-option-selected': isSelected(option),
            'mw-ms-option-active': i === activeIndex,
          }"
          :aria-selected="isSelected(option)"
          role="option"
          @mousedown.prevent="toggleOption(option)"
          @mousemove="activeIndex = i"
        >
          <slot name="option" :option="option" :label="labelOf(option)" :selected="isSelected(option)">{{ labelOf(option) }}</slot>
        </li>
        <li v-if="!filteredOptions.length" class="mw-ms-empty">{{ emptyMessageText }}</li>
      </ul>
    </Teleport>
  </div>
</template>

<style scoped>
/* ── Field — mirrors .p-multiselect geometry via global --p-multiselect-* tokens ──
   颜色不走 --p-* 间接引用：PrimeVue 的组件 token 按需注入（页面没挂过该组件时
   变量不存在，会落进浅色兜底，深色下就是白块），直接用 var.css token + 仿玻璃
   字段配方（与 primevue-theme.css 的 .p-inputtext 族逐项一致）。几何 token
   （padding/radius/宽度）与主题无关，保留 --p-* 引用。 */
.mw-ms {
  position: relative;
  display: inline-flex;
  align-items: stretch;
  width: 100%;
  min-height: var(--mw-ms-min-h, 2rem);
  cursor: text;
  background-color: var(--color-surface-base);
  background-image: var(--material-control-face);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--p-multiselect-border-radius, var(--radius));
  box-shadow: var(--material-control-inset);
  transition:
    border-color 0.18s,
    box-shadow 0.18s,
    outline-color 0.18s;
  outline: 3px solid transparent;
  outline-offset: 0;
}
.mw-ms:not(.mw-ms-disabled):hover {
  border-color: var(--color-border-strong);
}
.mw-ms-focus {
  border-color: var(--color-brand-500);
  outline-color: rgb(var(--color-brand-500-rgb) / 0.18);
}
.mw-ms-invalid {
  border-color: var(--color-danger-500);
}
.mw-ms-disabled {
  opacity: var(--p-disabled-opacity, 0.6);
  cursor: default;
}

/* Label row — same padding halving trick as .p-multiselect-label:has(.p-chip). */
.mw-ms-label {
  flex: 1 1 auto;
  width: 1%;
  min-width: 0;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: calc(var(--p-multiselect-padding-y, 0.375rem) / 2);
  padding: calc(var(--p-multiselect-padding-y, 0.375rem) / 2)
    calc(var(--p-multiselect-padding-x, 0.625rem) / 2);
  overflow: hidden;
}

/* Chip — replicates .p-multiselect-chip (.p-chip) box: same padding, radius, size. */
.mw-ms-chip {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  max-width: 100%;
  padding-block: calc(var(--p-multiselect-padding-y, 0.375rem) / 2);
  padding-inline: var(--p-chip-padding-x, 0.5rem);
  border-radius: var(--p-multiselect-chip-border-radius, var(--radius-sm));
  background: var(--color-surface-muted);
  color: var(--color-text-primary);
  font-size: 0.8125rem;
  line-height: 1.25;
  white-space: nowrap;
}
.mw-ms-chip-label {
  overflow: hidden;
  text-overflow: ellipsis;
}
.mw-ms-chip-remove {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--color-text-tertiary);
  font: inherit;
  font-size: 0.75rem;
  cursor: pointer;
  transition:
    color 0.15s,
    background 0.15s;
}
.mw-ms-chip-remove:hover {
  color: var(--color-text-primary);
  background: var(--color-surface-muted);
}
.mw-ms-chip-remove:focus-visible {
  outline: 2px solid var(--color-brand-500);
  outline-offset: 1px;
}
.mw-ms-chip-more {
  color: var(--color-text-secondary);
}

.mw-ms-input {
  flex: 1 1 auto;
  width: 1%;
  min-width: 1.5rem;
  border: none;
  outline: none;
  background: transparent;
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.25;
  padding: 0;
}
.mw-ms-input::placeholder {
  color: var(--color-text-tertiary);
  opacity: 1;
}

/* Hidden measuring row — laid out like the label row but taken out of flow. */
.mw-ms-measure {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-wrap: nowrap;
  gap: calc(var(--p-multiselect-padding-y, 0.375rem) / 2);
  visibility: hidden;
  pointer-events: none;
  white-space: nowrap;
}

.mw-ms-dropdown {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: var(--p-multiselect-dropdown-width, 2.5rem);
  color: var(--color-text-tertiary);
}
.mw-ms-dropdown .pi {
  font-size: 0.75rem;
}

/* ── Size ramp ── */
.mw-ms-sm {
  --mw-ms-min-h: 1.5rem; /* empty height ≈ 24px like other sm fields (chips grow it naturally) */
}
.mw-ms-sm .mw-ms-input,
.mw-ms-sm .mw-ms-chip {
  font-size: var(--p-multiselect-sm-font-size, 0.75rem);
}
.mw-ms-sm .mw-ms-dropdown {
  width: 1.75rem;
}
.mw-ms-lg .mw-ms-input {
  font-size: var(--p-multiselect-lg-font-size, 1rem);
}
</style>

<style>
/* Panel — teleported to <body>, styled to read as a .p-multiselect overlay. */
.mw-ms-overlay {
  margin: 0;
  padding: var(--p-multiselect-list-padding, 0.25rem);
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--p-multiselect-list-gap, 2px);
  max-height: 15rem;
  overflow-y: auto;
  /* 真玻璃（浮层档）：配方与 .mw-glass 一致，见 styles.css 的 Material 节。
     这块是自绘浮层（不是 PrimeVue 的 .p-*-overlay），所以在这里显式声明。 */
  background-color: var(--material-scrim);
  background-image: var(--material-specular);
  -webkit-backdrop-filter: var(--material-blur);
  backdrop-filter: var(--material-blur);
  border: 1px solid var(--material-hairline);
  border-radius: var(--p-multiselect-overlay-border-radius, var(--radius));
  box-shadow: var(--material-lens), var(--material-glass-shadow);
}
.mw-ms-overlay .mw-ms-option {
  padding: var(--p-multiselect-option-padding, 0.375rem 0.625rem);
  border-radius: var(--p-multiselect-option-border-radius, var(--radius-sm));
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
.mw-ms-overlay .mw-ms-option:not(.mw-ms-option-selected):hover,
.mw-ms-overlay .mw-ms-option-active:not(.mw-ms-option-selected) {
  background: var(--material-hover);
}
.mw-ms-overlay .mw-ms-option-selected {
  background: rgb(var(--color-brand-500-rgb) / 0.16);
  color: var(--color-brand-700);
}
.mw-ms-overlay .mw-ms-empty {
  padding: var(--p-multiselect-empty-message-padding, 0.375rem 0.625rem);
  color: var(--color-text-tertiary);
  font-size: 0.875rem;
}
</style>
