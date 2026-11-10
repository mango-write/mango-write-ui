<script setup lang="ts">
defineOptions({
  name: "MwMpFilterChip",
  inheritAttrs: true,
  options: { styleIsolation: "shared", virtualHost: false },
} as any);

export interface MpFilterChipProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  dataTestid?: string;
}

const props = withDefaults(defineProps<MpFilterChipProps>(), {
  selected: false,
  disabled: false,
  dataTestid: undefined,
});
const emit = defineEmits<{ click: [event: MouseEvent] }>();

function onClick(event: MouseEvent): void {
  if (!props.disabled) emit("click", event);
}
</script>

<template>
  <button
     type="button"
    hover-class="is-pressed"
    class="mw-mp-filter-chip"
    :class="{ 'mw-mp-filter-chip--selected is-selected': selected, 'is-disabled': disabled }"
    :disabled="disabled"
    :aria-pressed="selected ? 'true' : 'false'"
    :data-testid="dataTestid || ($attrs['data-testid'] as string | undefined)"
    @click="onClick"
  >
    <slot>{{ label }}</slot>
  </button>
</template>
