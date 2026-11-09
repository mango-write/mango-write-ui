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
