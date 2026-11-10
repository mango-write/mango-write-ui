<script setup lang="ts">
import { computed, useAttrs } from "vue";
import MpIcon from "./MpIcon.vue";

defineOptions({
  name: "MwMpNavBar",
  inheritAttrs: true,
  options: { styleIsolation: "shared", virtualHost: true },
} as any);
const attrs = useAttrs();

export interface MpNavBarProps {
  title?: string;
  showBack?: boolean;
  capsuleSafe?: boolean;
  capsuleWidth?: number;
  backAriaLabel?: string;
}

const props = withDefaults(defineProps<MpNavBarProps>(), {
  title: undefined,
  showBack: false,
  capsuleSafe: true,
  capsuleWidth: 88,
  backAriaLabel: "返回",
});
const emit = defineEmits<{ back: [] }>();
const barStyle = computed(() => ({ "--mw-mp-capsule-width": `${props.capsuleWidth}px` }));
</script>

<template>
  <header
    :data-testid="attrs['data-testid']"
    class="mw-mp-navbar mw-frost"
    :class="{ 'mw-mp-navbar--capsule-safe': capsuleSafe }"
  >
    <div class="mw-mp-navbar__bar" :style="barStyle">
      <div class="mw-mp-navbar__leading">
        <slot name="leading">
          <button
            v-if="showBack"
            type="button"
            class="mw-mp-navbar__back"
            hover-class="is-pressed"
            :aria-label="backAriaLabel"
            data-testid="mp-nav-back"
            @click="emit('back')"
          >
            <MpIcon name="arrow-left" :size="24" />
          </button>
        </slot>
      </div>
      <span v-if="title" class="mw-mp-navbar__title" role="heading" aria-level="1">{{ title }}</span>
      <div class="mw-mp-navbar__trailing"><slot name="trailing" /></div>
    </div>
  </header>
</template>
