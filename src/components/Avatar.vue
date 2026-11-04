<script setup lang="ts">
import { computed, ref, watch, type Component } from "vue";

export type AvatarSize = "sm" | "md" | "lg" | "normal" | "large" | "xlarge";
export type AvatarShape = "square" | "circle";

export interface AvatarProps {
  label?: string;
  icon?: string | Component;
  image?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  ariaLabel?: string;
}

defineOptions({
  name: "MwAvatar",
});

const props = withDefaults(defineProps<AvatarProps>(), {
  label: undefined,
  icon: undefined,
  image: undefined,
  size: "normal",
  shape: "square",
  ariaLabel: undefined,
});

const emit = defineEmits<{
  error: [event: Event];
  click: [event: MouseEvent];
  keydown: [event: KeyboardEvent];
}>();

const imageFailed = ref(false);

watch(
  () => props.image,
  () => {
    imageFailed.value = false;
  },
);

const showImage = computed(() => Boolean(props.image) && !imageFailed.value);

const normalizedSize = computed<"sm" | "normal" | "large" | "xlarge">(() => {
  if (props.size === "sm") return "sm";
  if (props.size === "lg" || props.size === "large") return "large";
  if (props.size === "xlarge") return "xlarge";
  return "normal";
});

const avatarClasses = computed(() => [
  `mw-avatar--${props.shape}`,
  `mw-avatar--${normalizedSize.value}`,
  props.size !== normalizedSize.value ? `mw-avatar--${props.size}` : undefined,
  {
    "mw-avatar--image": showImage.value,
  },
]);

function onImageError(event: Event) {
  imageFailed.value = true;
  emit("error", event);
}
</script>

<template>
  <span
    class="mw-avatar"
    :class="avatarClasses"
    :aria-label="ariaLabel"
    :data-shape="shape"
    :data-size="normalizedSize"
    @click="emit('click', $event)"
    @keydown="emit('keydown', $event)"
  >
    <img
      v-if="showImage"
      :src="image"
      :alt="ariaLabel ?? label ?? ''"
      class="mw-avatar__image"
      @error="onImageError"
    />
    <slot v-else>
      <span v-if="label" class="mw-avatar__label">{{ label }}</span>
      <slot v-else name="icon">
        <i
          v-if="typeof icon === 'string' && icon"
          :class="['mw-avatar__icon', icon]"
          aria-hidden="true"
        />
        <component :is="icon" v-else-if="icon" class="mw-avatar__icon" aria-hidden="true" />
      </slot>
    </slot>
  </span>
</template>

<style>
.mw-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1;
  background-color: var(--color-surface-muted);
  color: var(--color-text-primary);
  border-radius: var(--radius-sm);
  overflow: hidden;
  user-select: none;
  flex-shrink: 0;
}

.mw-avatar--circle {
  border-radius: var(--radius-pill);
}

.mw-avatar--square {
  border-radius: var(--radius-sm);
}

.mw-avatar--sm {
  width: 1.375rem;
  height: 1.375rem;
  font-size: 0.75rem;
}

.mw-avatar--normal,
.mw-avatar--md {
  width: 1.75rem;
  height: 1.75rem;
  font-size: 0.875rem;
}

.mw-avatar--large,
.mw-avatar--lg {
  width: 2.25rem;
  height: 2.25rem;
  font-size: 1rem;
}

.mw-avatar--xlarge {
  width: 3rem;
  height: 3rem;
  font-size: 1.25rem;
}

.mw-avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.mw-avatar__icon {
  font-size: 1em;
  width: 1em;
  height: 1em;
}
</style>
