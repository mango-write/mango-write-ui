<script setup lang="ts">
import { useAttrs } from "vue";
import MpIcon, { type MpIconName } from "./MpIcon.vue";

defineOptions({
  name: "MwMpBackButton",
  inheritAttrs: true,
  options: { styleIsolation: "shared", virtualHost: true },
} as any);
const attrs = useAttrs();

export interface MpBackButtonProps {
  contained?: boolean;
  ariaLabel?: string;
  icon?: MpIconName;
}

withDefaults(defineProps<MpBackButtonProps>(), {
  contained: false,
  ariaLabel: "返回",
  icon: "chevron-left",
});
const emit = defineEmits<{ click: [event: MouseEvent] }>();
</script>

<template>
  <button
    type="button"
    :id="(attrs.id as string | undefined)"
    :data-testid="(attrs['data-testid'] as string | undefined) || 'mp-nav-back'"
    class="mw-mp-back-btn mw-frost"
    :class="{ 'mw-mp-back-btn--contained': contained }"
    hover-class="is-pressed"
    :aria-label="ariaLabel"
    @click="emit('click', $event)"
  >
    <MpIcon :name="icon" :size="22" />
  </button>
</template>
