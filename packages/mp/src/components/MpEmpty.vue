<script setup lang="ts">
import MpButton from "./MpButton.vue";
import MpIcon from "./MpIcon.vue";

defineOptions({
  name: "MwMpEmpty",
  inheritAttrs: true,
  options: { styleIsolation: "shared", virtualHost: false },
} as any);

export type MpEmptyStatus = "empty" | "error";

export interface MpEmptyProps {
  status?: MpEmptyStatus;
  title?: string;
  hint?: string;
  retryLabel?: string;
}

withDefaults(defineProps<MpEmptyProps>(), {
  status: "empty",
  title: "暂无内容",
  hint: undefined,
  retryLabel: "重试",
});
const emit = defineEmits<{ retry: [] }>();
</script>

<template>
  <div class="mw-mp-empty" :data-status="status" data-testid="mp-empty">
    <span class="mw-mp-empty__icon"><MpIcon :name="status === 'error' ? 'error' : 'journal'" :size="24" /></span>
    <div class="mw-mp-empty__title">{{ title }}</div>
    <div v-if="hint" class="mw-mp-empty__hint">{{ hint }}</div>
    <div v-if="$slots.action || status === 'error'" class="mw-mp-empty__action">
      <slot name="action">
        <MpButton
          size="sm"
          variant="outlined"
          severity="secondary"
          :label="retryLabel"
          data-testid="mp-empty-retry"
          @click="emit('retry')"
        />
      </slot>
    </div>
  </div>
</template>
