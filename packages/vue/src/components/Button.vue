<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue";
import { LoaderCircle } from "lucide-vue-next";
import type { ButtonProps } from "./button-defs.js";

defineOptions({
  name: "MwButton",
  inheritAttrs: false,
});

export type {
  ButtonIconPosition,
  ButtonProps,
  ButtonSeverity,
  ButtonSize,
  ButtonVariant,
  NativeButtonType,
} from "./button-defs.js";

const props = withDefaults(defineProps<ButtonProps>(), {
  label: undefined,
  icon: undefined,
  iconPos: "left",
  loading: false,
  disabled: false,
  severity: "primary",
  variant: undefined,
  outlined: false,
  text: false,
  raised: false,
  rounded: false,
  fluid: false,
  size: undefined,
  badge: undefined,
  badgeClass: undefined,
  badgeSeverity: undefined,
  href: undefined,
  target: undefined,
  rel: undefined,
  as: undefined,
  type: "button",
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const attrs = useAttrs();
const slots = useSlots();

const tag = computed(() => props.as ?? (props.href ? "a" : "button"));
const isNativeButton = computed(() => tag.value === "button");
const isBlocked = computed(() => Boolean(props.disabled || props.loading));

const resolvedVariant = computed(() => {
  if (props.variant) return props.variant;
  if (props.text) return "text";
  if (props.outlined) return "outlined";
  return "filled";
});

// 不传 size = 跟随容器的密度上下文（--control-*），传了才定档。
const resolvedSize = computed(() => {
  if (props.size === "small" || props.size === "sm") return "sm";
  if (props.size === "large" || props.size === "lg") return "lg";
  if (props.size === "xs") return "xs";
  if (props.size === "md") return "md";
  return undefined;
});

const resolvedSeverity = computed(() => {
  if (props.severity === "warn") return "warning";
  return props.severity;
});

const hasDefaultSlot = computed(() => Boolean(slots.default));
const hasIcon = computed(() => Boolean(props.icon || slots.icon));
const isIconOnly = computed(
  () => hasIcon.value && !props.label && !hasDefaultSlot.value,
);

const rootClass = computed(() => [
  "mw-btn",
  `mw-btn--${resolvedVariant.value}`,
  `mw-btn--${resolvedSeverity.value}`,
  resolvedSize.value ? [`mw-btn--${resolvedSize.value}`, `mw-size-${resolvedSize.value}`] : undefined,
  {
    "mw-btn--icon-only": isIconOnly.value,
    "mw-btn--icon-right": props.iconPos === "right",
    "mw-btn--raised": props.raised,
    "mw-btn--rounded": props.rounded,
    "mw-btn--fluid": props.fluid,
    "mw-btn--loading": props.loading,
  },
  attrs.class,
]);

const restAttrs = computed(() => {
  const { class: _class, style: _style, onClick: _onClick, ...rest } = attrs;
  return rest;
});

function onClick(event: MouseEvent) {
  if (isBlocked.value) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  emit("click", event);
}
</script>

<template>
  <component
    :is="tag"
    v-bind="restAttrs"
    :type="isNativeButton ? type : undefined"
    :href="href"
    :target="target"
    :rel="rel"
    :class="rootClass"
    :style="($attrs.style as any)"
    :disabled="isNativeButton ? isBlocked : undefined"
    :aria-disabled="isBlocked || undefined"
    :aria-busy="loading || undefined"
    :data-disabled="isBlocked ? '' : undefined"
    :data-loading="loading ? '' : undefined"
    :data-severity="resolvedSeverity"
    :data-variant="resolvedVariant"
    :data-size="resolvedSize"
    @click="onClick"
  >
    <LoaderCircle
      v-if="loading"
      class="mw-btn__icon mw-btn__spinner"
      aria-hidden="true"
    />
    <template v-else-if="iconPos === 'left'">
      <slot name="icon">
        <component
          :is="icon"
          v-if="icon"
          class="mw-btn__icon"
          aria-hidden="true"
        />
      </slot>
    </template>

    <slot>
      <span v-if="label" class="mw-btn__label">{{ label }}</span>
    </slot>

    <template v-if="!loading && iconPos === 'right'">
      <slot name="icon">
        <component
          :is="icon"
          v-if="icon"
          class="mw-btn__icon"
          aria-hidden="true"
        />
      </slot>
    </template>

    <span
      v-if="badge !== undefined && badge !== null && badge !== ''"
      :class="['mw-btn__badge', badgeClass]"
      :data-severity="badgeSeverity"
    >
      {{ badge }}
    </span>
  </component>
</template>
