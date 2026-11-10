import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  watch,
  type Ref,
} from "vue";
import {
  acquireOverlaySlot,
  formatOverlayLayerZ,
  releaseOverlaySlot,
} from "@mango-write/ui-core/headless/overlay-slot";

const overlayStack: symbol[] = [];
let savedOverflow: string | undefined;

function focusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => element.getAttribute("aria-hidden") !== "true");
}

export function useMpOverlay(options: {
  open: () => boolean;
  close: () => void;
  panel: Ref<HTMLElement | null>;
  lockScroll?: () => boolean;
}) {
  const id = Symbol("mp-overlay");
  const slot = ref(0);
  const returnFocus = ref<HTMLElement | null>(null);
  const layerZ = computed(() => formatOverlayLayerZ(slot.value));

  function onKeydown(event: KeyboardEvent): void {
    if (overlayStack.at(-1) !== id) return;
    if (event.key === "Escape") {
      event.preventDefault();
      options.close();
      return;
    }
    if (event.key !== "Tab" || !options.panel.value) return;
    const focusable = focusableElements(options.panel.value);
    if (!focusable.length) {
      event.preventDefault();
      options.panel.value.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function cleanup(): void {
    const index = overlayStack.indexOf(id);
    if (index >= 0) overlayStack.splice(index, 1);
    if (slot.value) {
      releaseOverlaySlot(slot.value);
      slot.value = 0;
    }
    if (typeof document !== "undefined") {
      document.removeEventListener("keydown", onKeydown, true);
      if (!overlayStack.length && savedOverflow !== undefined) {
        document.body.style.overflow = savedOverflow;
        savedOverflow = undefined;
      }
    }
    if (returnFocus.value?.isConnected) returnFocus.value.focus();
    returnFocus.value = null;
  }

  watch(
    options.open,
    async (open) => {
      if (!open) {
        cleanup();
        return;
      }
      if (!slot.value) slot.value = acquireOverlaySlot();
      overlayStack.push(id);
      if (typeof document === "undefined") return;
      returnFocus.value = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      if (options.lockScroll?.() ?? true) {
        if (!overlayStack.filter((entry) => entry !== id).length) {
          savedOverflow = document.body.style.overflow;
          document.body.style.overflow = "hidden";
        }
      }
      document.addEventListener("keydown", onKeydown, true);
      await nextTick();
      const panel = options.panel.value;
      if (!panel) return;
      const target = focusableElements(panel)[0] ?? panel;
      target.focus();
    },
  );

  onBeforeUnmount(cleanup);
  return { layerZ };
}
