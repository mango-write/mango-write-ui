<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, ref, useAttrs, useId, watch } from "vue";
import { Check, ChevronDown, X } from "lucide-vue-next";
import { useComboPanel } from "../lib/useComboPanel";
import { uiMessages } from "../locale/index.js";
import type {
  MultiSelectChangeEvent,
  MultiSelectDisplay,
  MultiSelectOptionAccessor,
  MultiSelectProps,
  MultiSelectSize,
} from "./multi-select";

export type {
  MultiSelectChangeEvent,
  MultiSelectDisplay,
  MultiSelectOptionAccessor,
  MultiSelectProps,
  MultiSelectSize,
};

defineOptions({
  name: "MultiSelect",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<MultiSelectProps>(), {
  modelValue: () => [],
  options: () => [],
  optionLabel: undefined,
  optionValue: undefined,
  optionDisabled: undefined,
  placeholder: undefined,
  display: "comma",
  maxSelectedLabels: 3,
  selectedItemsLabel: "{0} items selected",
  filter: false,
  filterPlaceholder: undefined,
  emptyMessage: undefined,
  emptyFilterMessage: undefined,
  showClear: false,
  showToggleAll: false,
  disabled: false,
  readonly: false,
  required: false,
  invalid: false,
  fluid: false,
  size: "md",
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  inputId: undefined,
  id: undefined,
  scrollHeight: "15rem",
});

const emit = defineEmits<{
  "update:modelValue": [value: any[]];
  change: [event: MultiSelectChangeEvent];
  show: [];
  hide: [];
}>();

const attrs = useAttrs();
const instance = getCurrentInstance();

function translate(key: "noMatch" | "empty" | "clear" | "remove", params?: Record<string, string>): string {
  const globalT = (instance?.appContext.config.globalProperties as Record<string, any> | undefined)?.$t;
  const fullKey = `common.select.${key}`;
  if (typeof globalT === "function") {
    const res = globalT(fullKey, params);
    if (typeof res === "string" && res !== fullKey) {
      return res;
    }
  }
  const tpl = uiMessages["zh-CN"].common.select[key];
  if (!params) return tpl;
  return tpl.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? "");
}

function isSameValue(a: any, b: any): boolean {
  if (Object.is(a, b)) return true;
  if (a !== null && b !== null && typeof a === "object" && typeof b === "object") {
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }
  return false;
}

function resolveOptionLabel(option: any): string {
  if (option === null || option === undefined) return "";
  if (typeof props.optionLabel === "function") {
    return String(props.optionLabel(option) ?? "");
  }
  if (typeof props.optionLabel === "string" && typeof option === "object") {
    return String((option as Record<string, unknown>)[props.optionLabel] ?? "");
  }
  if (typeof option === "object" && "label" in option) {
    return String((option as Record<string, unknown>).label ?? "");
  }
  return String(option);
}

function resolveOptionValue(option: any): any {
  if (option === null || option === undefined) return option;
  if (typeof props.optionValue === "function") {
    return props.optionValue(option);
  }
  if (typeof props.optionValue === "string" && typeof option === "object") {
    return (option as Record<string, unknown>)[props.optionValue];
  }
  return option;
}

function isOptionDisabled(option: any): boolean {
  if (option === null || option === undefined) return false;
  if (typeof props.optionDisabled === "function") {
    return Boolean(props.optionDisabled(option));
  }
  if (typeof props.optionDisabled === "string" && typeof option === "object") {
    return Boolean((option as Record<string, unknown>)[props.optionDisabled]);
  }
  return false;
}

const currentValues = computed<any[]>(() => (Array.isArray(props.modelValue) ? props.modelValue : []));

function isValueSelected(val: any): boolean {
  return currentValues.value.some((v) => isSameValue(v, val));
}

function isOptionSelected(option: any): boolean {
  return isValueSelected(resolveOptionValue(option));
}

const generatedId = useId();
const baseId = computed(() => props.inputId ?? props.id ?? `mw-multiselect-${generatedId}`);
const listboxId = computed(() => `${baseId.value}-listbox`);
const optionId = (index: number) => `${listboxId.value}-option-${index}`;

const rootRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const filterInputRef = ref<HTMLInputElement | null>(null);
const listRef = ref<HTMLElement | null>(null);

const { open, panelStyle, openPanel, closePanel, reposition } = useComboPanel(rootRef, panelRef);

const filterQuery = ref("");
const activeIndex = ref(-1);

const normalizedSize = computed<"sm" | "md" | "lg">(() => {
  if (props.size === "sm" || props.size === "small") return "sm";
  if (props.size === "lg" || props.size === "large") return "lg";
  return "md";
});

const selectedItems = computed(() => {
  return currentValues.value.map((val) => {
    const matched = props.options.find((opt) => isSameValue(resolveOptionValue(opt), val));
    return {
      value: val,
      option: matched,
      label: matched !== undefined ? resolveOptionLabel(matched) : String(val ?? ""),
    };
  });
});

const hasSelection = computed(() => currentValues.value.length > 0);

const exceedsMaxLabels = computed(
  () =>
    props.maxSelectedLabels !== undefined &&
    props.maxSelectedLabels >= 0 &&
    currentValues.value.length > props.maxSelectedLabels,
);

const summaryText = computed(() => {
  if (!hasSelection.value) return "";
  if (exceedsMaxLabels.value) {
    const count = String(currentValues.value.length);
    return (props.selectedItemsLabel || "{0} items selected")
      .replace(/\{0\}/g, count)
      .replace(/\{count\}/g, count);
  }
  return selectedItems.value.map((item) => item.label).join(", ");
});

const filteredOptions = computed(() => {
  const list = props.options ?? [];
  if (!props.filter) return list;
  const q = filterQuery.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter((opt) => resolveOptionLabel(opt).toLowerCase().includes(q));
});

const enabledFilteredOptions = computed(() =>
  filteredOptions.value.filter((opt) => !isOptionDisabled(opt)),
);

const allFilteredSelected = computed(() => {
  if (enabledFilteredOptions.value.length === 0) return false;
  return enabledFilteredOptions.value.every((opt) => isOptionSelected(opt));
});

const emptyText = computed(() => {
  if (filterQuery.value.trim()) {
    return props.emptyFilterMessage ?? props.emptyMessage ?? translate("noMatch");
  }
  return props.emptyMessage ?? translate("empty");
});

const showClearButton = computed(
  () => props.showClear && hasSelection.value && !props.disabled && !props.readonly,
);

const rootClass = computed(() => [
  "mw-multiselect",
  "p-multiselect",
  "p-component",
  "p-inputwrapper",
  "mw-control",
  "mw-select",
  `mw-multiselect--${normalizedSize.value}`,
  {
    "mw-multiselect--fluid p-multiselect-fluid": props.fluid,
    "mw-multiselect--disabled p-disabled": props.disabled,
    "mw-multiselect--readonly": props.readonly,
    "mw-multiselect--invalid p-invalid": props.invalid,
    "mw-multiselect--open p-multiselect-open p-focus": open.value,
    "mw-multiselect--chip p-multiselect-chip": props.display === "chip",
    "p-inputwrapper-filled": hasSelection.value,
    "p-inputwrapper-focus": open.value,
  },
  attrs.class,
]);

const controlAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

function findEdgeEnabledIndex(edge: "first" | "last"): number {
  const list = filteredOptions.value;
  if (!list.length) return -1;
  if (edge === "first") {
    return list.findIndex((opt) => !isOptionDisabled(opt));
  }
  for (let i = list.length - 1; i >= 0; i--) {
    if (!isOptionDisabled(list[i])) return i;
  }
  return -1;
}

function findNextEnabledIndex(current: number, step: 1 | -1): number {
  const list = filteredOptions.value;
  const len = list.length;
  if (!len) return -1;
  let idx = current;
  for (let count = 0; count < len; count++) {
    idx += step;
    if (idx < 0 || idx >= len) return current;
    if (!isOptionDisabled(list[idx])) return idx;
  }
  return current;
}

function scrollActiveIntoView() {
  nextTick(() => {
    if (activeIndex.value < 0) return;
    const item = listRef.value?.querySelectorAll<HTMLElement>('[role="option"]')[activeIndex.value];
    item?.scrollIntoView?.({ block: "nearest" });
  });
}

watch(activeIndex, scrollActiveIntoView);

watch(open, (isOpen, wasOpen) => {
  if (isOpen && !wasOpen) {
    emit("show");
  } else if (!isOpen && wasOpen) {
    filterQuery.value = "";
    activeIndex.value = -1;
    emit("hide");
  }
});

function reveal() {
  if (props.disabled || props.readonly || open.value) return;
  filterQuery.value = "";
  activeIndex.value = findEdgeEnabledIndex("first");
  openPanel();
  nextTick(() => {
    if (props.filter) {
      filterInputRef.value?.focus();
    }
  });
}

function dismiss(restoreFocus = false) {
  if (!open.value) return;
  closePanel();
  if (restoreFocus) {
    nextTick(() => rootRef.value?.focus());
  }
}

function onRootClick(event: MouseEvent) {
  if (props.disabled || props.readonly) return;
  const target = event.target as HTMLElement | null;
  if (target?.closest(".p-multiselect-clear-icon, .p-multiselect-chip-icon")) return;
  if (open.value) {
    dismiss(false);
  } else {
    reveal();
  }
}

function commitValues(nextValues: any[], originalEvent: Event) {
  emit("update:modelValue", nextValues);
  emit("change", { originalEvent, value: nextValues });
  nextTick(() => {
    if (open.value) reposition();
  });
}

function toggleOption(option: any, event: Event) {
  if (props.disabled || props.readonly || isOptionDisabled(option)) return;
  const val = resolveOptionValue(option);
  const exists = isValueSelected(val);
  const next = exists
    ? currentValues.value.filter((v) => !isSameValue(v, val))
    : [...currentValues.value, val];
  commitValues(next, event);
}

function removeValue(val: any, event: Event) {
  event.stopPropagation();
  if (props.disabled || props.readonly) return;
  const next = currentValues.value.filter((v) => !isSameValue(v, val));
  commitValues(next, event);
}

function clearSelection(event: Event) {
  event.stopPropagation();
  if (props.disabled || props.readonly) return;
  commitValues([], event);
}

function toggleAll(event: Event) {
  if (props.disabled || props.readonly) return;
  const enabledVals = enabledFilteredOptions.value.map((opt) => resolveOptionValue(opt));
  if (allFilteredSelected.value) {
    const next = currentValues.value.filter(
      (v) => !enabledVals.some((ev) => isSameValue(ev, v)),
    );
    commitValues(next, event);
  } else {
    const next = [...currentValues.value];
    for (const ev of enabledVals) {
      if (!next.some((v) => isSameValue(v, ev))) {
        next.push(ev);
      }
    }
    commitValues(next, event);
  }
}

function onFilterInput(event: Event) {
  filterQuery.value = (event.target as HTMLInputElement).value;
  activeIndex.value = findEdgeEnabledIndex("first");
}

function onOptionMousemove(index: number, option: any) {
  if (!isOptionDisabled(option)) {
    activeIndex.value = index;
  }
}

function onKeydown(event: KeyboardEvent, fromFilter = false) {
  if (props.disabled || props.readonly) return;
  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (!open.value) {
      reveal();
      return;
    }
    if (activeIndex.value < 0) {
      activeIndex.value = findEdgeEnabledIndex("first");
    } else {
      activeIndex.value = findNextEnabledIndex(activeIndex.value, 1);
    }
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    if (!open.value) {
      reveal();
      return;
    }
    if (activeIndex.value < 0) {
      activeIndex.value = findEdgeEnabledIndex("last");
    } else {
      activeIndex.value = findNextEnabledIndex(activeIndex.value, -1);
    }
  } else if (event.key === "Home" && open.value) {
    event.preventDefault();
    activeIndex.value = findEdgeEnabledIndex("first");
  } else if (event.key === "End" && open.value) {
    event.preventDefault();
    activeIndex.value = findEdgeEnabledIndex("last");
  } else if (event.key === "Enter" || (event.key === " " && !fromFilter)) {
    event.preventDefault();
    if (!open.value) {
      reveal();
      return;
    }
    const opt = filteredOptions.value[activeIndex.value];
    if (opt !== undefined && !isOptionDisabled(opt)) {
      toggleOption(opt, event);
    }
  } else if (event.key === "Escape" && open.value) {
    event.preventDefault();
    event.stopPropagation();
    dismiss(true);
  }
}

function optionKey(option: any, index: number): string {
  const val = resolveOptionValue(option);
  if (val !== null && typeof val === "object") return `obj-${index}`;
  return `${typeof val}:${String(val)}-${index}`;
}
</script>

<template>
  <div
    ref="rootRef"
    v-bind="controlAttrs"
    :id="baseId"
    :class="rootClass"
    :style="($attrs.style as any)"
    role="combobox"
    aria-haspopup="listbox"
    :aria-expanded="open ? 'true' : 'false'"
    :aria-controls="listboxId"
    :aria-activedescendant="open && activeIndex >= 0 ? optionId(activeIndex) : undefined"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    :aria-invalid="invalid || undefined"
    :aria-required="required || undefined"
    :aria-disabled="disabled || undefined"
    :aria-readonly="readonly || undefined"
    :tabindex="disabled ? -1 : 0"
    :data-state="open ? 'open' : 'closed'"
    :data-disabled="disabled ? 'true' : undefined"
    :data-readonly="readonly ? 'true' : undefined"
    :data-invalid="invalid ? 'true' : undefined"
    :data-placeholder="!hasSelection ? '' : undefined"
    @click="onRootClick"
    @keydown="onKeydown($event, false)"
  >
    <div class="mw-multiselect__label-container p-multiselect-label-container">
      <div
        class="mw-multiselect__label p-multiselect-label"
        :class="{
          'mw-multiselect__label--placeholder p-placeholder': !hasSelection,
          'mw-multiselect__label--chip p-multiselect-label-chip':
            display === 'chip' && hasSelection && !exceedsMaxLabels,
        }"
      >
        <slot name="value" :value="currentValues" :placeholder="placeholder">
          <template v-if="!hasSelection">
            {{ placeholder ?? "" }}
          </template>
          <template v-else-if="display === 'chip' && !exceedsMaxLabels">
            <span
              v-for="(item, idx) in selectedItems"
              :key="`chip-${idx}`"
              class="mw-multiselect__chip p-multiselect-chip-item p-chip"
            >
              <span class="mw-multiselect__chip-label p-chip-label">{{ item.label }}</span>
              <button
                v-if="!disabled && !readonly"
                type="button"
                class="mw-multiselect__chip-remove p-multiselect-chip-icon"
                :aria-label="translate('remove', { label: item.label })"
                @mousedown.stop.prevent
                @click.stop="removeValue(item.value, $event)"
              >
                <X aria-hidden="true" />
              </button>
            </span>
          </template>
          <template v-else>
            {{ summaryText }}
          </template>
        </slot>
      </div>
    </div>

    <button
      v-if="showClearButton"
      type="button"
      class="mw-multiselect__clear p-multiselect-clear-icon"
      :aria-label="translate('clear')"
      tabindex="-1"
      @mousedown.stop.prevent
      @click.stop="clearSelection"
    >
      <X aria-hidden="true" />
    </button>

    <span class="mw-multiselect__dropdown p-multiselect-dropdown" aria-hidden="true">
      <ChevronDown class="p-multiselect-dropdown-icon" aria-hidden="true" />
    </span>

    <Teleport to="body">
      <div
        v-if="open"
        ref="panelRef"
        class="mw-multiselect__overlay p-multiselect-overlay p-component mw-frost mw-glass"
        :style="panelStyle"
      >
        <div
          v-if="$slots.header || showToggleAll || filter"
          class="mw-multiselect__header p-multiselect-header"
        >
          <slot name="header" />
          <button
            v-if="showToggleAll"
            type="button"
            role="checkbox"
            class="mw-multiselect__toggle-all p-multiselect-toggle-all"
            :class="{ 'mw-multiselect__toggle-all--checked': allFilteredSelected }"
            :aria-checked="allFilteredSelected ? 'true' : 'false'"
            :disabled="disabled || readonly || enabledFilteredOptions.length === 0"
            @mousedown.prevent
            @click="toggleAll"
          >
            <Check v-if="allFilteredSelected" aria-hidden="true" />
          </button>
          <div v-if="filter" class="mw-multiselect__filter-container p-multiselect-filter-container">
            <input
              ref="filterInputRef"
              type="text"
              class="mw-multiselect__filter p-multiselect-filter p-inputtext mw-control mw-input"
              :value="filterQuery"
              :placeholder="filterPlaceholder"
              :aria-label="filterPlaceholder || ariaLabel"
              :aria-controls="listboxId"
              :aria-activedescendant="activeIndex >= 0 ? optionId(activeIndex) : undefined"
              autocomplete="off"
              spellcheck="false"
              @input="onFilterInput"
              @keydown.stop="onKeydown($event, true)"
            />
          </div>
        </div>

        <div
          class="mw-multiselect__list-container p-multiselect-list-container"
          :style="{ maxHeight: scrollHeight }"
        >
          <ul
            :id="listboxId"
            ref="listRef"
            role="listbox"
            aria-multiselectable="true"
            class="mw-multiselect__list p-multiselect-list"
            :aria-label="ariaLabel"
            :aria-labelledby="ariaLabelledby"
          >
            <li
              v-for="(option, index) in filteredOptions"
              :id="optionId(index)"
              :key="optionKey(option, index)"
              role="option"
              class="mw-multiselect__option p-multiselect-option"
              :class="{
                'p-multiselect-option-selected mw-multiselect__option--selected':
                  isOptionSelected(option),
                'p-focus mw-multiselect__option--highlighted': index === activeIndex,
                'p-disabled mw-multiselect__option--disabled': isOptionDisabled(option),
              }"
              :aria-label="resolveOptionLabel(option)"
              :aria-selected="isOptionSelected(option)"
              :aria-disabled="isOptionDisabled(option) || undefined"
              :data-state="isOptionSelected(option) ? 'checked' : 'unchecked'"
              :data-highlighted="index === activeIndex ? '' : undefined"
              :data-disabled="isOptionDisabled(option) ? '' : undefined"
              @mousedown.prevent
              @mousemove="onOptionMousemove(index, option)"
              @click="toggleOption(option, $event)"
            >
              <span class="mw-multiselect__checkbox p-multiselect-option-checkbox" aria-hidden="true">
                <Check v-if="isOptionSelected(option)" aria-hidden="true" />
              </span>
              <slot
                name="option"
                :option="option"
                :index="index"
                :selected="isOptionSelected(option)"
              >
                <span class="mw-multiselect__option-label">{{ resolveOptionLabel(option) }}</span>
              </slot>
            </li>
            <li
              v-if="filteredOptions.length === 0"
              role="option"
              class="mw-multiselect__empty p-multiselect-empty-message"
            >
              <slot name="empty">{{ emptyText }}</slot>
            </li>
          </ul>
        </div>

        <div v-if="$slots.footer" class="mw-multiselect__footer p-multiselect-footer">
          <slot name="footer" />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style>
.mw-multiselect {
  --_ms-min-w: calc(var(--size-lg-h) * 3);
  position: relative;
  display: inline-flex;
  align-items: center;
  min-width: var(--_ms-min-w);
  max-width: 100%;
  min-height: var(--control-h);
  cursor: pointer;
  user-select: none;
}

.mw-multiselect--fluid,
.p-multiselect-fluid {
  display: flex;
  width: 100%;
}

.mw-multiselect--disabled,
.mw-multiselect[data-disabled="true"] {
  cursor: not-allowed;
}

.mw-multiselect--readonly,
.mw-multiselect[data-readonly="true"] {
  cursor: default;
}

.mw-multiselect__label-container {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
}

.mw-multiselect__label {
  padding: var(--space-1) 0 var(--space-1) var(--control-px);
  font-size: var(--control-font);
  line-height: var(--type-body-sm-line);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mw-multiselect__label--placeholder {
  color: var(--text-tertiary);
}

.mw-multiselect__label--chip {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) 0 var(--space-1) var(--space-1-5);
}

.mw-multiselect__chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-0-5) var(--space-2);
  border-radius: var(--radius-xs);
  background-color: var(--fill-default);
  color: var(--text-primary);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
}

.mw-multiselect__chip-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
}

.mw-multiselect__chip-remove:hover {
  color: var(--text-primary);
}

.mw-multiselect__chip-remove svg {
  width: var(--icon-xs);
  height: var(--icon-xs);
}

.mw-multiselect__clear {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-lg);
  height: var(--icon-lg);
  padding: 0;
  margin-inline: var(--space-1) 0;
  border: 0;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
}

.mw-multiselect__clear:hover {
  background-color: var(--fill-default);
  color: var(--text-primary);
}

.mw-multiselect__clear svg {
  width: var(--icon-xs);
  height: var(--icon-xs);
}

.mw-multiselect__dropdown {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--size-md-h);
  color: var(--text-tertiary);
}

.mw-multiselect__dropdown svg {
  width: var(--icon-xs);
  height: var(--icon-xs);
}

.mw-multiselect--sm {
  --control-h: var(--size-sm-h);
  --control-font: var(--size-sm-font);
  --control-px: var(--size-sm-px);
  --control-radius: var(--size-sm-radius);
}

.mw-multiselect--lg {
  --control-h: var(--size-lg-h);
  --control-font: var(--size-lg-font);
  --control-px: var(--size-lg-px);
  --control-radius: var(--size-lg-radius);
}

.mw-multiselect__overlay {
  border-radius: var(--radius-float);
  box-shadow: var(--shadow-floating);
  overflow: hidden;
}

.mw-multiselect__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1-5) var(--space-2);
  border-bottom: var(--border-width) solid var(--border-subtle);
}

.mw-multiselect__toggle-all,
.mw-multiselect__checkbox {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-sm);
  height: var(--icon-sm);
  border: var(--border-width) solid var(--border-strong);
  border-radius: var(--radius-xs);
  background-color: var(--control-bg);
  color: var(--text-on-accent);
  cursor: pointer;
}

.mw-multiselect__toggle-all--checked,
.mw-multiselect__option--selected .mw-multiselect__checkbox {
  border-color: var(--accent);
  background-color: var(--accent);
}

.mw-multiselect__toggle-all svg,
.mw-multiselect__checkbox svg {
  width: var(--icon-xs);
  height: var(--icon-xs);
}

.mw-multiselect__filter-container {
  flex: 1 1 auto;
  min-width: 0;
}

.mw-multiselect__filter {
  --control-bg: var(--fill-subtle);
  --control-bg-hover: var(--fill-default);
  width: 100%;
  min-height: var(--size-sm-h);
  padding: var(--space-1) var(--space-2);
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
}

.mw-multiselect__list-container {
  overflow-y: auto;
}

.mw-multiselect__list {
  margin: 0;
  padding: var(--space-1);
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-0-5);
}

.mw-multiselect__option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--size-sm-h);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-item);
  color: var(--text-primary);
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
  cursor: pointer;
}

.mw-multiselect__option[data-highlighted]:not(.mw-multiselect__option--selected),
.mw-multiselect__option.p-focus:not(.mw-multiselect__option--selected) {
  background-color: var(--fill-default);
}

.mw-multiselect__option--selected {
  background-color: var(--fill-selected);
  color: var(--text-accent);
  font-weight: var(--weight-medium);
}

.mw-multiselect__option--selected[data-highlighted] {
  background-color: var(--fill-selected-hover);
}

.mw-multiselect__option--disabled {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
}

.mw-multiselect__option-label {
  flex: 1 1 auto;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mw-multiselect__empty {
  padding: var(--space-2) var(--space-2-5);
  color: var(--text-tertiary);
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
  text-align: center;
}

.mw-multiselect__footer {
  padding: var(--space-1-5) var(--space-2);
  border-top: var(--border-width) solid var(--border-subtle);
}
</style>
