<script setup lang="ts">
defineOptions({
  name: "MwMpTag",
  inheritAttrs: true,
  options: { styleIsolation: "shared", virtualHost: false },
} as any);

export type MpTagTone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

export interface MpTagProps {
  label: string;
  tone?: MpTagTone;
  dataTestid?: string;
}

withDefaults(defineProps<MpTagProps>(), { tone: "neutral", dataTestid: undefined });
</script>

<template>
  <span
     class="mw-mp-tag"
    :class="`mw-mp-tag--${tone}`"
    :data-testid="dataTestid"
  >
    <slot>{{ label }}</slot>
  </span>
</template>
