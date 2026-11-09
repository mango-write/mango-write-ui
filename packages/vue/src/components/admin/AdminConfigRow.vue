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

<style scoped>
.admin-config-row {
  --mw-admin-config-label-w: 168px;
  --mw-admin-config-control-w: 280px;
  display: grid;
  grid-template-columns: var(--mw-admin-config-label-w) var(--mw-admin-config-control-w) minmax(0, 1fr);
  column-gap: var(--space-5);
  row-gap: var(--space-1);
  align-items: center;
  padding: var(--space-2) 0;
}

.admin-config-row + .admin-config-row {
  border-top: var(--border-width) solid var(--border-subtle);
}

.admin-config-row__label {
  overflow: hidden;
  color: var(--text-primary);
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
  font-weight: var(--weight-medium);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.admin-config-row__control {
  display: flex;
  min-width: 0;
}

.admin-config-row__control > :deep(:is(
  .mw-input,
  .mw-select,
  .mw-multiselect,
  .mw-input-number,
  .mw-input-group,
  .mw-ass,
  .mw-ss,
  .mw-sms,
  .mw-input-text
)) {
  width: 100%;
}

.admin-config-row__hint {
  margin: 0;
  overflow-wrap: anywhere;
  color: var(--text-tertiary);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
}

.admin-config-row__status {
  grid-column: 1 / -1;
  margin: 0;
  color: var(--text-tertiary);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
}

.admin-config-row__status[data-tone="warning"] {
  color: var(--warning-text);
}

.admin-config-row__status[data-tone="danger"] {
  color: var(--danger-text);
}

.admin-config-row__status[data-tone="success"] {
  color: var(--success-text);
}

@container (max-width: 720px) {
  .admin-config-row {
    --mw-admin-config-label-w: 140px;
    grid-template-columns: var(--mw-admin-config-label-w) minmax(0, 1fr);
  }

  .admin-config-row__hint {
    grid-column: 2;
  }
}

@container (max-width: 520px) {
  .admin-config-row {
    grid-template-columns: minmax(0, 1fr);
    row-gap: var(--space-1-5);
  }

  .admin-config-row__label {
    white-space: normal;
  }

  .admin-config-row__hint {
    grid-column: auto;
  }
}
</style>
