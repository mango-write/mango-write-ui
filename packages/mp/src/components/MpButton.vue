<script setup lang="ts">
import { computed } from "vue";
import MpIcon from "./MpIcon.vue";

defineOptions({
  name: "MwMpButton",
  inheritAttrs: true,
  options: { styleIsolation: "shared", virtualHost: false },
} as any);

export type MpButtonVariant = "filled" | "tinted" | "outlined" | "text";
export type MpButtonSeverity =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warn"
  | "warning"
  | "danger"
  | "contrast";
export type MpButtonSize = "sm" | "md" | "lg";

export interface MpButtonProps {
  label?: string;
  size?: MpButtonSize;
  variant?: MpButtonVariant;
  severity?: MpButtonSeverity;
  outlined?: boolean;
  text?: boolean;
  raised?: boolean;
  fluid?: boolean;
  /** @deprecated 使用与桌面端对齐的 `fluid` */
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
  variant: undefined,
  severity: "primary",
  outlined: false,
  text: false,
  raised: false,
  fluid: false,
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
const resolvedVariant = computed<MpButtonVariant>(() => {
  if (props.variant) return props.variant;
  if (props.text) return "text";
  if (props.outlined) return "outlined";
  return "filled";
});
const resolvedSeverity = computed(() => (props.severity === "warn" ? "warning" : props.severity));
const isFluid = computed(() => Boolean(props.fluid || props.block));

const rootClasses = computed(() => [
  "mw-mp-btn",
  `mw-size-${props.size}`,
  `mw-mp-btn--${resolvedVariant.value}`,
  `mw-mp-btn--${resolvedSeverity.value}`,
  {
    "mw-mp-btn--fluid": isFluid.value,
    "mw-mp-btn--block": isFluid.value,
    "mw-mp-btn--raised": props.raised,
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
