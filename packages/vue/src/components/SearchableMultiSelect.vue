<script setup lang="ts">
// 可搜索多选 — Element Plus 风格：选中项以 chip 摆在框内，直接在框里打字过滤，
// 面板里只放过滤后的选项（点击行即勾/取消，选中态用高亮，不用 checkbox，也没有
// 「全选」）。
//
// 三个关键点：
// 1）外形与原生 MultiSelect 逐像素对齐——不自造 token，几何读 var.css 语义变量
//    （--control-h/px/radius/font、--focus-*），chip 用 mw-ms-chip 的几何，箭头列
//    /边框/圆角/聚焦光环全部一致。
// 2）chip 折叠是「按可用宽度动态计算」（参考 element-plus el-select 的 calcCollapse
//    思路）：用一层隐藏的量算行测每个 chip 的真实宽度，再按容器宽度决定显示几个，
//    放不下的收进 "+N"，而不是固定只显示 1 个、后面留大片空白。
// 3）面板用自管的 Teleport 浮层（见 useComboPanel），避免 PrimeVue Popover 在
//    「聚焦即输入过滤」场景下中途自我关闭。
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from "vue";
import { ChevronDown, X } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import { vScrollFade } from "../lib/scroll-fade";
import { useComboPanel } from "../lib/useComboPanel";
import { measureMaxTextWidth } from "../lib/text-fit.js";

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

// 工具条档（base.css 的 .mw-toolbar）按 --mw-ms-fit-text 定死宽度：多选的 chip
// 数随选择增减，内容自适应会让整条工具栏反复 reflow。量最长候选（含 placeholder）
// 交给 CSS；默认上下文仍是 width:100%，不受影响。
const fitTextWidth = ref(0);
const fitStyle = computed(() => ({ "--mw-ms-fit-text": `${fitTextWidth.value}px` }));

function measureFitTextWidth() {
  const texts = props.options.map((o) => labelOf(o));
  if (props.placeholder) texts.push(props.placeholder);
  fitTextWidth.value = measureMaxTextWidth(inputRef.value, texts);
}

watch(
  () => [props.options, props.optionLabel, props.placeholder] as const,
  () => nextTick(measureFitTextWidth),
  { immediate: true },
);

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
  measureFitTextWidth();
  document.fonts?.ready.then(measureFitTextWidth).catch(() => {});
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
    :style="fitStyle"
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
            <X aria-hidden="true" />
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
          <X class="mw-ms-chip-remove" aria-hidden="true" />
        </span>
      </slot>
    </div>

    <span class="mw-ms-dropdown" aria-hidden="true">
      <ChevronDown aria-hidden="true" />
    </span>

    <Teleport to="body">
      <div
        v-if="open"
        ref="panelRef"
        class="mw-ms-overlay mw-frost mw-scroll-scope"
        :style="panelStyle"
      >
        <ul
          :id="listboxId"
          v-scroll-fade.sm
          class="mw-ms-list mw-scroll"
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
      </div>
    </Teleport>
  </div>
</template>
