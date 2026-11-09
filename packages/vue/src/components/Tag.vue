<script setup lang="ts">
import type { Component } from "vue";

export type TagSeverity =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warn"
  | "warning"
  | "danger"
  | "contrast";

export interface TagProps {
  value?: string | number | null;
  severity?: TagSeverity | (string & {});
  rounded?: boolean;
  icon?: Component;
}

defineOptions({
  name: "MwTag",
});

withDefaults(defineProps<TagProps>(), {
  value: undefined,
  severity: "primary",
  rounded: false,
  icon: undefined,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<template>
  <span
    class="mw-tag"
    :class="[`mw-tag--${severity}`, { 'mw-tag--rounded': rounded }]"
    :data-severity="severity"
    @click="emit('click', $event)"
  >
    <slot name="icon">
      <component :is="icon" v-if="icon" class="mw-tag__icon" aria-hidden="true" />
    </slot>
    <slot>
      <span v-if="value !== undefined && value !== null" class="mw-tag__label">{{ value }}</span>
    </slot>
  </span>
</template>
