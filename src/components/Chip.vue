<script setup lang="ts">
import { ref, type Component } from "vue";
import { X } from "lucide-vue-next";

defineOptions({ name: "MwChip" });

withDefaults(
  defineProps<{
    label?: string;
    icon?: Component;
    image?: string;
    removable?: boolean;
  }>(),
  {
    label: undefined,
    icon: undefined,
    image: undefined,
    removable: false,
  },
);

const emit = defineEmits<{
  remove: [event: Event];
}>();

const visible = ref(true);

function removeCallback(event: Event): void {
  visible.value = false;
  emit("remove", event);
}

function keydownCallback(event: KeyboardEvent): void {
  if (event.key === "Enter" || event.key === "Backspace" || event.key === " ") {
    event.preventDefault();
    removeCallback(event);
  }
}
</script>

<template>
  <div v-if="visible" class="mw-chip" :aria-label="label">
    <slot>
      <img v-if="image" :src="image" class="mw-chip__image" alt="" />
      <component :is="icon" v-else-if="icon" class="mw-chip__icon" aria-hidden="true" />
      <span v-if="label" class="mw-chip__label">{{ label }}</span>
    </slot>
    <slot
      v-if="removable"
      name="removeicon"
      :remove-callback="removeCallback"
      :keydown-callback="keydownCallback"
    >
      <button
        type="button"
        class="mw-chip__remove"
        aria-label="Remove"
        @click.stop="removeCallback"
        @keydown="keydownCallback"
      >
        <X class="mw-chip__remove-icon" aria-hidden="true" />
      </button>
    </slot>
  </div>
</template>

<style>
.mw-chip {
  display: inline-flex;
  align-items: center;
  box-sizing: border-box;
  gap: var(--space-1-5);
  min-height: calc(var(--control-h) - var(--space-2));
  padding-inline: calc(var(--control-px) * 0.5 + var(--space-1));
  border-radius: var(--radius-full);
  background-color: var(--fill-default);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: calc(var(--control-font) - var(--space-px));
  font-weight: var(--weight-medium);
  line-height: var(--type-caption-line);
  white-space: nowrap;
}

.mw-chip:has(> .mw-chip__image) {
  padding-inline-start: var(--space-0-5);
}

.mw-chip:has(> .mw-chip__remove) {
  padding-inline-end: var(--space-1);
}

.mw-chip__image {
  flex: none;
  width: calc(var(--control-h) - var(--space-3));
  height: calc(var(--control-h) - var(--space-3));
  border-radius: var(--radius-full);
  object-fit: cover;
}

.mw-chip__icon {
  flex: none;
  width: calc(var(--control-icon) - var(--space-0-5));
  height: calc(var(--control-icon) - var(--space-0-5));
  font-size: calc(var(--control-icon) - var(--space-0-5));
  color: var(--text-secondary);
}

.mw-chip__remove {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: var(--control-icon);
  height: var(--control-icon);
  padding: 0;
  border: none;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
}

.mw-chip__remove:hover {
  background-color: var(--fill-strong);
  color: var(--text-primary);
}

.mw-chip__remove:focus-visible {
  outline: var(--focus-width) solid var(--focus-color);
  outline-offset: 0;
}

.mw-chip__remove svg {
  width: calc(var(--control-icon) * 0.75);
  height: calc(var(--control-icon) * 0.75);
}

@media (prefers-reduced-motion: reduce) {
  .mw-chip__remove {
    transition: none;
  }
}
</style>
