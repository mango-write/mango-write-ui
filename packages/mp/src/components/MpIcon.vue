<script setup lang="ts">
import { computed } from "vue";

defineOptions({
  name: "MwMpIcon",
  options: { styleIsolation: "shared", virtualHost: true },
} as any);

const paths = {
  journal: '<path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M8 8h4M8 12h4M8 16h3"/><path d="m16 5 3 3-6 6-3 1 1-3Z"/>',
  library: '<path d="m4 19 1-14a2 2 0 0 1 2-2h3v18H7a3 3 0 0 0-3 3Z"/><path d="M10 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-8Z"/><path d="M13 8h4M13 12h4"/>',
  assistant: '<path d="m12 3 1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7Z"/><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9Z"/><path d="m5 14 .8 1.7L7.5 16l-1.7.8L5 18.5l-.8-1.7L2.5 16l1.7-.3Z"/>',
  context: '<path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="M8 7h8M8 11h8M8 15h5"/>',
  grid: '<rect width="7" height="7" x="3" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="14" rx="1.5"/><rect width="7" height="7" x="3" y="14" rx="1.5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  "chevron-down": '<path d="m6 9 6 6 6-6"/>',
  "chevron-left": '<path d="m15 18-6-6 6-6"/>',
  "chevron-right": '<path d="m9 18 6-6-6-6"/>',
  "arrow-left": '<path d="m15 18-6-6 6-6M9 12h11"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  loading: '<path d="M21 12a9 9 0 1 1-6.2-8.56"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  quote: '<path d="M3 21c3 0 7-1 7-8V5H3v8h4c0 4-4 4-4 4v4Zm11 0c3 0 7-1 7-8V5h-7v8h4c0 4-4 4-4 4v4Z"/>',
  success: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  warning: '<path d="M10.3 3.6 2.4 18a2 2 0 0 0 1.8 3h15.6a2 2 0 0 0 1.8-3L13.7 3.6a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
  error: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
  filter: '<path d="M4 5h16M7 12h10M10 19h4"/>',
  edit: '<path d="M12 20h9"/><path d="m16.5 3.5 4 4L8 20l-5 1 1-5Z"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v5M14 11v5"/>',
  attachment: '<path d="m21.4 11.6-8.9 8.9a6 6 0 0 1-8.5-8.5l9.6-9.6a4 4 0 0 1 5.7 5.7l-9.6 9.6a2 2 0 1 1-2.8-2.8l8.9-8.9"/>',
} as const;

export type MpIconName = keyof typeof paths;

export interface MpIconProps {
  name: MpIconName;
  size?: number;
  spin?: boolean;
}

const props = withDefaults(defineProps<MpIconProps>(), { size: 24, spin: false });
const iconStyle = computed(() => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[props.name]}</svg>`;
  return {
    "--mw-mp-icon-image": `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
    width: `${props.size}px`,
    height: `${props.size}px`,
  };
});
</script>

<template>
  <span
    :data-testid="($attrs['data-testid'] as string | undefined)"
    class="mw-mp-icon"
    :class="[{ 'mw-mp-icon--spin': spin || name === 'loading' }, $attrs.class]"
    :style="iconStyle"
    aria-hidden="true"
  />
</template>
