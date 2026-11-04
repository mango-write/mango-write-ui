<script setup lang="ts">
import { computed, ref } from "vue";
import { contrastRatio, useTokenValues } from "./tokens";

const props = defineProps<{
  token: string;
  label?: string;
  /** 文字色：在 on 背景上测对比度。 */
  text?: boolean;
  on?: string;
}>();

const el = ref<HTMLElement | null>(null);
const { values } = useTokenValues(el, () => [props.token, props.on ?? "--bg-surface"]);

const value = computed(() => values.value[props.token] ?? "");
const ratio = computed(() => {
  if (!props.text) return null;
  const bg = values.value[props.on ?? "--bg-surface"];
  return bg && value.value ? contrastRatio(value.value, bg) : null;
});
</script>

<template>
  <div ref="el" class="swatch">
    <div
      class="swatch__chip"
      :class="{ 'swatch__chip--text': text }"
      :style="text ? { color: `var(${token})`, background: `var(${on ?? '--bg-surface'})` } : { background: `var(${token})` }"
    >
      <span v-if="text">Aa 文字</span>
    </div>
    <div class="swatch__meta">
      <span class="swatch__label">{{ label ?? token }}</span>
      <code class="swatch__token">{{ token }}</code>
      <span class="swatch__value">
        {{ value }}
        <template v-if="ratio !== null">
          · <b :class="{ 'swatch__fail': ratio < 4.5 }">{{ ratio.toFixed(2) }}:1</b>
        </template>
      </span>
    </div>
  </div>
</template>

<style scoped>
.swatch {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

.swatch__chip {
  flex: none;
  width: 56px;
  height: 40px;
  border-radius: var(--radius-md);
  box-shadow: inset 0 0 0 1px var(--border-subtle);
}

.swatch__chip--text {
  display: grid;
  place-items: center;
  font-size: var(--type-body-sm-size);
  font-weight: var(--weight-semibold);
}

.swatch__meta {
  display: grid;
  min-width: 0;
}

.swatch__label {
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
}

.swatch__token,
.swatch__value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: var(--type-micro-size);
  line-height: var(--type-micro-line);
}

.swatch__value b {
  color: var(--success-text);
  font-weight: var(--weight-semibold);
}

.swatch__value b.swatch__fail {
  color: var(--danger-text);
}
</style>
