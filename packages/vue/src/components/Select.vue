<script setup lang="ts">
import { Check, ChevronDown, LoaderCircle, X } from "lucide-vue-next";
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from "reka-ui";
import { computed, getCurrentInstance, nextTick, onMounted, ref, useAttrs, useId, watch, type CSSProperties } from "vue";
import { uiMessages } from "../locale/index.js";
import { vScrollFade } from "../lib/scroll-fade";
import { measureMaxTextWidth } from "../lib/text-fit.js";
import type {
  SelectChangeEvent,
  SelectFilterEvent,
  SelectOptionAccessor,
  SelectProps,
  SelectSize,
} from "./select-defs";

export type {
  SelectChangeEvent,
  SelectFilterEvent,
  SelectOptionAccessor,
  SelectProps,
  SelectSize,
};

defineOptions({
  name: "MwSelect",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<SelectProps>(), {
  modelValue: null,
  options: () => [],
  optionLabel: undefined,
  optionValue: undefined,
  optionDisabled: undefined,
  placeholder: undefined,
  filter: false,
  filterPlaceholder: undefined,
  showClear: false,
  allowEmpty: true,
  editable: false,
  loading: false,
  disabled: false,
  readonly: false,
  invalid: false,
  required: false,
  fluid: false,
  size: undefined,
  inputId: undefined,
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  emptyMessage: undefined,
  scrollHeight: "16rem",
  overlayStyle: undefined,
  appendTo: "body",
});

const emit = defineEmits<{
  "update:modelValue": [value: any];
  change: [event: SelectChangeEvent];
  filter: [event: SelectFilterEvent];
  "before-show": [];
  click: [event: MouseEvent];
}>();

const attrs = useAttrs();
const instance = getCurrentInstance();

function translate(key: "noMatch" | "empty" | "clear"): string {
  const globalT = (instance?.appContext.config.globalProperties as Record<string, any> | undefined)?.$t;
  const fullKey = `common.select.${key}`;
  if (typeof globalT === "function") {
    const res = globalT(fullKey);
    if (typeof res === "string" && res !== fullKey) {
      return res;
    }
  }
  return uiMessages["zh-CN"].common.select[key];
}

function isEmptyValue(val: unknown): boolean {
  return val === null || val === undefined;
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

function isOptionSelected(option: any): boolean {
  if (isEmptyValue(props.modelValue)) return false;
  return isSameValue(resolveOptionValue(option), props.modelValue);
}

const generatedId = useId();
const baseId = computed(() => props.inputId ?? props.id ?? `mw-select-${generatedId}`);
const triggerId = computed(() => (props.editable ? (props.id ?? `mw-select-${generatedId}`) : baseId.value));
const editableInputId = computed(() => props.inputId ?? `${triggerId.value}-input`);
const listboxId = computed(() => `${baseId.value}-listbox`);
const optionId = (index: number) => `${listboxId.value}-option-${index}`;

const isOpen = ref(false);
const filterQuery = ref("");
const activeIndex = ref(-1);

const triggerRef = ref<HTMLElement | null>(null);
const editableInputRef = ref<HTMLInputElement | null>(null);
const filterInputRef = ref<HTMLInputElement | null>(null);
const listboxRef = ref<HTMLElement | null>(null);

const resolvedSize = computed(() => {
  if (props.size === "sm" || props.size === "small") return "sm";
  if (props.size === "lg" || props.size === "large") return "lg";
  if (props.size === "xs" || props.size === "md") return props.size;
  return undefined;
});

const selectedOption = computed(() => {
  if (isEmptyValue(props.modelValue)) return undefined;
  return props.options.find((opt) => isSameValue(resolveOptionValue(opt), props.modelValue));
});

const hasValue = computed(() => !isEmptyValue(props.modelValue));

const hasSelectedDisplay = computed(() => {
  if (!hasValue.value) return false;
  if (selectedOption.value !== undefined) return true;
  return props.modelValue !== "";
});

const displayLabel = computed(() => {
  if (selectedOption.value !== undefined) {
    return resolveOptionLabel(selectedOption.value);
  }
  if (isEmptyValue(props.modelValue)) {
    return "";
  }
  return String(props.modelValue);
});

const showClearButton = computed(
  () =>
    props.showClear &&
    props.allowEmpty !== false &&
    hasValue.value &&
    !props.disabled &&
    !props.readonly &&
    !props.loading,
);

// 触发器宽度必须与「当前选中项」解耦，否则切换选择会拉动整行 reflow（页面漂移）。
// 量最宽可选候选文本，经 --mw-select-fit-text 交给 CSS 定死 width；不常驻镜像节点。
const fitTextWidth = ref(0);

const selectFitStyle = computed(() => ({ "--mw-select-fit-text": `${fitTextWidth.value}px` }));

function measureFitTextWidth() {
  const texts = (props.options ?? [])
    .filter((opt) => !isOptionDisabled(opt))
    .map((opt) => resolveOptionLabel(opt));
  fitTextWidth.value = measureMaxTextWidth(triggerRef.value, texts);
}

watch(
  () => [props.options, props.optionLabel] as const,
  () => nextTick(measureFitTextWidth),
  { immediate: true },
);

onMounted(() => {
  measureFitTextWidth();
  document.fonts?.ready.then(measureFitTextWidth).catch(() => {});
});

const filteredOptions = computed(() => {
  const list = props.options ?? [];
  if (!props.filter) return list;
  const q = filterQuery.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter((opt) => resolveOptionLabel(opt).toLowerCase().includes(q));
});

const emptyText = computed(() => {
  if (props.emptyMessage) return props.emptyMessage;
  return filterQuery.value.trim() ? translate("noMatch") : translate("empty");
});

const portalTo = computed(() => {
  if (!props.appendTo || props.appendTo === "self") return "body";
  return props.appendTo;
});

const panelMergedStyle = computed<CSSProperties | string | undefined>(() => {
  if (typeof props.overlayStyle === "string") {
    return props.overlayStyle;
  }
  return props.overlayStyle as CSSProperties | undefined;
});

const rootClass = computed(() => [
  "mw-select",
  "mw-control",
  resolvedSize.value ? [`mw-select--${resolvedSize.value}`, `mw-size-${resolvedSize.value}`] : undefined,
  {
    "mw-select--fluid": props.fluid,
    "mw-select--disabled": props.disabled,
    "mw-select--readonly": props.readonly,
    "mw-select--invalid": props.invalid,
    "mw-select--loading": props.loading,
    "mw-select--open": isOpen.value,
    "mw-select--editable": props.editable,
    "mw-select--clearable": props.showClear && props.allowEmpty !== false,
  },
  attrs.class,
]);

const triggerAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

function findInitialActiveIndex(): number {
  const list = filteredOptions.value;
  if (!list.length) return -1;
  const selectedIdx = list.findIndex((opt) => isOptionSelected(opt) && !isOptionDisabled(opt));
  if (selectedIdx >= 0) return selectedIdx;
  return list.findIndex((opt) => !isOptionDisabled(opt));
}

function findNextEnabledIndex(current: number, step: 1 | -1): number {
  const list = filteredOptions.value;
  const len = list.length;
  if (!len) return -1;
  let idx = current;
  for (let count = 0; count < len; count++) {
    idx += step;
    if (idx < 0 || idx >= len) {
      return current;
    }
    if (!isOptionDisabled(list[idx])) {
      return idx;
    }
  }
  return current;
}

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

function scrollActiveIntoView() {
  nextTick(() => {
    if (activeIndex.value < 0) return;
    const item = listboxRef.value?.querySelectorAll<HTMLElement>('[role="option"]')[activeIndex.value];
    item?.scrollIntoView?.({ block: "nearest" });
  });
}

watch(activeIndex, scrollActiveIntoView);

function openPanel() {
  if (props.disabled || props.readonly || props.loading) return;
  if (isOpen.value) return;
  emit("before-show");
  filterQuery.value = "";
  isOpen.value = true;
  activeIndex.value = findInitialActiveIndex();
  scrollActiveIntoView();
}

function closePanel(restoreFocus = false) {
  if (!isOpen.value) return;
  isOpen.value = false;
  filterQuery.value = "";
  activeIndex.value = -1;
  if (restoreFocus) {
    nextTick(() => {
      if (props.editable) {
        editableInputRef.value?.focus();
      } else {
        triggerRef.value?.focus();
      }
    });
  }
}

function handleOpenChange(nextOpen: boolean) {
  if (nextOpen) {
    openPanel();
  } else {
    closePanel(false);
  }
}

function onOpenAutoFocus(event: Event) {
  event.preventDefault();
  if (props.filter) {
    nextTick(() => {
      filterInputRef.value?.focus();
    });
  }
}

function onCloseAutoFocus(event: Event) {
  event.preventDefault();
}

function onTriggerClick(event: MouseEvent) {
  if (props.disabled) return;
  emit("click", event);
}

function commitValue(nextVal: any, originalEvent?: Event) {
  emit("update:modelValue", nextVal);
  emit("change", { value: nextVal, originalEvent });
}

function selectOption(option: any, originalEvent?: Event) {
  if (props.disabled || props.readonly || isOptionDisabled(option)) return;
  const nextVal = resolveOptionValue(option);
  commitValue(nextVal, originalEvent);
  closePanel(true);
}

function onOptionClick(option: any, event: MouseEvent) {
  selectOption(option, event);
}

function onOptionMousemove(index: number, option: any) {
  if (!isOptionDisabled(option)) {
    activeIndex.value = index;
  }
}

function onClear(event: MouseEvent) {
  event.stopPropagation();
  if (props.disabled || props.readonly || props.allowEmpty === false) return;
  commitValue(null, event);
  closePanel(true);
}

function onEditableInput(event: Event) {
  if (props.disabled || props.readonly) return;
  const nextVal = (event.target as HTMLInputElement).value;
  commitValue(nextVal, event);
}

function onFilterInput(event: Event) {
  const nextQuery = (event.target as HTMLInputElement).value;
  filterQuery.value = nextQuery;
  emit("filter", { value: nextQuery, originalEvent: event });
  activeIndex.value = findEdgeEnabledIndex("first");
}

function handleNavigationKeydown(event: KeyboardEvent, fromInput = false) {
  if (props.disabled || props.readonly || props.loading) return;

  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (!isOpen.value) {
      openPanel();
      return;
    }
    if (activeIndex.value < 0) {
      activeIndex.value = findEdgeEnabledIndex("first");
    } else {
      activeIndex.value = findNextEnabledIndex(activeIndex.value, 1);
    }
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    if (!isOpen.value) {
      openPanel();
      return;
    }
    if (activeIndex.value < 0) {
      activeIndex.value = findEdgeEnabledIndex("last");
    } else {
      activeIndex.value = findNextEnabledIndex(activeIndex.value, -1);
    }
  } else if (event.key === "Home") {
    if (isOpen.value) {
      event.preventDefault();
      activeIndex.value = findEdgeEnabledIndex("first");
    }
  } else if (event.key === "End") {
    if (isOpen.value) {
      event.preventDefault();
      activeIndex.value = findEdgeEnabledIndex("last");
    }
  } else if (event.key === "Enter") {
    event.preventDefault();
    if (!isOpen.value) {
      openPanel();
      return;
    }
    const option = filteredOptions.value[activeIndex.value];
    if (option !== undefined && !isOptionDisabled(option)) {
      selectOption(option, event);
    }
  } else if (event.key === " " && !fromInput) {
    event.preventDefault();
    if (!isOpen.value) {
      openPanel();
      return;
    }
    const option = filteredOptions.value[activeIndex.value];
    if (option !== undefined && !isOptionDisabled(option)) {
      selectOption(option, event);
    }
  } else if (event.key === "Escape") {
    if (isOpen.value) {
      event.preventDefault();
      event.stopPropagation();
      closePanel(true);
    }
  }
}

function onTriggerKeydown(event: KeyboardEvent) {
  const isInputTarget = (event.target as HTMLElement | null)?.tagName === "INPUT";
  handleNavigationKeydown(event, isInputTarget);
}

function onFilterKeydown(event: KeyboardEvent) {
  handleNavigationKeydown(event, true);
}

function onPanelKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented) return;
  const isInputTarget = (event.target as HTMLElement | null)?.tagName === "INPUT";
  handleNavigationKeydown(event, isInputTarget);
}

function onEscapeKeyDown(event: KeyboardEvent) {
  event.stopPropagation();
  closePanel(true);
}

function optionKey(option: any, index: number): string {
  const val = resolveOptionValue(option);
  if (val !== null && typeof val === "object") {
    return `obj-${index}`;
  }
  return `${typeof val}:${String(val)}-${index}`;
}
</script>

<template>
  <PopoverRoot :open="isOpen" @update:open="handleOpenChange">
    <PopoverTrigger as-child as="div">
      <div
        ref="triggerRef"
        v-bind="triggerAttrs"
        :id="triggerId"
        :class="rootClass"
        :style="[($attrs.style as any), selectFitStyle]"
        :role="editable ? undefined : 'combobox'"
        :aria-haspopup="editable ? undefined : 'listbox'"
        :aria-expanded="editable ? undefined : isOpen"
        :aria-controls="editable ? undefined : listboxId"
        :aria-activedescendant="!editable && isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined"
        :aria-label="editable ? undefined : ariaLabel"
        :aria-labelledby="editable ? undefined : ariaLabelledby"
        :aria-describedby="editable ? undefined : ariaDescribedby"
        :aria-invalid="!editable ? (invalid || undefined) : undefined"
        :aria-required="!editable ? (required || undefined) : undefined"
        :aria-disabled="!editable ? (disabled || undefined) : undefined"
        :aria-readonly="!editable ? (readonly || undefined) : undefined"
        :tabindex="editable || disabled ? -1 : 0"
        :data-state="isOpen ? 'open' : 'closed'"
        :data-disabled="disabled ? 'true' : undefined"
        :data-readonly="readonly ? 'true' : undefined"
        :data-invalid="invalid ? 'true' : undefined"
        :data-loading="loading ? 'true' : undefined"
        :data-placeholder="!hasSelectedDisplay ? '' : undefined"
        :data-size="resolvedSize"
        @click="onTriggerClick"
        @keydown="onTriggerKeydown"
      >
        <input
          v-if="editable"
          :id="editableInputId"
          ref="editableInputRef"
          type="text"
          class="mw-select__input"
          :value="displayLabel"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :required="required"
          role="combobox"
          aria-haspopup="listbox"
          :aria-expanded="isOpen"
          :aria-controls="listboxId"
          :aria-activedescendant="isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined"
          :aria-label="ariaLabel"
          :aria-labelledby="ariaLabelledby"
          :aria-describedby="ariaDescribedby"
          :aria-invalid="invalid || undefined"
          autocomplete="off"
          spellcheck="false"
          @click.stop
          @input="onEditableInput"
          @keydown.stop="onTriggerKeydown"
        />
        <span
          v-else
          class="mw-select__label"
          :class="{ 'mw-select__label--placeholder': !hasSelectedDisplay }"
        >
          <slot name="value" :value="modelValue" :placeholder="placeholder">
            {{ hasSelectedDisplay ? displayLabel : (placeholder ?? "") }}
          </slot>
        </span>

        <button
          v-if="showClearButton"
          type="button"
          class="mw-select__clear"
          :aria-label="translate('clear')"
          tabindex="-1"
          @mousedown.stop.prevent
          @click.stop="onClear"
        >
          <X class="mw-select__clear-icon" aria-hidden="true" />
        </button>

        <span class="mw-select__dropdown" aria-hidden="true">
          <LoaderCircle v-if="loading" class="mw-select__spinner" />
          <ChevronDown v-else class="mw-select__chevron" />
        </span>
      </div>
    </PopoverTrigger>

    <PopoverPortal :to="portalTo" :disabled="appendTo === 'self'">
      <PopoverContent
        class="mw-select__panel mw-frost mw-scroll-scope"
        :style="panelMergedStyle"
        :side-offset="4"
        align="start"
        @open-auto-focus="onOpenAutoFocus"
        @close-auto-focus="onCloseAutoFocus"
        @escape-key-down="onEscapeKeyDown"
        @keydown="onPanelKeydown"
      >
        <div v-if="$slots.header" class="mw-select__header">
          <slot name="header" />
        </div>

        <div v-if="filter" class="mw-select__filter-wrap">
          <input
            ref="filterInputRef"
            type="text"
            class="mw-select__filter-input mw-control mw-input"
            :value="filterQuery"
            :placeholder="filterPlaceholder"
            :aria-label="filterPlaceholder || ariaLabel"
            :aria-controls="listboxId"
            :aria-activedescendant="activeIndex >= 0 ? optionId(activeIndex) : undefined"
            autocomplete="off"
            spellcheck="false"
            @input="onFilterInput"
            @keydown.stop="onFilterKeydown"
          />
        </div>

        <ul
          :id="listboxId"
          ref="listboxRef"
          v-scroll-fade.sm
          role="listbox"
          class="mw-select__list mw-scroll"
          :style="{ maxHeight: scrollHeight }"
          :aria-label="ariaLabel"
          :aria-labelledby="ariaLabelledby"
        >
          <li
            v-for="(option, index) in filteredOptions"
            :id="optionId(index)"
            :key="optionKey(option, index)"
            role="option"
            class="mw-select__option"
            :class="{
              'mw-select__option--selected': isOptionSelected(option),
              'mw-select__option--highlighted': index === activeIndex,
              'mw-select__option--disabled': isOptionDisabled(option),
            }"
            :aria-selected="isOptionSelected(option)"
            :aria-disabled="isOptionDisabled(option) || undefined"
            :data-state="isOptionSelected(option) ? 'checked' : 'unchecked'"
            :data-highlighted="index === activeIndex ? '' : undefined"
            :data-disabled="isOptionDisabled(option) ? '' : undefined"
            @mousemove="onOptionMousemove(index, option)"
            @mousedown.prevent
            @click="onOptionClick(option, $event)"
          >
            <span class="mw-select__option-label">
              <slot
                name="option"
                :option="option"
                :index="index"
                :selected="isOptionSelected(option)"
              >
                {{ resolveOptionLabel(option) }}
              </slot>
            </span>
            <Check v-if="isOptionSelected(option)" class="mw-select__check" aria-hidden="true" />
          </li>

          <li v-if="filteredOptions.length === 0" class="mw-select__empty" role="presentation">
            <slot name="empty">
              {{ emptyText }}
            </slot>
          </li>
        </ul>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
