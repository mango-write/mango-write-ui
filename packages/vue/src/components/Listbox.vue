<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, ref, useAttrs, useId, watch } from "vue";
import { vScrollFade } from "../lib/scroll-fade";
import { uiMessages } from "../locale/index.js";
import type {
  ListboxChangeEvent,
  ListboxOptionAccessor,
  ListboxProps,
} from "./listbox-defs";

export type {
  ListboxChangeEvent,
  ListboxOptionAccessor,
  ListboxProps,
};

defineOptions({
  name: "Listbox",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<ListboxProps>(), {
  modelValue: undefined,
  options: () => [],
  optionLabel: undefined,
  optionValue: undefined,
  optionDisabled: undefined,
  multiple: false,
  filter: false,
  filterPlaceholder: undefined,
  emptyMessage: undefined,
  emptyFilterMessage: undefined,
  listStyle: undefined,
  disabled: false,
  readonly: false,
  required: false,
  invalid: false,
  inputId: undefined,
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
});

const emit = defineEmits<{
  "update:modelValue": [value: any];
  change: [event: ListboxChangeEvent];
}>();

const attrs = useAttrs();
const instance = getCurrentInstance();

function translate(key: "noMatch" | "empty"): string {
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
  const val = resolveOptionValue(option);
  if (props.multiple) {
    const arr = Array.isArray(props.modelValue) ? props.modelValue : [];
    return arr.some((item) => isSameValue(item, val));
  }
  if (props.modelValue === null || props.modelValue === undefined) return false;
  return isSameValue(val, props.modelValue);
}

const generatedId = useId();
const baseId = computed(() => props.inputId ?? props.id ?? `mw-listbox-${generatedId}`);
const listboxId = computed(() => `${baseId.value}-list`);
const optionId = (index: number) => `${listboxId.value}-option-${index}`;

const listRef = ref<HTMLElement | null>(null);
const filterQuery = ref("");
const activeIndex = ref(-1);

const filteredOptions = computed(() => {
  const list = props.options ?? [];
  if (!props.filter) return list;
  const q = filterQuery.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter((opt) => resolveOptionLabel(opt).toLowerCase().includes(q));
});

const emptyText = computed(() => {
  if (filterQuery.value.trim()) {
    return props.emptyFilterMessage ?? props.emptyMessage ?? translate("noMatch");
  }
  return props.emptyMessage ?? translate("empty");
});

const rootClass = computed(() => [
  "mw-listbox",
  "mw-control",
  {
    "mw-listbox--disabled": props.disabled,
    "mw-listbox--readonly": props.readonly,
    "mw-listbox--invalid": props.invalid,
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

function selectOption(option: any, index: number, event: Event) {
  if (props.disabled || props.readonly || isOptionDisabled(option)) return;
  activeIndex.value = index;
  const val = resolveOptionValue(option);
  if (props.multiple) {
    const arr = Array.isArray(props.modelValue) ? props.modelValue : [];
    const exists = arr.some((item) => isSameValue(item, val));
    const next = exists ? arr.filter((item) => !isSameValue(item, val)) : [...arr, val];
    emit("update:modelValue", next);
    emit("change", { originalEvent: event, value: next });
  } else {
    emit("update:modelValue", val);
    emit("change", { originalEvent: event, value: val });
  }
}

function onOptionMousemove(index: number, option: any) {
  if (!isOptionDisabled(option)) {
    activeIndex.value = index;
  }
}

function onFilterInput(event: Event) {
  filterQuery.value = (event.target as HTMLInputElement).value;
  activeIndex.value = findEdgeEnabledIndex("first");
}

function onKeydown(event: KeyboardEvent, fromFilter = false) {
  if (props.disabled || props.readonly) return;
  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (activeIndex.value < 0) {
      activeIndex.value = findEdgeEnabledIndex("first");
    } else {
      activeIndex.value = findNextEnabledIndex(activeIndex.value, 1);
    }
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    if (activeIndex.value < 0) {
      activeIndex.value = findEdgeEnabledIndex("last");
    } else {
      activeIndex.value = findNextEnabledIndex(activeIndex.value, -1);
    }
  } else if (event.key === "Home") {
    event.preventDefault();
    activeIndex.value = findEdgeEnabledIndex("first");
  } else if (event.key === "End") {
    event.preventDefault();
    activeIndex.value = findEdgeEnabledIndex("last");
  } else if (event.key === "Enter" || (event.key === " " && !fromFilter)) {
    event.preventDefault();
    const idx = activeIndex.value >= 0 ? activeIndex.value : findEdgeEnabledIndex("first");
    const opt = filteredOptions.value[idx];
    if (opt !== undefined && !isOptionDisabled(opt)) {
      selectOption(opt, idx, event);
    }
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
    :id="baseId"
    :class="rootClass"
    :style="($attrs.style as any)"
    :data-disabled="disabled ? 'true' : undefined"
    :data-readonly="readonly ? 'true' : undefined"
    :data-invalid="invalid ? 'true' : undefined"
  >
    <div v-if="$slots.header || filter" class="mw-listbox__header">
      <slot name="header" />
      <div v-if="filter" class="mw-listbox__filter-container">
        <input
          type="text"
          class="mw-listbox__filter mw-control mw-input"
          :value="filterQuery"
          :placeholder="filterPlaceholder"
          :disabled="disabled"
          :readonly="readonly"
          :aria-label="filterPlaceholder || ariaLabel"
          :aria-controls="listboxId"
          autocomplete="off"
          spellcheck="false"
          @input="onFilterInput"
          @keydown="onKeydown($event, true)"
        />
      </div>
    </div>

    <div v-scroll-fade.sm class="mw-listbox__list-container mw-scroll" :style="(listStyle as any)">
      <ul
        :id="listboxId"
        ref="listRef"
        v-bind="controlAttrs"
        role="listbox"
        class="mw-listbox__list"
        :aria-multiselectable="multiple ? 'true' : undefined"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="ariaDescribedby"
        :aria-invalid="invalid || undefined"
        :aria-required="required || undefined"
        :aria-disabled="disabled || undefined"
        :aria-readonly="readonly || undefined"
        :aria-activedescendant="activeIndex >= 0 ? optionId(activeIndex) : undefined"
        :tabindex="disabled ? -1 : 0"
        @keydown="onKeydown($event, false)"
      >
        <li
          v-for="(option, index) in filteredOptions"
          :id="optionId(index)"
          :key="optionKey(option, index)"
          role="option"
          class="mw-listbox__option"
          :class="{
            'mw-listbox__option--selected': isOptionSelected(option),
            'mw-listbox__option--highlighted': index === activeIndex,
            'mw-listbox__option--disabled': isOptionDisabled(option),
          }"
          :aria-label="resolveOptionLabel(option)"
          :aria-selected="isOptionSelected(option)"
          :aria-disabled="isOptionDisabled(option) || undefined"
          :data-state="isOptionSelected(option) ? 'checked' : 'unchecked'"
          :data-highlighted="index === activeIndex ? '' : undefined"
          :data-disabled="isOptionDisabled(option) ? '' : undefined"
          @mousemove="onOptionMousemove(index, option)"
          @click="selectOption(option, index, $event)"
        >
          <slot
            name="option"
            :option="option"
            :index="index"
            :selected="isOptionSelected(option)"
          >
            {{ resolveOptionLabel(option) }}
          </slot>
        </li>
        <li
          v-if="filteredOptions.length === 0"
          role="option"
          class="mw-listbox__empty"
        >
          <slot name="empty">{{ emptyText }}</slot>
        </li>
      </ul>
    </div>

    <div v-if="$slots.footer" class="mw-listbox__footer">
      <slot name="footer" />
    </div>
  </div>
</template>
