import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  acquireOverlaySlot,
  formatOverlayLayerZ,
  formatOverlayScrimZ,
  releaseOverlaySlot,
} from "@mango-write/ui-core/headless/overlay-slot";

export {
  acquireOverlaySlot,
  formatOverlayLayerZ,
  formatOverlayScrimZ,
  releaseOverlaySlot,
};

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface OverlayZIndexHandle {
  slot: number;
  layerZ: string;
  scrimZ: string;
  zIndex: string;
  release: () => void;
}

export function acquireOverlayZIndex(): OverlayZIndexHandle {
  const slot = acquireOverlaySlot();
  const layerZ = formatOverlayLayerZ(slot)!;
  const scrimZ = formatOverlayScrimZ(slot)!;
  let released = false;
  return {
    slot,
    layerZ,
    scrimZ,
    zIndex: layerZ,
    release() {
      if (released) return;
      released = true;
      releaseOverlaySlot(slot);
    },
  };
}

export interface OverlayZIndex {
  slot: number;
  /** 内容层 z-index：`calc(var(--z-overlay) + N)` */
  layerZ: string | undefined;
  /** 遮罩层 z-index：`calc(var(--z-overlay) + N - 1)` */
  scrimZ: string | undefined;
  /** `layerZ` 的便捷别名 */
  zIndex: string | undefined;
}

export function useOverlayZIndex(open: boolean | (() => boolean)): OverlayZIndex {
  const resolvedOpen = typeof open === "function" ? open() : open;
  const [slot, setSlot] = useState<number>(0);

  useIsomorphicLayoutEffect(() => {
    if (!resolvedOpen) {
      setSlot(0);
      return;
    }
    const acquired = acquireOverlaySlot();
    setSlot(acquired);
    return () => {
      releaseOverlaySlot(acquired);
    };
  }, [resolvedOpen]);

  return useMemo(() => {
    const layerZ = formatOverlayLayerZ(slot);
    const scrimZ = formatOverlayScrimZ(slot);
    return {
      slot,
      layerZ,
      scrimZ,
      zIndex: layerZ,
    };
  }, [slot]);
}

export const useOverlayLayer = useOverlayZIndex;
