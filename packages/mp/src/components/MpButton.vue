<script setup lang="ts">
import { computed } from "vue";
import MpIcon from "./MpIcon.vue";

defineOptions({
  name: "MwMpButton",
  inheritAttrs: true,
  options: { styleIsolation: "shared", virtualHost: false },
} as any);

export type MpButtonVariant = "solid" | "tinted" | "outlined" | "text";
export type MpButtonSeverity = "primary" | "secondary" | "danger";
export type MpButtonSize = "sm" | "md" | "lg";

export interface MpButtonProps {
  label?: string;
  size?: MpButtonSize;
  variant?: MpButtonVariant;
  severity?: MpButtonSeverity;
  block?: boolean;
  iconOnly?: boolean;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  ariaLabel?: string;
  dataTestid?: string;
}

const props = withDefaults(defineProps<MpButtonProps>(), {
  label: undefined,
  size: "md",
  variant: "solid",
  severity: "primary",
  block: false,
  iconOnly: false,
  disabled: false,
  loading: false,
  type: "button",
  ariaLabel: undefined,
  dataTestid: undefined,
});

const emit = defineEmits<{ click: [event: MouseEvent] }>();
const isDisabled = computed(() => props.disabled || props.loading);
const rootClasses = computed(() => [
  "mw-mp-btn",
  `mw-size-${props.size}`,
  `mw-mp-btn--${props.variant}`,
  `mw-mp-btn--${props.severity}`,
  {
    "mw-mp-btn--block": props.block,
    "mw-mp-btn--icon-only": props.iconOnly,
    "is-disabled": isDisabled.value,
    "is-loading": props.loading,
  },
]);

function onClick(event: MouseEvent): void {
  if (isDisabled.value) {
    event.preventDefault();
    return;
  }
  emit("click", event);
}
</script>

<template>
  <button
    :data-testid="dataTestid || ($attrs['data-testid'] as string | undefined)"
    :type="type"
    :class="rootClasses"
    :disabled="isDisabled"
    :hover-class="isDisabled ? 'none' : 'is-pressed'"
    :data-disabled="isDisabled ? 'true' : undefined"
    :data-loading="loading ? 'true' : undefined"
    :aria-busy="loading ? 'true' : undefined"
    :aria-label="ariaLabel || label"
    @click="onClick"
  >
    <MpIcon v-if="loading" name="loading" :size="22" spin class="mw-mp-btn__spinner" />
    <slot>
      <span v-if="label">{{ label }}</span>
    </slot>
  </button>
</template>
