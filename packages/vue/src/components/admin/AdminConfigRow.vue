<script setup lang="ts">
import { vTooltip } from "../../lib/tooltip";
import type { AdminConfigRowProps } from "./admin-defs";

defineOptions({
  name: "MwAdminConfigRow",
});

withDefaults(defineProps<AdminConfigRowProps>(), {
  keyHint: undefined,
  hint: undefined,
  status: undefined,
  statusTone: "muted",
});
</script>

<template>
  <div class="admin-config-row">
    <span
      class="admin-config-row__label"
      v-tooltip="keyHint ?? ''"
      :title="keyHint"
    >
      <slot name="label">{{ label }}</slot>
    </span>
    <div class="admin-config-row__control">
      <slot />
    </div>
    <p v-if="hint || $slots.hint" class="admin-config-row__hint">
      <slot name="hint">{{ hint }}</slot>
    </p>
    <p
      v-if="status || $slots.status"
      class="admin-config-row__status"
      :data-tone="statusTone"
    >
      <slot name="status">{{ status }}</slot>
    </p>
  </div>
</template>
