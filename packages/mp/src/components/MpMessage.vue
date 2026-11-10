<script setup lang="ts">
import { useAttrs } from "vue";

defineOptions({
  name: "MwMpMessage",
  inheritAttrs: true,
  options: { styleIsolation: "shared", virtualHost: false },
} as any);
const attrs = useAttrs();

export interface MpMessageProps {
  from: "user" | "assistant";
  label?: string;
  text?: string;
}

withDefaults(defineProps<MpMessageProps>(), { label: undefined, text: undefined });
</script>

<template>
  <article :data-testid="attrs['data-testid']" class="mw-mp-message" :class="`mw-mp-message--${from}`">
    <span v-if="label" class="mw-mp-message__label">{{ label }}</span>
    <div class="mw-mp-message__body">
      <slot><p class="mw-mp-message__text">{{ text }}</p></slot>
    </div>
  </article>
</template>
