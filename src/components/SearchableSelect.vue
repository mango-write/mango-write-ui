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
import { computed, nextTick, onMounted, ref, useId, watch } from "vue";
import { ChevronDown, X } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import { useComboPanel } from "../lib/useComboPanel";

const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    modelValue: unknown;
    options: readonly Record<string, unknown>[];
    optionLabel: string;
    optionValue?: string;
    inputId?: string;
    ariaLabel?: string;
    ariaLabelledby?: string;
    ariaDescribedby?: string;
    placeholder?: string;
    showClear?: boolean;
    disabled?: boolean;
    invalid?: boolean;
    required?: boolean;
    size?: "small" | "large";
    emptyMessage?: string;
  }>(),
  {
    optionValue: undefined,
    inputId: undefined,
    ariaLabel: undefined,
    ariaLabelledby: undefined,
    ariaDescribedby: undefined,
    placeholder: undefined,
    showClear: false,
    disabled: false,
    invalid: false,
    required: false,
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

const generatedId = useId();
const fieldId = computed(() => props.inputId ?? `mw-ss-${generatedId}`);
const listboxId = computed(() => `${fieldId.value}-listbox`);
const optionId = (index: number) => `${listboxId.value}-option-${index}`;

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

function scrollActiveIntoView() {
  nextTick(() => {
    const option = panelRef.value?.querySelectorAll<HTMLElement>('[role="option"]')[activeIndex.value];
    option?.scrollIntoView?.({ block: "nearest" });
  });
}
watch(activeIndex, scrollActiveIntoView);

function reveal() {
  if (props.disabled || open.value) return;
  emit("show");
  activeIndex.value = filtered.value.findIndex((o) => valueOf(o) === props.modelValue);
  openPanel();
  scrollActiveIntoView();
}
function dismiss() {
  closePanel();
  typing.value = false;
  query.value = "";
  activeIndex.value = -1;
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
    if (filtered.value.length) activeIndex.value = Math.min(activeIndex.value + 1, filtered.value.length - 1);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    if (!open.value) return reveal();
    if (filtered.value.length) activeIndex.value = Math.max(activeIndex.value - 1, 0);
  } else if (event.key === "Home" && open.value) {
    event.preventDefault();
    activeIndex.value = filtered.value.length ? 0 : -1;
  } else if (event.key === "End" && open.value) {
    event.preventDefault();
    activeIndex.value = filtered.value.length - 1;
  } else if (event.key === "Enter") {
    event.preventDefault();
    if (!open.value) return reveal();
    const option = filtered.value[activeIndex.value] ?? filtered.value[0];
    if (option) selectOption(option);
  } else if (event.key === "Escape" && open.value) {
    event.stopPropagation();
    dismiss();
  }
}
</script>

<template>
  <div
    ref="rootRef"
    class="mw-ss"
    :class="[sizeClass, { 'mw-ss-focus': open, 'mw-ss-disabled': disabled, 'mw-ss-invalid': invalid }]"
    @mousedown="onFieldMousedown"
    @click="!open && inputRef?.focus()"
  >
    <div class="mw-ss-field">
      <input
        :id="fieldId"
        ref="inputRef"
        class="mw-ss-input"
        :class="{ 'mw-ss-placeholder': !filled && !typing }"
        :style="{ width: inputWidth ? inputWidth + 'px' : undefined }"
        :value="inputValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="ariaDescribedby"
        :aria-invalid="invalid || undefined"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        :aria-expanded="open"
        :aria-controls="listboxId"
        :aria-activedescendant="open && activeIndex >= 0 ? optionId(activeIndex) : undefined"
        role="combobox"
        type="text"
        autocomplete="off"
        spellcheck="false"
        @focus="onFocus"
        @input="onInput"
        @keydown="onKeydown"
      />
      <span ref="mirrorRef" class="mw-ss-mirror" aria-hidden="true">{{ mirrorText }}</span>
    </div>
    <button
      v-if="showClear && filled && !disabled"
      type="button"
      class="mw-ss-clear"
      :aria-label="t('common.select.clear')"
      @mousedown.stop.prevent
      @click="clear"
    >
      <X aria-hidden="true" />
    </button>
    <span class="mw-ss-dropdown" aria-hidden="true">
      <ChevronDown aria-hidden="true" />
    </span>

    <Teleport to="body">
      <ul
        v-if="open"
        :id="listboxId"
        ref="panelRef"
        class="mw-ss-overlay mw-frost"
        :style="panelStyle"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        role="listbox"
      >
        <li
          v-for="(option, i) in filtered"
          :id="optionId(i)"
          :key="`${String(valueOf(option))}-${i}`"
          class="mw-ss-option"
          :class="{
            'mw-ss-option-selected': valueOf(option) === modelValue,
            'mw-ss-option-active': i === activeIndex,
          }"
          :aria-selected="valueOf(option) === modelValue"
          role="option"
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
.mw-ss {
  position: relative;
  display: inline-flex;
  align-items: stretch;
  width: fit-content;
  max-width: 100%;
  min-height: var(--control-h);
  cursor: text;
  background-color: var(--control-bg);
  border: var(--border-width) solid var(--control-border);
  border-radius: var(--control-radius);
  transition:
    border-color var(--duration-fast) var(--ease-standard),
    background-color var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard);
}
.mw-ss:not(.mw-ss-disabled):hover {
  border-color: var(--control-border-hover);
  background-color: var(--control-bg-hover);
}
.mw-ss-focus {
  border-color: var(--focus-color);
  box-shadow: var(--focus-shadow);
}
.mw-ss-invalid {
  border-color: var(--danger);
}
.mw-ss-disabled {
  opacity: var(--opacity-disabled);
  cursor: default;
  background-color: var(--control-bg-disabled);
}

.mw-ss-field {
  position: relative;
  flex: 0 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  padding: var(--space-1) 0 var(--space-1) var(--control-px);
}
.mw-ss-input {
  min-width: var(--size-xs-h);
  max-width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-primary);
  font-family: inherit;
  font-size: var(--control-font);
  line-height: var(--type-body-sm-line);
  padding: 0;
  text-overflow: ellipsis;
  cursor: text;
}
.mw-ss-input::placeholder {
  color: var(--text-tertiary);
  opacity: 1;
}
.mw-ss-disabled .mw-ss-input {
  cursor: default;
}
.mw-ss-mirror {
  position: absolute;
  left: 0;
  top: 0;
  visibility: hidden;
  pointer-events: none;
  white-space: pre;
  font-family: inherit;
  font-size: var(--control-font);
  line-height: var(--type-body-sm-line);
}

.mw-ss-dropdown {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: var(--size-md-h);
  color: var(--text-tertiary);
}
.mw-ss-dropdown svg {
  width: var(--icon-xs);
  height: var(--icon-xs);
  font-size: var(--icon-xs);
}

.mw-ss-clear {
  align-self: center;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-lg);
  height: var(--icon-lg);
  padding: 0;
  border: 0;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--text-tertiary);
  font: inherit;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
}
.mw-ss-clear:hover {
  background-color: var(--fill-default);
  color: var(--text-primary);
}
.mw-ss-clear:focus-visible {
  outline: var(--focus-width) solid var(--focus-color);
  outline-offset: var(--space-px);
}
.mw-ss-clear svg {
  width: var(--icon-xs);
  height: var(--icon-xs);
  font-size: var(--icon-xs);
}

.mw-ss-sm {
  --control-h: var(--size-sm-h);
  --control-font: var(--size-sm-font);
  --control-px: var(--size-sm-px);
  --control-radius: var(--size-sm-radius);
}
.mw-ss-sm .mw-ss-dropdown {
  width: var(--size-sm-h);
}
.mw-ss-lg {
  --control-h: var(--size-lg-h);
  --control-font: var(--size-lg-font);
  --control-px: var(--size-lg-px);
  --control-radius: var(--size-lg-radius);
}
</style>

<style>
.mw-ss-overlay {
  --_ss-max-h: calc(var(--size-lg-h) * 6);
  margin: 0;
  padding: var(--space-1);
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-0-5);
  max-height: var(--_ss-max-h);
  overflow-y: auto;
  border-radius: var(--radius-float);
  box-shadow: var(--shadow-floating);
}
.mw-ss-overlay .mw-ss-option {
  padding: var(--space-1-5) var(--space-2-5);
  border-radius: var(--radius-item);
  color: var(--text-primary);
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mw-ss-overlay .mw-ss-option-active:not(.mw-ss-option-selected) {
  background-color: var(--fill-default);
}
.mw-ss-overlay .mw-ss-option-selected {
  background-color: var(--fill-selected);
  color: var(--text-accent);
  font-weight: var(--weight-medium);
}
.mw-ss-overlay .mw-ss-empty {
  padding: var(--space-2) var(--space-2-5);
  color: var(--text-tertiary);
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
}
</style>
