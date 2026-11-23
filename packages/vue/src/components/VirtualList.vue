<script setup lang="ts" generic="T">
import { computed, ref, type ComponentPublicInstance, type PropType } from "vue";
import { defaultRangeExtractor, useVirtualizer } from "@tanstack/vue-virtual";
import type { VirtualListHandle, VirtualListProps } from "./virtual-list-defs";

defineOptions({ name: "MwVirtualList" });
const props = defineProps({
  items: { type: Array as PropType<VirtualListProps<T>["items"]>, required: true },
  itemKey: { type: Function as PropType<VirtualListProps<T>["itemKey"]>, required: true },
  estimateSize: { type: [Number, Function] as PropType<VirtualListProps<T>["estimateSize"]>, required: true },
  overscan: { type: Number, default: 5 },
  pinnedKeys: Array as PropType<VirtualListProps<T>["pinnedKeys"]>,
});
defineSlots<{
  default(props: { item: T; index: number }): unknown;
  empty?(): unknown;
  footer?(): unknown;
}>();

const viewport = ref<HTMLDivElement | null>(null);
const focusedKey = ref<string | number>();
const keys = computed(() => props.items.map(props.itemKey));
const indexes = computed(() => new Map(keys.value.map((key, index) => [key, index])));
const getItemKey = computed(() => {
  const values = keys.value;
  return (index: number) => values[index]!;
});
const estimateSize = computed(() => {
  const size = props.estimateSize;
  if (typeof size === "number") return () => size;
  const items = props.items;
  return (index: number) => size(items[index]!, index);
});

const virtualizer = useVirtualizer<HTMLDivElement, HTMLDivElement>(computed(() => {
  const element = viewport.value;
  const retained = [...(props.pinnedKeys ?? []), focusedKey.value]
    .flatMap((key) => key === undefined ? [] : (indexes.value.get(key) ?? []));
  return {
    count: props.items.length,
    getScrollElement: () => element,
    getItemKey: getItemKey.value,
    estimateSize: estimateSize.value,
    overscan: props.overscan,
    rangeExtractor: (range) => [...new Set([...defaultRangeExtractor(range), ...retained])].sort((a, b) => a - b),
  };
}));
const rows = computed(() => virtualizer.value.getVirtualItems());
const totalSize = computed(() => virtualizer.value.getTotalSize());

function measureRow(element: Element | ComponentPublicInstance | null) {
  virtualizer.value.measureElement(element as HTMLDivElement | null);
}

function trackFocus(target: EventTarget | null) {
  const row = target instanceof Element && target.closest<HTMLElement>(".mw-virtual-list__row");
  focusedKey.value = row && row.closest(".mw-virtual-list") === viewport.value
    ? keys.value[Number(row.dataset.index)]
    : undefined;
}

const handle: VirtualListHandle = {
  scrollToKey(key, align = "start") {
    const index = indexes.value.get(key);
    if (!viewport.value || index === undefined) return false;
    virtualizer.value.scrollToIndex(index, { align, behavior: "instant" });
    return true;
  },
  scrollToStart() {
    virtualizer.value.scrollToOffset(0, { behavior: "instant" });
  },
};
defineExpose(handle);
</script>

<template>
  <div ref="viewport" class="mw-virtual-list mw-scroll" role="group" tabindex="0"
    @focusin="trackFocus($event.target)" @focusout="trackFocus($event.relatedTarget)">
    <div class="mw-virtual-list__content">
      <div v-if="items.length" class="mw-virtual-list__items" role="list" :style="{ height: `${totalSize}px` }">
        <div v-for="row in rows" :key="keys[row.index]" :ref="measureRow"
          class="mw-virtual-list__row" role="listitem" :data-index="row.index"
          :aria-posinset="row.index + 1" :aria-setsize="items.length"
          :style="{ transform: `translateY(${row.start}px)` }">
          <slot :item="items[row.index]!" :index="row.index" />
        </div>
      </div>
      <slot v-else name="empty" />
      <slot name="footer" />
    </div>
  </div>
</template>
