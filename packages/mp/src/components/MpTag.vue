<script setup lang="ts">
import { computed } from "vue";

defineOptions({
  name: "MwMpTag",
  inheritAttrs: true,
  options: { styleIsolation: "shared", virtualHost: false },
} as any);

export type MpTagSeverity =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warn"
  | "warning"
  | "danger"
  | "contrast";
/** @deprecated 使用与桌面端对齐的 `MpTagSeverity`（`severity` 属性） */
export type MpTagTone = MpTagSeverity | "neutral";

export interface MpTagProps {
  value?: string | number | null;
  label?: string;
  severity?: MpTagSeverity;
  /** @deprecated 使用与桌面端对齐的 `severity` */
  tone?: MpTagTone;
  dataTestid?: string;
}

const props = withDefaults(defineProps<MpTagProps>(), {
  value: undefined,
  label: undefined,
  severity: undefined,
  tone: undefined,
  dataTestid: undefined,
});

const resolvedSeverity = computed(() => {
  const raw = props.severity ?? props.tone ?? "secondary";
  if (raw === "warn") return "warning";
  if (raw === "neutral") return "secondary";
  return raw;
});
const displayText = computed(() => (props.value !== undefined && props.value !== null ? props.value : props.label));
</script>

<template>
  <span
    class="mw-mp-tag"
    :class="`mw-mp-tag--${resolvedSeverity}`"
    :data-severity="resolvedSeverity"
    :data-testid="dataTestid"
  >
    <slot>{{ displayText }}</slot>
  </span>
</template>
