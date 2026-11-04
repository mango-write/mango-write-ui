<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue";
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
  size: "md",
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

const resolvedSize = computed(() => {
  if (props.size === "small" || props.size === "sm") return "sm";
  if (props.size === "large" || props.size === "lg") return "lg";
  return "md";
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
  `mw-btn--${resolvedSize.value}`,
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
    <span
      v-if="loading"
      class="mw-btn__spinner"
      aria-hidden="true"
    />
    <template v-else-if="iconPos === 'left'">
      <slot name="icon">
        <i
          v-if="typeof icon === 'string'"
          :class="['mw-btn__icon', icon]"
          aria-hidden="true"
        />
        <component
          :is="icon"
          v-else-if="icon"
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
        <i
          v-if="typeof icon === 'string'"
          :class="['mw-btn__icon', icon]"
          aria-hidden="true"
        />
        <component
          :is="icon"
          v-else-if="icon"
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
  gap: var(--space-2);
  min-height: var(--control-height-default);
  padding-inline: var(--space-4);
  padding-block: var(--space-2);
  border-radius: var(--radius);
  border: 1px solid transparent;
  font-family: var(--font-family-sans);
  font-size: var(--font-size-body-sm);
  font-weight: 500;
  line-height: var(--line-height-tight);
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
  cursor: pointer;
  transition:
    background-color var(--motion-duration-fast) var(--motion-ease-standard),
    border-color var(--motion-duration-fast) var(--motion-ease-standard),
    color var(--motion-duration-fast) var(--motion-ease-standard),
    box-shadow var(--motion-duration-fast) var(--motion-ease-standard),
    transform var(--motion-duration-fast) var(--motion-ease-standard);
}

.mw-btn:focus-visible {
  outline: none;
  box-shadow: var(--effect-focus-ring);
}

.mw-btn--sm {
  min-height: var(--control-height-compact);
  padding-inline: var(--space-3);
  padding-block: var(--space-1);
  font-size: var(--font-size-caption);
}

.mw-btn--lg {
  min-height: var(--control-height-large);
  padding-inline: var(--space-5);
  padding-block: var(--space-3);
  font-size: var(--font-size-body);
}

.mw-btn--icon-only {
  width: var(--control-height-default);
  padding: 0;
}

.mw-btn--icon-only.mw-btn--sm {
  width: var(--control-height-compact);
}

.mw-btn--icon-only.mw-btn--lg {
  width: var(--control-height-large);
}

.mw-btn--rounded {
  border-radius: var(--radius-pill);
}

.mw-btn--raised {
  box-shadow: var(--shadow-xs);
}

.mw-btn--fluid {
  width: 100%;
}

/* Filled variants */
.mw-btn--filled.mw-btn--primary {
  background-color: var(--color-brand-500);
  color: var(--color-text-on-brand);
}

.mw-btn--filled.mw-btn--primary:hover:not(:disabled):not([data-disabled]) {
  background-color: var(--color-brand-400);
}

.mw-btn--filled.mw-btn--primary:active:not(:disabled):not([data-disabled]) {
  background-color: var(--color-brand-600);
}

.mw-btn--filled.mw-btn--secondary {
  background-color: var(--color-surface-muted);
  border-color: var(--color-border-subtle);
  color: var(--color-text-primary);
}

.mw-btn--filled.mw-btn--secondary:hover:not(:disabled):not([data-disabled]) {
  background-color: var(--color-bg-hover);
  border-color: var(--color-border-strong);
}

.mw-btn--filled.mw-btn--success {
  background-color: var(--color-success-500);
  color: var(--color-text-on-brand);
}

.mw-btn--filled.mw-btn--success:hover:not(:disabled):not([data-disabled]) {
  background-color: var(--color-success-600);
}

.mw-btn--filled.mw-btn--info {
  background-color: var(--color-info-500);
  color: var(--color-surface-base);
}

.mw-btn--filled.mw-btn--warning {
  background-color: var(--color-warning-500);
  color: var(--color-text-on-brand);
}

.mw-btn--filled.mw-btn--warning:hover:not(:disabled):not([data-disabled]) {
  background-color: var(--color-warning-600);
}

.mw-btn--filled.mw-btn--danger {
  background-color: var(--color-danger-500);
  color: var(--color-surface-base);
}

.mw-btn--filled.mw-btn--danger:hover:not(:disabled):not([data-disabled]) {
  background-color: var(--color-danger-700);
}

.mw-btn--filled.mw-btn--contrast,
.mw-btn--filled.mw-btn--help {
  background-color: var(--color-text-primary);
  color: var(--color-surface-base);
}

/* Outlined variants */
.mw-btn--outlined {
  background-color: transparent;
  border-color: var(--color-border-subtle);
  color: var(--color-text-primary);
}

.mw-btn--outlined:hover:not(:disabled):not([data-disabled]) {
  background-color: var(--color-bg-hover);
  border-color: var(--color-border-strong);
}

.mw-btn--outlined.mw-btn--primary {
  border-color: var(--color-brand-500);
  color: var(--color-brand-700);
}

.mw-btn--outlined.mw-btn--primary:hover:not(:disabled):not([data-disabled]) {
  background-color: var(--color-brand-50);
}

.mw-btn--outlined.mw-btn--danger {
  border-color: var(--color-danger-border);
  color: var(--color-danger-700);
}

.mw-btn--outlined.mw-btn--danger:hover:not(:disabled):not([data-disabled]) {
  background-color: var(--color-danger-surface);
}

.mw-btn--outlined.mw-btn--success {
  border-color: var(--color-success-border);
  color: var(--color-success-600);
}

.mw-btn--outlined.mw-btn--success:hover:not(:disabled):not([data-disabled]) {
  background-color: var(--color-success-surface);
}

.mw-btn--outlined.mw-btn--warning {
  border-color: var(--color-warning-border);
  color: var(--color-warning-600);
}

.mw-btn--outlined.mw-btn--warning:hover:not(:disabled):not([data-disabled]) {
  background-color: var(--color-warning-surface);
}

.mw-btn--outlined.mw-btn--info {
  border-color: var(--color-info-border);
  color: var(--color-info-500);
}

.mw-btn--outlined.mw-btn--info:hover:not(:disabled):not([data-disabled]) {
  background-color: var(--color-info-surface);
}

/* Text variants */
.mw-btn--text {
  background-color: transparent;
  border-color: transparent;
  color: var(--color-text-secondary);
}

.mw-btn--text:hover:not(:disabled):not([data-disabled]) {
  background-color: var(--material-hover);
  color: var(--color-text-primary);
}

.mw-btn--text.mw-btn--primary {
  color: var(--color-brand-700);
}

.mw-btn--text.mw-btn--danger {
  color: var(--color-danger-700);
}

.mw-btn--text.mw-btn--danger:hover:not(:disabled):not([data-disabled]) {
  background-color: var(--color-danger-surface);
}

/* Link variant */
.mw-btn--link {
  background-color: transparent;
  border-color: transparent;
  color: var(--color-brand-600);
  padding-inline: var(--space-1);
}

.mw-btn--link:hover:not(:disabled):not([data-disabled]) {
  color: var(--color-brand-700);
  text-decoration: underline;
}

/* Disabled & loading */
.mw-btn:disabled,
.mw-btn[data-disabled] {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
}

.mw-btn__spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: var(--radius-pill);
  border: 2px solid currentColor;
  border-right-color: transparent;
  animation: mw-btn-spin var(--motion-duration-spatial) linear infinite;
}

.mw-btn__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding-inline: var(--space-1);
  border-radius: var(--radius-pill);
  background-color: var(--color-surface-base);
  color: var(--color-text-primary);
  font-size: var(--font-size-caption);
  font-weight: 600;
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
  .mw-btn__spinner {
    animation: none;
  }
}
</style>
