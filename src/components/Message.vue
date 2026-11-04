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
  icon?: Component;
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
        <component :is="icon" v-if="icon" />
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
      <X class="mw-message__close-icon" :size="14" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
.mw-message {
  --mw-message-icon: var(--info);
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: var(--border-width) solid var(--info-border);
  border-radius: var(--radius-md);
  background-color: var(--info-subtle);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
}

.mw-message--success {
  --mw-message-icon: var(--success);
  border-color: var(--success-border);
  background-color: var(--success-subtle);
}

.mw-message--warn,
.mw-message--warning {
  --mw-message-icon: var(--warning);
  border-color: var(--warning-border);
  background-color: var(--warning-subtle);
}

.mw-message--error {
  --mw-message-icon: var(--danger);
  border-color: var(--danger-border);
  background-color: var(--danger-subtle);
}

.mw-message--secondary {
  --mw-message-icon: var(--text-secondary);
  border-color: var(--border-subtle);
  background-color: var(--fill-subtle);
}

.mw-message--contrast {
  --mw-message-icon: var(--text-inverse);
  border-color: transparent;
  background-color: var(--bg-inverse);
  color: var(--text-inverse);
}

.mw-message__icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: var(--icon-md);
  height: var(--type-body-sm-line);
  color: var(--mw-message-icon);
}

.mw-message__icon :deep(svg) {
  width: var(--icon-md);
  height: var(--icon-md);
  font-size: var(--icon-md);
}

.mw-message__content {
  flex: 1 1 auto;
  min-width: 0;
  color: inherit;
}

.mw-message__close {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: var(--size-xs-h);
  height: var(--size-xs-h);
  margin-block: calc(var(--space-0-5) * -1);
  margin-inline-end: calc(var(--space-1) * -1);
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
}

.mw-message--contrast .mw-message__close {
  color: inherit;
}

.mw-message__close:hover {
  background-color: var(--fill-default);
  color: var(--text-primary);
}

.mw-message--contrast .mw-message__close:hover {
  background-color: var(--fill-default);
  color: inherit;
}

.mw-message__close:focus-visible {
  outline: var(--focus-width) solid var(--focus-color);
  outline-offset: 0;
}

.mw-message__close :deep(svg) {
  width: var(--icon-sm);
  height: var(--icon-sm);
}

@media (prefers-reduced-motion: reduce) {
  .mw-message__close {
    transition: none;
  }
}
</style>
