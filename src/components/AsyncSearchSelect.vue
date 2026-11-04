<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useComboPanel } from "../lib/useComboPanel";
import type { AsyncSearchOption } from "./async-search-select";

defineOptions({
  name: "AsyncSearchSelect",
});

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
    /** modelValue 命中未见过的 id 时的回显选项（调用方知道 label 时注入）。 */
    initialOption?: AsyncSearchOption | null;
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
    initialOption: undefined,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string | null): void;
  (e: "select", option: AsyncSearchOption | null): void;
}>();

const { t } = useI18n();
const emptyMessageText = computed(() => props.emptyMessage ?? t("common.select.noMatch"));
const loadingMessageText = computed(() => props.loadingMessage ?? t("common.select.searching"));

const generatedId = useId();
const fieldId = computed(() => props.inputId ?? `mw-ass-${generatedId}`);
const listboxId = computed(() => `${fieldId.value}_list`);
const optionId = (index: number) => `${fieldId.value}_${index}`;

const rootRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const { open, panelStyle, openPanel, closePanel, reposition } = useComboPanel(rootRef, panelRef);

const seenOptions = ref(new Map<string, AsyncSearchOption>());
const selected = ref<AsyncSearchOption | string | null>(null);
const focused = ref(false);
const activeIndex = ref(-1);

const displayValue = computed(() => {
  if (selected.value === null) return "";
  if (typeof selected.value === "string") return selected.value;
  return selected.value.label;
});

function syncInputDom() {
  if (inputRef.value && inputRef.value.value !== displayValue.value) {
    inputRef.value.value = displayValue.value;
  }
}

watch(
  () => [props.modelValue, props.initialOption] as const,
  ([id, initOpt]) => {
    if (!id) {
      selected.value = null;
      syncInputDom();
      return;
    }
    if (initOpt?.value === id) {
      seenOptions.value.set(id, initOpt);
    } else if (!seenOptions.value.has(id)) {
      seenOptions.value.set(id, { value: id, label: id });
    }
    selected.value = seenOptions.value.get(id)!;
    syncInputDom();
  },
  { immediate: true },
);

watch(displayValue, () => {
  syncInputDom();
});

const rawResults = ref<AsyncSearchOption[]>([]);
const loading = ref(false);
const suggestions = computed(() =>
  rawResults.value.filter((o) => !props.excludeValues.includes(o.value)),
);

let seq = 0;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function clearDebounce() {
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}

onBeforeUnmount(() => {
  clearDebounce();
  seq++;
});

function scrollActiveIntoView() {
  nextTick(() => {
    if (activeIndex.value < 0) return;
    const items = panelRef.value?.querySelectorAll<HTMLElement>(
      '[role="option"]:not(.p-autocomplete-empty-message)',
    );
    items?.[activeIndex.value]?.scrollIntoView?.({ block: "nearest" });
  });
}

watch(activeIndex, scrollActiveIntoView);

async function runSearch(query: string) {
  const current = ++seq;
  loading.value = true;
  try {
    const items = await props.search(query);
    if (current !== seq) return;
    for (const option of items) seenOptions.value.set(option.value, option);
    rawResults.value = [...items];
    if (props.modelValue && typeof selected.value === "object" && selected.value !== null) {
      const fresh = seenOptions.value.get(props.modelValue);
      if (fresh && fresh !== selected.value) {
        selected.value = fresh;
        syncInputDom();
      }
    }
    openPanel();
    activeIndex.value = suggestions.value.length > 0 ? 0 : -1;
    nextTick(reposition);
  } catch {
    if (current !== seq) return;
    rawResults.value = [];
    openPanel();
    activeIndex.value = -1;
    nextTick(reposition);
  } finally {
    if (current === seq) loading.value = false;
  }
}

function restoreSelected() {
  if (!props.modelValue) {
    selected.value = null;
  } else {
    const option = seenOptions.value.get(props.modelValue);
    selected.value = option ? { ...option } : { value: props.modelValue, label: props.modelValue };
  }
  syncInputDom();
}

function onDismiss() {
  clearDebounce();
  if (typeof selected.value === "string") {
    restoreSelected();
  }
}

watch(open, (isOpen) => {
  if (!isOpen) {
    activeIndex.value = -1;
    onDismiss();
  }
});

function onFocus() {
  if (props.disabled) return;
  focused.value = true;
  if (!open.value && !loading.value) {
    void runSearch("");
  }
}

function onBlur() {
  focused.value = false;
  onDismiss();
}

function onRootClick(event: MouseEvent) {
  if (props.disabled) return;
  const target = event.target as HTMLElement | null;
  if (target?.closest(".p-autocomplete-dropdown, .p-autocomplete-clear-icon")) return;
  inputRef.value?.focus();
  if (!open.value && !loading.value) {
    void runSearch("");
  }
}

function onDropdownClick() {
  if (props.disabled) return;
  if (open.value) {
    closePanel();
  } else {
    inputRef.value?.focus();
    if (!loading.value) {
      void runSearch("");
    }
  }
}

function onInput(event: Event) {
  if (props.disabled) return;
  const val = (event.target as HTMLInputElement).value;
  clearDebounce();
  if (val === "") {
    closePanel();
    restoreSelected();
    return;
  }
  selected.value = val;
  if (props.debounceMs <= 0) {
    void runSearch(val);
  } else {
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      void runSearch(val);
    }, props.debounceMs);
  }
}

function selectOption(option: AsyncSearchOption) {
  if (props.disabled) return;
  clearDebounce();
  selected.value = option;
  seenOptions.value.set(option.value, option);
  syncInputDom();
  closePanel();
  emit("update:modelValue", option.value);
  emit("select", option);
}

function onClearClick() {
  if (props.disabled) return;
  clearDebounce();
  seq++;
  loading.value = false;
  rawResults.value = [];
  selected.value = null;
  activeIndex.value = -1;
  closePanel();
  syncInputDom();
  if (props.modelValue !== null) {
    emit("update:modelValue", null);
    emit("select", null);
  }
  void runSearch("");
}

function onKeydown(event: KeyboardEvent) {
  if (props.disabled) return;
  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (!open.value) {
      if (!loading.value) void runSearch("");
      return;
    }
    if (suggestions.value.length > 0) {
      activeIndex.value = Math.min(activeIndex.value + 1, suggestions.value.length - 1);
    }
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    if (!open.value) {
      if (!loading.value) void runSearch("");
      return;
    }
    if (suggestions.value.length > 0) {
      activeIndex.value = Math.max(activeIndex.value - 1, 0);
    }
  } else if (event.key === "Home" && open.value) {
    event.preventDefault();
    activeIndex.value = suggestions.value.length > 0 ? 0 : -1;
  } else if (event.key === "End" && open.value) {
    event.preventDefault();
    activeIndex.value = suggestions.value.length - 1;
  } else if (event.key === "Enter") {
    if (!open.value) return;
    event.preventDefault();
    const option = suggestions.value[activeIndex.value] ?? suggestions.value[0];
    if (option) selectOption(option);
  } else if (event.key === "Escape") {
    if (open.value) {
      event.preventDefault();
      event.stopPropagation();
      closePanel();
    }
    onDismiss();
  }
}

const showClearButton = computed(
  () => props.showClear && !props.disabled && (props.modelValue !== null || selected.value !== null),
);
</script>

<template>
  <div
    ref="rootRef"
    class="mw-ass p-autocomplete p-component p-inputwrapper mw-control"
    :class="{
      'mw-ass--fluid p-autocomplete-fluid': fluid,
      'mw-ass--disabled p-disabled': disabled,
      'mw-ass--open p-inputwrapper-focus': open || focused,
      'p-inputwrapper-filled': Boolean(displayValue),
    }"
    :data-state="open ? 'open' : 'closed'"
    :data-disabled="disabled ? 'true' : undefined"
    @click="onRootClick"
  >
    <input
      :id="fieldId"
      ref="inputRef"
      type="text"
      role="combobox"
      class="mw-ass-input p-autocomplete-input p-inputtext p-component mw-input"
      :value="displayValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-label="ariaLabel"
      aria-autocomplete="list"
      aria-haspopup="listbox"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="listboxId"
      :aria-activedescendant="open && activeIndex >= 0 ? optionId(activeIndex) : undefined"
      autocomplete="off"
      spellcheck="false"
      @focus="onFocus"
      @blur="onBlur"
      @input="onInput"
      @keydown="onKeydown"
    />

    <svg
      v-if="loading"
      class="p-autocomplete-loader pi pi-spinner"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      aria-hidden="true"
    >
      <path d="M8 2a6 6 0 1 1-4.24 1.76" />
    </svg>

    <button
      v-if="showClearButton"
      type="button"
      class="p-autocomplete-clear-icon"
      :aria-label="t('common.select.clear')"
      @mousedown.stop.prevent
      @click.stop="onClearClick"
    >
      <svg
        class="pi pi-times"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <path d="M4 4l8 8M12 4l-8 8" />
      </svg>
    </button>

    <button
      type="button"
      class="p-autocomplete-dropdown"
      :disabled="disabled"
      tabindex="-1"
      aria-hidden="true"
      @mousedown.stop.prevent
      @click.stop="onDropdownClick"
    >
      <svg
        class="pi pi-chevron-down"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M4 6l4 4 4-4" />
      </svg>
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        ref="panelRef"
        class="mw-ass-overlay p-autocomplete-overlay p-component mw-glass"
        :style="panelStyle"
        @mousedown.prevent
      >
        <div class="p-autocomplete-list-container">
          <ul
            :id="listboxId"
            role="listbox"
            class="p-autocomplete-list"
            :aria-label="ariaLabel"
          >
            <li
              v-for="(option, i) in suggestions"
              :id="optionId(i)"
              :key="option.value"
              role="option"
              class="p-autocomplete-option"
              :class="{
                'p-autocomplete-option-selected': option.value === modelValue,
                'p-focus': i === activeIndex,
              }"
              :aria-selected="option.value === modelValue"
              :data-highlighted="i === activeIndex ? '' : undefined"
              :data-state="option.value === modelValue ? 'checked' : 'unchecked'"
              @mousemove="activeIndex = i"
              @click="selectOption(option)"
            >
              <slot name="option" :option="option" :selected="option.value === modelValue">
                <span class="mw-ass-option-body">
                  <img v-if="option.avatar" class="mw-ass-avatar" :src="option.avatar" alt="" />
                  <span class="mw-ass-option-text">
                    <span class="mw-ass-option-label">{{ option.label }}</span>
                    <span v-if="option.description" class="mw-ass-option-desc">{{ option.description }}</span>
                  </span>
                </span>
              </slot>
            </li>
            <li
              v-if="!suggestions.length"
              role="option"
              class="p-autocomplete-empty-message"
            >
              <span class="mw-ass-note">{{ loading ? loadingMessageText : emptyMessageText }}</span>
            </li>
          </ul>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style>
.mw-ass {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-width: 10rem;
  max-width: 100%;
  min-height: var(--control-height-compact);
}

.mw-ass--fluid,
.p-autocomplete-fluid {
  display: flex;
  width: 100%;
}

.mw-ass-input {
  flex: 1 1 auto;
  min-width: 0;
  width: 100%;
  padding: 0.375rem 0 0.375rem 0.625rem;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.25;
}

.mw-ass-input::placeholder {
  color: var(--color-text-tertiary);
  opacity: 1;
}

.p-autocomplete-loader {
  flex-shrink: 0;
  width: 0.875rem;
  height: 0.875rem;
  margin-inline: 0.25rem;
  color: var(--color-text-tertiary);
}

.p-autocomplete-clear-icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  padding: 0;
  border: none;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
}

.p-autocomplete-clear-icon:hover {
  background: var(--color-surface-muted);
  color: var(--color-text-primary);
}

.p-autocomplete-clear-icon .pi {
  width: 0.6875rem;
  height: 0.6875rem;
}

.p-autocomplete-dropdown {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
}

.p-autocomplete-dropdown .pi {
  width: 0.75rem;
  height: 0.75rem;
}

.mw-ass-overlay {
  border-radius: var(--radius);
  overflow: hidden;
}

.p-autocomplete-list-container {
  max-height: 15rem;
  overflow-y: auto;
}

.p-autocomplete-list {
  margin: 0;
  padding: 0.25rem;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.p-autocomplete-option {
  padding: 0.375rem 0.625rem;
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  line-height: 1.25;
  cursor: pointer;
}

.p-autocomplete-option[data-highlighted]:not(.p-autocomplete-option-selected),
.p-autocomplete-option.p-focus:not(.p-autocomplete-option-selected) {
  background: var(--material-hover);
}

.p-autocomplete-option-selected {
  background: rgb(var(--color-brand-500-rgb) / 0.16);
  color: var(--color-brand-700);
}

.p-autocomplete-empty-message {
  padding: 0.375rem 0.625rem;
  color: var(--color-text-tertiary);
  font-size: 0.875rem;
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
  border-radius: var(--radius-pill);
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

.mw-ass-note {
  color: var(--color-text-tertiary);
}
</style>
