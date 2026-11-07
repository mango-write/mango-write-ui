<script setup lang="ts">
import Button from "../Button.vue";
import type { AdminDetailCardEmits, AdminDetailCardProps } from "./admin-defs";

defineOptions({
  name: "MwAdminDetailCard",
});

withDefaults(defineProps<AdminDetailCardProps>(), {
  value: undefined,
  sub: undefined,
  tone: "default",
  actionLabel: undefined,
  actionDisabled: false,
});

const emit = defineEmits<AdminDetailCardEmits>();
</script>

<template>
  <div class="admin-detail-card" :data-tone="tone">
    <div class="admin-detail-card__head">
      <slot name="head">
        <span>{{ label }}</span>
        <Button
          v-if="actionLabel"
          text
          size="xs"
          class="admin-detail-card__action"
          :label="actionLabel"
          :disabled="actionDisabled"
          @click="emit('action')"
        />
      </slot>
    </div>
    <div v-if="value !== undefined || $slots.value" class="admin-detail-card__value">
      <slot name="value">{{ value }}</slot>
    </div>
    <div v-if="sub !== undefined || $slots.sub" class="admin-detail-card__sub">
      <slot name="sub">{{ sub }}</slot>
    </div>
    <slot />
  </div>
</template>

<style scoped>
.admin-detail-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-0-5);
  min-width: 0;
  padding: var(--space-2) var(--space-3) var(--space-2-5);
  border: var(--border-width) solid var(--border-subtle);
  border-radius: var(--radius-sm);
  background: var(--bg-sunken);
}

.admin-detail-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  min-height: var(--size-xs-h);
  color: var(--text-tertiary);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
}

.admin-detail-card__value,
.admin-detail-card__sub {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-detail-card__value {
  color: var(--text-primary);
  font-size: var(--type-title-size);
  line-height: var(--type-title-line);
  font-weight: var(--weight-semibold);
  font-variant-numeric: tabular-nums;
}

.admin-detail-card[data-tone="accent"] .admin-detail-card__value {
  color: var(--text-accent);
}

.admin-detail-card[data-tone="success"] .admin-detail-card__value {
  color: var(--success-text);
}

.admin-detail-card[data-tone="warning"] .admin-detail-card__value {
  color: var(--warning-text);
}

.admin-detail-card[data-tone="danger"] .admin-detail-card__value {
  color: var(--danger-text);
}

.admin-detail-card__sub {
  color: var(--text-tertiary);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
  font-variant-numeric: tabular-nums;
}
</style>
