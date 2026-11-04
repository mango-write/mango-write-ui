<script setup lang="ts">
import { computed, ref, useAttrs, watch, type StyleValue } from "vue";
import { TabsRoot } from "reka-ui";
import type { TabsEmits, TabsProps, TabValue } from "./tabs.js";

defineOptions({
  name: "MwTabs",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<TabsProps>(), {
  modelValue: undefined,
  value: undefined,
  defaultValue: undefined,
  orientation: "horizontal",
  activationMode: "automatic",
  unmountOnHide: true,
});

const emit = defineEmits<TabsEmits>();
const attrs = useAttrs();

const internalValue = ref<TabValue | undefined>(
  props.modelValue ?? props.value ?? props.defaultValue,
);

watch(
  () => props.modelValue,
  (val) => {
    if (val !== undefined) {
      internalValue.value = val;
    }
  },
  { flush: "sync" },
);

watch(
  () => props.value,
  (val) => {
    if (val !== undefined) {
      internalValue.value = val;
    }
  },
  { flush: "sync" },
);

const activeValue = computed<TabValue | undefined>(
  () => props.modelValue ?? internalValue.value ?? props.value ?? props.defaultValue,
);

function onUpdateModelValue(val: TabValue) {
  internalValue.value = val;
  emit("update:modelValue", val);
  emit("update:value", val);
}

const rootClass = computed(() => [
  "mw-tabs",
  `mw-tabs--${props.orientation}`,
  attrs.class,
]);
const rootStyle = computed<StyleValue>(() => attrs.style as StyleValue);
const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});
</script>

<template>
  <TabsRoot
    v-bind="rootAttrs"
    :class="rootClass"
    :style="rootStyle"
    :model-value="activeValue"
    :default-value="defaultValue"
    :orientation="orientation"
    :activation-mode="activationMode"
    :unmount-on-hide="unmountOnHide"
    @update:model-value="onUpdateModelValue"
  >
    <slot :value="activeValue" />
  </TabsRoot>
</template>

<style scoped>
.mw-tabs {
  display: flex;
  flex-direction: column;
  width: 100%;
  font-family: var(--font-sans);
}

.mw-tabs--vertical {
  flex-direction: row;
  gap: var(--space-4);
}
</style>
