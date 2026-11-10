<script setup lang="ts">
import { useAttrs } from "vue";

defineOptions({
  name: "MwMpSwitch",
  inheritAttrs: true,
  options: { styleIsolation: "shared", virtualHost: false },
} as any);
const attrs = useAttrs();

export interface MpSwitchProps {
  modelValue?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  dataTestid?: string;
}

const props = withDefaults(defineProps<MpSwitchProps>(), {
  modelValue: false,
  disabled: false,
  ariaLabel: undefined,
  dataTestid: undefined,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  change: [value: boolean];
}>();

function toggle(): void {
  if (props.disabled) return;
  const next = !props.modelValue;
  emit("update:modelValue", next);
  emit("change", next);
}
</script>

<template>
  <button
    type="button"
    role="switch"
    class="mw-mp-switch"
    :class="{
      'mw-mp-switch--checked is-checked': modelValue,
      'is-disabled': disabled,
    }"
    :disabled="disabled"
    :hover-class="disabled ? 'none' : 'is-pressed'"
    :aria-checked="modelValue ? 'true' : 'false'"
    :aria-label="ariaLabel"
    :data-testid="dataTestid || (attrs['data-testid'] as string | undefined)"
    @click="toggle"
  >
    <span class="mw-mp-switch__thumb" aria-hidden="true" />
  </button>
</template>
