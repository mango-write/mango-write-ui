<script setup lang="ts">
import { computed, ref, useAttrs } from "vue";
import { readMpInputValue } from "../lib/mp-dom.js";
import MpIcon from "./MpIcon.vue";

defineOptions({
  name: "MwMpSearchBar",
  inheritAttrs: false,
  options: { styleIsolation: "shared", virtualHost: true },
} as any);

export interface MpSearchBarProps {
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  clearLabel?: string;
  ariaLabel?: string;
}

const props = withDefaults(defineProps<MpSearchBarProps>(), {
  modelValue: "",
  placeholder: "搜索…",
  disabled: false,
  clearable: true,
  clearLabel: "清空搜索",
  ariaLabel: "搜索",
});
const emit = defineEmits<{
  "update:modelValue": [value: string];
  search: [value: string];
  clear: [];
}>();
const attrs = useAttrs();
const composing = ref(false);
const focused = ref(false);
const inputAttrs = computed<Record<string, any>>(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

function onInput(event: unknown): void {
  if (!composing.value) emit("update:modelValue", readMpInputValue(event));
}
function onCompositionEnd(event: unknown): void {
  composing.value = false;
  emit("update:modelValue", readMpInputValue(event));
}
function onClear(): void {
  if (props.disabled) return;
  emit("update:modelValue", "");
  emit("clear");
}
function onKeydown(event: KeyboardEvent): void {
  if (event.key === "Enter" && !composing.value) emit("search", props.modelValue);
}
</script>

<template>
  <div class="mw-mp-search" :class="$attrs.class" :style="($attrs.style as any)">
    <div
      class="mw-mp-search__field"
      :class="{ 'is-focused': focused, 'is-disabled': disabled }"
      :data-focused="focused ? 'true' : undefined"
      :data-disabled="disabled ? 'true' : undefined"
    >
      <MpIcon name="search" :size="22" />
      <input
        :name="inputAttrs.name"
        :autocomplete="inputAttrs.autocomplete"
        :inputmode="inputAttrs.inputmode"
        :enterkeyhint="inputAttrs.enterkeyhint"
        :aria-labelledby="inputAttrs['aria-labelledby']"
        :aria-describedby="inputAttrs['aria-describedby']"
        :aria-hidden="inputAttrs['aria-hidden']"
        :data-testid="inputAttrs['data-testid'] || 'mp-search-input'"
        type="search"
        class="mw-mp-search__input"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-label="ariaLabel || placeholder"
        @input="onInput"
        @focus="focused = true"
        @blur="focused = false"
        @compositionstart="composing = true"
        @compositionend="onCompositionEnd"
        @keydown="onKeydown"
      />
      <button
        v-if="clearable && modelValue && !disabled"
        type="button"
        class="mw-mp-search__clear"
        hover-class="is-pressed"
        :aria-label="clearLabel"
        data-testid="mp-search-clear"
        @click="onClear"
      >
        <MpIcon name="close" :size="18" />
      </button>
    </div>
    <slot name="action" />
  </div>
</template>
