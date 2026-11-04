<script setup lang="ts">
import { ref } from "vue";

defineOptions({ name: "MwChip" });

withDefaults(
  defineProps<{
    label?: string;
    icon?: string;
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
  <div v-if="visible" class="mw-chip p-chip p-component" :aria-label="label">
    <slot>
      <img v-if="image" :src="image" class="mw-chip__image p-chip-image" alt="" />
      <span v-else-if="icon" class="mw-chip__icon p-chip-icon" :class="icon" aria-hidden="true" />
      <span v-if="label" class="mw-chip__label p-chip-label">{{ label }}</span>
    </slot>
    <slot
      v-if="removable"
      name="removeicon"
      :remove-callback="removeCallback"
      :keydown-callback="keydownCallback"
    >
      <button
        type="button"
        class="mw-chip__remove p-chip-remove-icon"
        aria-label="Remove"
        @click.stop="removeCallback"
        @keydown="keydownCallback"
      >
        <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M4 4L10 10M10 4L4 10"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </slot>
  </div>
</template>
