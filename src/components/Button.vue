<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue";
import { LoaderCircle } from "lucide-vue-next";
import type { ButtonProps } from "./button.js";

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
} from "./button.js";

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

<style scoped>
.mw-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--control-gap);
  height: var(--control-h);
  padding-inline: var(--control-px);
  border: var(--border-width) solid transparent;
  border-radius: var(--control-radius);
  font-family: var(--font-sans);
  font-size: var(--control-font);
  font-weight: var(--weight-medium);
  line-height: var(--leading-tight);
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    border-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard);
}

.mw-btn:focus-visible {
  outline: var(--focus-width) solid var(--focus-color);
  outline-offset: var(--focus-offset);
}

.mw-btn__icon,
.mw-btn > :deep(svg) {
  flex: none;
  width: var(--control-icon);
  height: var(--control-icon);
  font-size: var(--control-icon);
}

.mw-btn:has(> .mw-btn__icon):not(.mw-btn--icon-only):not(.mw-btn--icon-right) {
  padding-inline-start: calc(var(--control-px) * 0.75);
}

.mw-btn--icon-right:has(> .mw-btn__icon):not(.mw-btn--icon-only) {
  padding-inline-end: calc(var(--control-px) * 0.75);
}

.mw-btn--icon-only {
  width: var(--control-h);
  padding: 0;
}

.mw-btn--rounded {
  border-radius: var(--radius-full);
}

.mw-btn--rounded:not(.mw-btn--icon-only) {
  padding-inline: calc(var(--control-px) * 1.25);
}

.mw-btn--rounded:has(> .mw-btn__icon):not(.mw-btn--icon-only):not(.mw-btn--icon-right) {
  padding-inline-start: var(--control-px);
}

.mw-btn--rounded.mw-btn--icon-right:has(> .mw-btn__icon):not(.mw-btn--icon-only) {
  padding-inline-end: var(--control-px);
}

.mw-btn--raised {
  box-shadow: var(--shadow-raised);
}

.mw-btn--fluid {
  width: 100%;
}

/* filled：只有 primary / danger / contrast 是实心动作色；状态色不承担动作，退为 tinted。 */
.mw-btn--filled.mw-btn--primary {
  background-color: var(--accent);
  color: var(--text-on-accent);
}

.mw-btn--filled.mw-btn--primary:hover:not([data-disabled]) {
  background-color: var(--accent-hover);
}

.mw-btn--filled.mw-btn--primary:active:not([data-disabled]) {
  background-color: var(--accent-pressed);
}

.mw-btn--filled.mw-btn--secondary {
  background-color: var(--control-bg);
  border-color: var(--control-border);
  color: var(--text-primary);
}

.mw-btn--filled.mw-btn--secondary:hover:not([data-disabled]) {
  background-color: var(--control-bg-hover);
  border-color: var(--control-border-hover);
}

.mw-btn--filled.mw-btn--secondary:active:not([data-disabled]) {
  background-color: var(--fill-strong);
}

.mw-btn--filled.mw-btn--danger {
  background-color: var(--danger);
  color: var(--text-on-danger);
}

.mw-btn--filled.mw-btn--danger:hover:not([data-disabled]) {
  background-color: var(--danger-hover);
}

.mw-btn--filled.mw-btn--contrast,
.mw-btn--filled.mw-btn--help {
  background-color: var(--bg-inverse);
  color: var(--text-inverse);
}

.mw-btn--filled.mw-btn--contrast:hover:not([data-disabled]),
.mw-btn--filled.mw-btn--help:hover:not([data-disabled]) {
  opacity: 0.88;
}

.mw-btn--tinted.mw-btn--primary,
.mw-btn--filled.mw-btn--info,
.mw-btn--filled.mw-btn--success,
.mw-btn--filled.mw-btn--warning {
  background-color: var(--mw-btn-tint, var(--accent-subtle));
  color: var(--mw-btn-tint-text, var(--text-accent));
}

.mw-btn--tinted.mw-btn--primary:hover:not([data-disabled]),
.mw-btn--filled.mw-btn--info:hover:not([data-disabled]),
.mw-btn--filled.mw-btn--success:hover:not([data-disabled]),
.mw-btn--filled.mw-btn--warning:hover:not([data-disabled]) {
  background-color: var(--mw-btn-tint-hover, var(--accent-subtle-hover));
}

.mw-btn--success {
  --mw-btn-tint: var(--success-subtle);
  --mw-btn-tint-hover: var(--success-border);
  --mw-btn-tint-text: var(--success-text);
}

.mw-btn--info {
  --mw-btn-tint: var(--info-subtle);
  --mw-btn-tint-hover: var(--info-border);
  --mw-btn-tint-text: var(--info-text);
}

.mw-btn--warning {
  --mw-btn-tint: var(--warning-subtle);
  --mw-btn-tint-hover: var(--warning-border);
  --mw-btn-tint-text: var(--warning-text);
}

.mw-btn--tinted.mw-btn--secondary,
.mw-btn--tinted.mw-btn--contrast,
.mw-btn--tinted.mw-btn--help {
  background-color: var(--fill-default);
  color: var(--text-primary);
}

.mw-btn--tinted.mw-btn--secondary:hover:not([data-disabled]),
.mw-btn--tinted.mw-btn--contrast:hover:not([data-disabled]),
.mw-btn--tinted.mw-btn--help:hover:not([data-disabled]) {
  background-color: var(--fill-strong);
}

.mw-btn--tinted.mw-btn--danger {
  background-color: var(--danger-subtle);
  color: var(--danger-text);
}

.mw-btn--tinted.mw-btn--danger:hover:not([data-disabled]) {
  background-color: var(--danger-border);
}

.mw-btn--tinted.mw-btn--success,
.mw-btn--tinted.mw-btn--info,
.mw-btn--tinted.mw-btn--warning {
  background-color: var(--mw-btn-tint);
  color: var(--mw-btn-tint-text);
}

.mw-btn--outlined {
  background-color: transparent;
  border-color: var(--border-default);
  color: var(--text-primary);
}

.mw-btn--outlined:hover:not([data-disabled]) {
  background-color: var(--fill-subtle);
  border-color: var(--border-strong);
}

.mw-btn--outlined.mw-btn--primary {
  border-color: var(--accent-border);
  color: var(--text-accent);
}

.mw-btn--outlined.mw-btn--primary:hover:not([data-disabled]) {
  background-color: var(--accent-subtle);
  border-color: var(--accent);
}

.mw-btn--outlined.mw-btn--danger {
  border-color: var(--danger-border);
  color: var(--danger-text);
}

.mw-btn--outlined.mw-btn--danger:hover:not([data-disabled]) {
  background-color: var(--danger-subtle);
}

.mw-btn--outlined.mw-btn--success,
.mw-btn--outlined.mw-btn--info,
.mw-btn--outlined.mw-btn--warning {
  border-color: var(--mw-btn-tint-hover);
  color: var(--mw-btn-tint-text);
}

.mw-btn--text {
  background-color: transparent;
  color: var(--text-secondary);
}

.mw-btn--text:hover:not([data-disabled]) {
  background-color: var(--fill-default);
  color: var(--text-primary);
}

.mw-btn--text:active:not([data-disabled]) {
  background-color: var(--fill-strong);
}

.mw-btn--text.mw-btn--primary {
  color: var(--text-accent);
}

.mw-btn--text.mw-btn--primary:hover:not([data-disabled]) {
  background-color: var(--accent-subtle);
  color: var(--text-accent);
}

.mw-btn--text.mw-btn--danger {
  color: var(--danger-text);
}

.mw-btn--text.mw-btn--danger:hover:not([data-disabled]) {
  background-color: var(--danger-subtle);
  color: var(--danger-text);
}

.mw-btn--text.mw-btn--success,
.mw-btn--text.mw-btn--info,
.mw-btn--text.mw-btn--warning {
  color: var(--mw-btn-tint-text);
}

.mw-btn--link {
  height: auto;
  padding-inline: 0;
  background-color: transparent;
  color: var(--text-accent);
}

.mw-btn--link:hover:not([data-disabled]) {
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.mw-btn:disabled,
.mw-btn[data-disabled] {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
}

.mw-btn[data-loading] {
  cursor: progress;
}

.mw-btn__spinner {
  flex: none;
  width: var(--control-icon);
  height: var(--control-icon);
  animation: mw-btn-spin calc(var(--duration-slower) * 2) linear infinite;
}

.mw-btn__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--icon-md);
  height: var(--icon-md);
  padding-inline: var(--space-1);
  border-radius: var(--radius-full);
  background-color: var(--fill-strong);
  color: inherit;
  font-size: var(--type-micro-size);
  font-weight: var(--weight-semibold);
  font-variant-numeric: tabular-nums;
}

.mw-btn__badge[data-severity="primary"] {
  background-color: var(--accent);
  color: var(--text-on-accent);
}

.mw-btn__badge[data-severity="danger"] {
  background-color: var(--danger);
  color: var(--text-on-danger);
}

.mw-btn__badge[data-severity="success"] {
  background-color: var(--success-subtle);
  color: var(--success-text);
}

.mw-btn__badge[data-severity="warning"],
.mw-btn__badge[data-severity="warn"] {
  background-color: var(--warning-subtle);
  color: var(--warning-text);
}

.mw-btn__badge[data-severity="info"] {
  background-color: var(--info-subtle);
  color: var(--info-text);
}

.mw-btn:has(> .mw-btn__badge) {
  overflow: visible;
}

.mw-btn--icon-only > .mw-btn__badge {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(35%, -35%);
  z-index: var(--z-raised);
  pointer-events: none;
}

@media (pointer: coarse) {
  .mw-btn::after {
    content: "";
    position: absolute;
    inset: min(0px, calc((var(--control-h) - var(--hit-min)) / 2));
  }
}

@keyframes mw-btn-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .mw-btn {
    transition: none;
  }
}
</style>
