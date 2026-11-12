<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from "vue";
import { ChevronDown, LoaderCircle, X } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import { vScrollFade } from "../lib/scroll-fade";
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
      '[role="option"]:not(.mw-ass-empty)',
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
  if (target?.closest(".mw-ass-dropdown, .mw-ass-clear")) return;
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
    class="mw-ass mw-control"
    :class="{
      'mw-ass--fluid': fluid,
      'mw-ass--disabled': disabled,
      'mw-ass--open': open || focused,
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
      class="mw-ass-input mw-input"
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

    <LoaderCircle
      v-if="loading"
      class="mw-ass-loader mw-icon--spin"
      aria-hidden="true"
    />

    <button
      v-if="showClearButton"
      type="button"
      class="mw-ass-clear"
      :aria-label="t('common.select.clear')"
      @mousedown.stop.prevent
      @click.stop="onClearClick"
    >
      <X aria-hidden="true" />
    </button>

    <button
      type="button"
      class="mw-ass-dropdown"
      :disabled="disabled"
      tabindex="-1"
      aria-hidden="true"
      @mousedown.stop.prevent
      @click.stop="onDropdownClick"
    >
      <ChevronDown aria-hidden="true" />
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        ref="panelRef"
        class="mw-ass-overlay mw-frost mw-glass"
        :style="panelStyle"
        @mousedown.prevent
      >
        <div v-scroll-fade.sm class="mw-ass-list-container mw-scroll">
          <ul
            :id="listboxId"
            role="listbox"
            class="mw-ass-list"
            :aria-label="ariaLabel"
          >
            <li
              v-for="(option, i) in suggestions"
              :id="optionId(i)"
              :key="option.value"
              role="option"
              class="mw-ass-option"
              :class="{
                'mw-ass-option--selected': option.value === modelValue,
                'mw-ass-option--highlighted': i === activeIndex,
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
              class="mw-ass-empty"
            >
              <span class="mw-ass-note">{{ loading ? loadingMessageText : emptyMessageText }}</span>
            </li>
          </ul>
        </div>
      </div>
    </Teleport>
  </div>
</template>
