<script setup lang="ts">
import { computed, ref, watch, type Component } from "vue";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "normal" | "large" | "xlarge";
export type AvatarShape = "square" | "circle";

export interface AvatarProps {
  label?: string;
  icon?: Component;
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
  size: undefined,
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

const normalizedSize = computed(() => {
  if (props.size === "xs" || props.size === "sm" || props.size === "xlarge") return props.size;
  if (props.size === "lg" || props.size === "large") return "large";
  if (props.size === "md" || props.size === "normal") return "normal";
  return undefined;
});

const sizeStep = computed(() => {
  if (normalizedSize.value === "normal") return "md";
  if (normalizedSize.value === "large") return "lg";
  if (normalizedSize.value === "xlarge") return undefined;
  return normalizedSize.value;
});

const avatarClasses = computed(() => [
  `mw-avatar--${props.shape}`,
  normalizedSize.value ? `mw-avatar--${normalizedSize.value}` : undefined,
  props.size && props.size !== normalizedSize.value ? `mw-avatar--${props.size}` : undefined,
  sizeStep.value ? `mw-size-${sizeStep.value}` : undefined,
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
        <component :is="icon" v-if="icon" class="mw-avatar__icon" aria-hidden="true" />
      </slot>
    </slot>
  </span>
</template>

<style>
.mw-avatar {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: var(--mw-avatar-size, var(--control-h));
  height: var(--mw-avatar-size, var(--control-h));
  border-radius: var(--control-radius);
  background-color: var(--fill-strong);
  color: var(--text-secondary);
  font-family: var(--font-sans);
  font-size: var(--control-font);
  font-weight: var(--weight-semibold);
  line-height: 1;
  overflow: hidden;
  user-select: none;
}

.mw-avatar--circle {
  border-radius: var(--radius-full);
}

.mw-avatar--xlarge {
  --mw-avatar-size: var(--space-12);
  --control-icon: var(--icon-2xl);
  border-radius: var(--radius-lg);
  font-size: var(--type-title-lg-size);
}

.mw-avatar--xlarge.mw-avatar--circle {
  border-radius: var(--radius-full);
}

.mw-avatar--image {
  background-color: transparent;
}

.mw-avatar__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mw-avatar__icon,
.mw-avatar > svg {
  flex: none;
  width: var(--control-icon);
  height: var(--control-icon);
  font-size: var(--control-icon);
}
</style>
