import { computed, onBeforeUnmount, ref, watch, type ComputedRef } from "vue";
import {
  acquireOverlaySlot,
  formatOverlayLayerZ,
  formatOverlayScrimZ,
  releaseOverlaySlot,
} from "@mango-write/ui-core/headless/overlay-slot";

export { acquireOverlaySlot, releaseOverlaySlot };

interface OverlayLayer {
  /** 内容层 z-index；关闭后保留末值供退场动画使用，元素卸载即失效。 */
  layerZ: ComputedRef<string | undefined>;
  /** 遮罩层 z-index（比内容层低一级）；无遮罩的浮层不绑定。 */
  scrimZ: ComputedRef<string | undefined>;
}

export function useOverlayLayer(isOpen: () => boolean): OverlayLayer {
  const slot = ref(0);

  watch(
    isOpen,
    (open) => {
      if (open) {
        if (!slot.value) slot.value = acquireOverlaySlot();
      } else if (slot.value) {
        releaseOverlaySlot(slot.value);
        slot.value = 0;
      }
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    if (slot.value) releaseOverlaySlot(slot.value);
  });

  const layerZ = computed(() => formatOverlayLayerZ(slot.value));
  const scrimZ = computed(() => formatOverlayScrimZ(slot.value));

  return { layerZ, scrimZ };
}
