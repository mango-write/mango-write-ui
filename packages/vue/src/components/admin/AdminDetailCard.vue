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
