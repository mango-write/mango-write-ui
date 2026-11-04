<script setup lang="ts">
import { computed, ref, useAttrs, type Component } from "vue";
import { useI18n } from "vue-i18n";
import { X } from "lucide-vue-next";
import { uiMessages } from "../locale/index.js";

defineOptions({
  name: "MwMessage",
  inheritAttrs: false,
});

export type MessageSeverity =
  | "success"
  | "info"
  | "warn"
  | "warning"
  | "error"
  | "secondary"
  | "contrast";

export interface MessageProps {
  severity?: MessageSeverity;
  closable?: boolean;
  icon?: string | Component;
}

const props = withDefaults(defineProps<MessageProps>(), {
  severity: "info",
  closable: false,
  icon: undefined,
});

const emit = defineEmits<{
  close: [event: MouseEvent];
}>();

const attrs = useAttrs();
const dismissed = ref(false);

let i18nT: ((key: string) => string) | null = null;
try {
  const i18n = useI18n();
  i18nT = (key: string) => i18n.t(key);
} catch {
  i18nT = null;
}

const closeLabel = computed(() => {
  const translated = i18nT?.("common.action.close");
  if (translated && translated !== "common.action.close") {
    return translated;
  }
  return uiMessages["zh-CN"].common.action.close;
});

const normalizedSeverity = computed(() =>
  props.severity === "warning" ? "warn" : props.severity,
);

const computedRole = computed(() => {
  const explicitRole = attrs.role as string | undefined;
  if (explicitRole) return explicitRole;
  return normalizedSeverity.value === "error" || normalizedSeverity.value === "warn"
    ? "alert"
    : "status";
});

const rootClass = computed(() => [
  "mw-message",
  `mw-message--${normalizedSeverity.value}`,
  props.severity === "warning" ? "mw-message--warning" : null,
  attrs.class,
]);

const rootAttrs = computed(() => {
  const { class: _class, style: _style, role: _role, ...rest } = attrs;
  return rest;
});

function onClose(event: MouseEvent) {
  dismissed.value = true;
  emit("close", event);
}
</script>

<template>
  <div
    v-if="!dismissed"
    v-bind="rootAttrs"
    :class="rootClass"
    :style="($attrs.style as any)"
    :role="computedRole"
    :data-severity="normalizedSeverity"
  >
    <span v-if="$slots.icon || icon" class="mw-message__icon" aria-hidden="true">
      <slot name="icon">
        <i v-if="typeof icon === 'string'" :class="icon" />
        <component :is="icon" v-else-if="icon" />
      </slot>
    </span>
    <div class="mw-message__content">
      <slot />
    </div>
    <button
      v-if="closable"
      type="button"
      class="mw-message__close"
      :aria-label="closeLabel"
      @click="onClose"
    >
      <X :size="14" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
.mw-message {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius);
  border: 1px solid var(--color-info-border);
  background-color: var(--color-info-surface);
  color: var(--color-text-primary);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-body-sm);
  line-height: var(--line-height-body);
}

.mw-message--info {
  border-color: var(--color-info-border);
  background-color: var(--color-info-surface);
  color: var(--color-info-500);
}

.mw-message--success {
  border-color: var(--color-success-border);
  background-color: var(--color-success-surface);
  color: var(--color-success-600);
}

.mw-message--warn,
.mw-message--warning {
  border-color: var(--color-warning-border);
  background-color: var(--color-warning-surface);
  color: var(--color-warning-600);
}

.mw-message--error {
  border-color: var(--color-danger-border);
  background-color: var(--color-danger-surface);
  color: var(--color-danger-700);
}

.mw-message--secondary {
  border-color: var(--color-border-subtle);
  background-color: var(--color-surface-muted);
  color: var(--color-text-secondary);
}

.mw-message--contrast {
  border-color: var(--site-ink-line);
  background-color: var(--site-ink);
  color: var(--site-on-ink);
}

.mw-message__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
  color: currentColor;
}

.mw-message__content {
  flex: 1 1 auto;
  min-width: 0;
  color: var(--color-text-primary);
}

.mw-message--contrast .mw-message__content {
  color: var(--site-on-ink);
}

.mw-message__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  padding: 0;
  margin: -2px -4px -2px 0;
  border: none;
  border-radius: var(--radius-xs);
  background: transparent;
  color: currentColor;
  cursor: pointer;
  opacity: 0.72;
  transition:
    opacity var(--motion-duration-fast) var(--motion-ease-standard),
    background-color var(--motion-duration-fast) var(--motion-ease-standard);
}

.mw-message__close:hover {
  opacity: 1;
  background-color: var(--material-hover);
}

.mw-message__close:focus-visible {
  outline: none;
  box-shadow: var(--effect-focus-ring);
}

@media (prefers-reduced-motion: reduce) {
  .mw-message__close {
    transition: none;
  }
}
</style>
