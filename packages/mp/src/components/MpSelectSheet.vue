<script setup lang="ts">
import { computed, useAttrs } from "vue";
import {
  isSameValue,
  resolveOptionDisabled,
  resolveOptionLabel,
  resolveOptionValue,
} from "@mango-write/ui-core/headless/option-accessor";
import MpCell from "./MpCell.vue";
import MpCellGroup from "./MpCellGroup.vue";
import MpSheet from "./MpSheet.vue";

defineOptions({
  name: "MwMpSelectSheet",
  inheritAttrs: true,
  options: { styleIsolation: "shared", virtualHost: false },
} as any);
const attrs = useAttrs();

export interface MpSelectSheetProps {
  open?: boolean;
  title?: string;
  subtitle?: string;
  contained?: boolean;
  modelValue?: unknown;
  options: readonly unknown[];
  optionLabel?: string | ((option: unknown) => string);
  optionValue?: string | ((option: unknown) => unknown);
  optionDisabled?: string | ((option: unknown) => boolean);
  optionTestid?: string;
}

const props = withDefaults(defineProps<MpSelectSheetProps>(), {
  open: false,
  title: "请选择",
  subtitle: undefined,
  contained: false,
  optionLabel: "label",
  optionValue: "value",
  optionDisabled: "disabled",
  optionTestid: "mp-select-option",
});
const emit = defineEmits<{
  "update:open": [value: boolean];
  "update:modelValue": [value: unknown];
  select: [option: unknown, value: unknown];
}>();
const normalizedItems = computed(() =>
  props.options.map((raw, index) => {
    const obj = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : null;
    const value = resolveOptionValue(raw, props.optionValue);
    return {
      key: `${String(value ?? index)}-${index}`,
      raw,
      value,
      label: resolveOptionLabel(raw, props.optionLabel),
      disabled: resolveOptionDisabled(raw, props.optionDisabled),
      subtitle: typeof obj?.subtitle === "string" ? obj.subtitle : undefined,
      meta: typeof obj?.meta === "string" ? obj.meta : undefined,
      selected: isSameValue(value, props.modelValue),
    };
  }),
);

function pickItem(item: (typeof normalizedItems.value)[number]): void {
  if (item.disabled) return;
  emit("update:modelValue", item.value);
  emit("select", item.raw, item.value);
  emit("update:open", false);
}
</script>

<template>
  <MpSheet
    :data-testid="attrs['data-testid']"
    :open="open"
    :title="title"
    :subtitle="subtitle"
    :contained="contained"
    @update:open="emit('update:open', $event)"
  >
    <MpCellGroup role="listbox" :aria-label="title">
      <MpCell
        v-for="item in normalizedItems"
        :key="item.key"
        :title="item.label"
        :subtitle="item.subtitle"
        :meta="item.meta"
        selectable
        :disabled="item.disabled"
        :selected="item.selected"
        :data-testid="`${optionTestid}-${String(item.value)}`"
        @click="pickItem(item)"
      />
    </MpCellGroup>
    <slot />
  </MpSheet>
</template>
