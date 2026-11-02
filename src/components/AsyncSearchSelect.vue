<script setup lang="ts">
// 异步远程搜索单选 — SearchableSelect 的「选项在服务端」变体：本地不做过滤，
// 输入经防抖交给注入的 search 取回选项。与业务完全解耦：取数与 placeholder 由
// 调用方注入，包自持文案只兜空态/加载两处通用词。
// 慢响应用递增序号守卫：过期返回的结果与 loading 状态都不落，避免旧结果闪回；
// search 抛错按空结果处理（调用方在 search 内部做自己的错误上报），不让
// 防抖回调产生未捕获 rejection。
// 选中态展示优先用已见过的选项（含 avatar）；modelValue 被外部设成没见过的
// 值时回退显示原始值字符串。
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from "vue";
import { useI18n } from "vue-i18n";

import { useComboPanel } from "../lib/useComboPanel";
import type { AsyncSearchOption } from "./async-search-select";

const props = withDefaults(
  defineProps<{
    modelValue: string | null;
    search: (query: string) => Promise<AsyncSearchOption[]>;
    inputId?: string;
    ariaLabel?: string;
    placeholder?: string;
    emptyMessage?: string;
    loadingMessage?: string;
    showClear?: boolean;
    disabled?: boolean;
    /** 撑满父容器宽度（默认 hug content）。 */
    fluid?: boolean;
    debounceMs?: number;
    /** 从结果里剔除的 value（如已被选过的项）；响应式，变更即时生效。 */
    excludeValues?: string[];
  }>(),
  {
    inputId: undefined,
    ariaLabel: undefined,
    placeholder: undefined,
    emptyMessage: undefined,
    loadingMessage: undefined,
    showClear: true,
    disabled: false,
    fluid: false,
    debounceMs: 250,
    excludeValues: () => [],
  },
);
const emit = defineEmits<{
  (e: "update:modelValue", value: string | null): void;
  (e: "select", option: AsyncSearchOption | null): void;
}>();

const { t } = useI18n();
const emptyMessageText = computed(() => props.emptyMessage ?? t("common.select.noMatch"));
const loadingMessageText = computed(() => props.loadingMessage ?? t("common.select.searching"));

const rootRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const mirrorRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const { open, panelStyle, openPanel, closePanel } = useComboPanel(rootRef, panelRef);

const generatedId = useId();
const fieldId = computed(() => props.inputId ?? `mw-ass-${generatedId}`);
const listboxId = computed(() => `${fieldId.value}-listbox`);
const optionId = (index: number) => `${listboxId.value}-option-${index}`;

const typing = ref(false);
const query = ref("");
const results = ref<AsyncSearchOption[]>([]);
const loading = ref(false);
const activeIndex = ref(-1);
const inputWidth = ref(0);
const seenOptions = ref(new Map<string, AsyncSearchOption>());

const visibleResults = computed(() =>
  results.value.filter((o) => !props.excludeValues.includes(o.value)),
);

const selectedOption = computed<AsyncSearchOption | null>(() => {
  if (!props.modelValue) return null;
  return seenOptions.value.get(props.modelValue) ?? { value: props.modelValue, label: props.modelValue };
});
const selectedLabel = computed(() => selectedOption.value?.label ?? "");

const inputValue = computed(() => (typing.value ? query.value : selectedLabel.value));
const mirrorText = computed(() => inputValue.value || props.placeholder || "");

watch(
  () => props.modelValue,
  (value) => {
    if (!value) return;
    // 外部直接设值（如回显）时组件可能还没取过数，先占位成原始值；
    // 之后任何一次取回都会通过 remember() 补上真实 label。
    if (!seenOptions.value.has(value)) {
      seenOptions.value.set(value, { value, label: value });
    }
  },
  { immediate: true },
);

function remember(options: AsyncSearchOption[]) {
  for (const option of options) seenOptions.value.set(option.value, option);
}

let seq = 0;
async function runSearch(q: string) {
  const current = ++seq;
  loading.value = true;
  try {
    const items = await props.search(q);
    if (current !== seq) return;
    results.value = items;
    remember(items);
  } catch {
    if (current !== seq) return;
    results.value = [];
  } finally {
    if (current === seq) loading.value = false;
  }
}

let debounceTimer: ReturnType<typeof setTimeout> | undefined;
function cancelPendingSearch() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = undefined;
}
watch(
  query,
  (q) => {
    cancelPendingSearch();
    // 选择/清除都会把 query 复位成空串，复位不该触发一次多余的取数；
    // 真正的「清空重搜」发生在输入中（typing 仍为 true）。
    if (!open.value && !typing.value && q === "") return;
    debounceTimer = setTimeout(() => void runSearch(q), props.debounceMs);
  },
);
onBeforeUnmount(cancelPendingSearch);

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
  activeIndex.value = -1;
  openPanel();
  void runSearch(query.value);
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
  if (!open.value) openPanel();
  activeIndex.value = 0;
}
function onFieldMousedown(event: MouseEvent) {
  if (open.value) {
    event.preventDefault();
    dismiss();
    inputRef.value?.blur();
  }
}
function choose(option: AsyncSearchOption) {
  emit("update:modelValue", option.value);
  emit("select", option);
  dismiss();
  inputRef.value?.blur();
}
function clear(event: Event) {
  event.stopPropagation();
  cancelPendingSearch();
  seq++; // 在途响应作废：清除后到达的旧结果不应复活列表
  loading.value = false;
  results.value = [];
  typing.value = false;
  query.value = "";
  activeIndex.value = -1;
  emit("update:modelValue", null);
  emit("select", null);
  inputRef.value?.focus();
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (!open.value) return reveal();
    if (visibleResults.value.length) activeIndex.value = Math.min(activeIndex.value + 1, visibleResults.value.length - 1);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    if (!open.value) return reveal();
    if (visibleResults.value.length) activeIndex.value = Math.max(activeIndex.value - 1, 0);
  } else if (event.key === "Home" && open.value) {
    event.preventDefault();
    activeIndex.value = visibleResults.value.length ? 0 : -1;
  } else if (event.key === "End" && open.value) {
    event.preventDefault();
    activeIndex.value = visibleResults.value.length - 1;
  } else if (event.key === "Enter") {
    event.preventDefault();
    if (!open.value) return reveal();
    const option = visibleResults.value[activeIndex.value] ?? visibleResults.value[0];
    if (option) choose(option);
  } else if (event.key === "Escape" && open.value) {
    event.stopPropagation();
    dismiss();
  }
}
</script>

<template>
  <div
    ref="rootRef"
    class="mw-ass"
    :class="{ 'mw-ass-focus': open, 'mw-ass-disabled': disabled, 'mw-ass-fluid': fluid }"
    @mousedown="onFieldMousedown"
    @click="!open && inputRef?.focus()"
  >
    <div class="mw-ass-field">
      <img v-if="!typing && selectedOption?.avatar" class="mw-ass-selected-avatar" :src="selectedOption.avatar" alt="" />
      <input
        :id="fieldId"
        ref="inputRef"
        class="mw-ass-input"
        :class="{ 'mw-ass-placeholder': !selectedOption && !typing }"
        :style="{ width: inputWidth ? inputWidth + 'px' : undefined }"
        :value="inputValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-label="ariaLabel"
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
      <span ref="mirrorRef" class="mw-ass-mirror" aria-hidden="true">{{ mirrorText }}</span>
    </div>
    <button
      v-if="showClear && selectedOption && !disabled"
      type="button"
      class="mw-ass-clear"
      :aria-label="t('common.select.clear')"
      @mousedown.stop.prevent
      @click="clear"
    >
      <i class="pi pi-times" aria-hidden="true" />
    </button>
    <span class="mw-ass-status" aria-hidden="true">
      <i v-if="loading" class="pi pi-spin pi-spinner" />
      <i v-else class="pi pi-chevron-down" />
    </span>

    <Teleport to="body">
      <ul
        v-if="open"
        :id="listboxId"
        ref="panelRef"
        class="mw-ass-overlay"
        :style="panelStyle"
        :aria-label="ariaLabel"
        role="listbox"
        :aria-busy="loading"
      >
        <li
          v-for="(option, i) in visibleResults"
          :id="optionId(i)"
          :key="option.value"
          class="mw-ass-option"
          :class="{
            'mw-ass-option-selected': option.value === modelValue,
            'mw-ass-option-active': i === activeIndex,
          }"
          :aria-selected="option.value === modelValue"
          role="option"
          @mousedown.prevent="choose(option)"
          @mousemove="activeIndex = i"
        >
          <slot name="option" :option="option" :active="i === activeIndex" :selected="option.value === modelValue">
            <span class="mw-ass-option-body">
              <img v-if="option.avatar" class="mw-ass-avatar" :src="option.avatar" alt="" />
              <span class="mw-ass-option-text">
                <span class="mw-ass-option-label">{{ option.label }}</span>
                <span v-if="option.description" class="mw-ass-option-desc">{{ option.description }}</span>
              </span>
            </span>
          </slot>
        </li>
        <li v-if="!visibleResults.length" class="mw-ass-note">{{ loading ? loadingMessageText : emptyMessageText }}</li>
      </ul>
    </Teleport>
  </div>
</template>

<style scoped>
/* 外形配方与 SearchableSelect（.mw-ss）同源：仿玻璃字段 + --p-select-* 几何
   token，几何对齐原生 Select。两套类名各自独立，避免跨组件耦合。 */
.mw-ass {
  position: relative;
  display: inline-flex;
  align-items: stretch;
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
.mw-ass:not(.mw-ass-disabled):hover {
  border-color: var(--color-border-strong);
}
.mw-ass-focus {
  border-color: var(--color-brand-500);
  outline-color: rgb(var(--color-brand-500-rgb) / 0.18);
}
.mw-ass-disabled {
  opacity: var(--p-disabled-opacity, 0.6);
  cursor: default;
  background: var(--color-bg-soft);
}
.mw-ass-fluid {
  width: 100%;
}

.mw-ass-field {
  position: relative;
  flex: 0 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: var(--p-select-padding-y, 0.375rem) 0 var(--p-select-padding-y, 0.375rem) var(--p-select-padding-x, 0.625rem);
}
.mw-ass-selected-avatar {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: var(--radius-pill, 999px);
  object-fit: cover;
  flex-shrink: 0;
}
.mw-ass-input {
  min-width: 6rem;
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
.mw-ass-input::placeholder {
  color: var(--color-text-tertiary);
  opacity: 1;
}
.mw-ass-disabled .mw-ass-input {
  cursor: default;
}
.mw-ass-mirror {
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

.mw-ass-status {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: var(--p-select-dropdown-width, 2rem);
  color: var(--color-text-tertiary);
}
.mw-ass-status .pi {
  font-size: 0.75rem;
}

.mw-ass-clear {
  align-self: center;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  padding: 0;
  border: 0;
  border-radius: var(--radius-pill, 999px);
  background: transparent;
  color: var(--color-text-tertiary);
  font: inherit;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
}
.mw-ass-clear:hover {
  background: var(--color-surface-muted);
  color: var(--color-text-primary);
}
.mw-ass-clear:focus-visible {
  outline: 2px solid var(--color-brand-500);
  outline-offset: 1px;
}
.mw-ass-clear .pi {
  font-size: 0.6875rem;
}
</style>

<style>
/* 浮层（teleport 到 body，样式不能 scoped）——玻璃配方同 .mw-ss-overlay。 */
.mw-ass-overlay {
  margin: 0;
  padding: var(--p-select-list-padding, 0.25rem);
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--p-select-list-gap, 2px);
  max-height: 15rem;
  overflow-y: auto;
  background-color: var(--material-scrim);
  background-image: var(--material-specular);
  -webkit-backdrop-filter: var(--material-blur);
  backdrop-filter: var(--material-blur);
  border: 1px solid var(--material-hairline);
  border-radius: var(--p-select-overlay-border-radius, var(--radius));
  box-shadow: var(--material-lens), var(--material-glass-shadow);
}
.mw-ass-overlay .mw-ass-option {
  padding: var(--p-select-option-padding, 0.375rem 0.625rem);
  border-radius: var(--p-select-option-border-radius, var(--radius-sm));
  color: var(--color-text-primary);
  font-size: 0.875rem;
  line-height: 1.25;
  cursor: pointer;
}
.mw-ass-overlay .mw-ass-option-active:not(.mw-ass-option-selected) {
  background: var(--material-hover);
}
.mw-ass-overlay .mw-ass-option-selected {
  background: rgb(var(--color-brand-500-rgb) / 0.16);
  color: var(--color-brand-700);
}
.mw-ass-option-body {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}
.mw-ass-avatar {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: var(--radius-pill, 999px);
  object-fit: cover;
  flex-shrink: 0;
}
.mw-ass-option-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.mw-ass-option-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mw-ass-option-desc {
  color: var(--color-text-tertiary);
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mw-ass-overlay .mw-ass-note {
  padding: var(--p-select-empty-message-padding, 0.375rem 0.625rem);
  color: var(--color-text-tertiary);
  font-size: 0.875rem;
}
</style>
