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
