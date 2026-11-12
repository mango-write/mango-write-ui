import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

export type ComboPanelAnchor =
  | RefObject<HTMLElement | null>
  | (() => DOMRect | null);

export type ComboPanelPlacement = "bottom" | "right";
export type ComboPanelSide = "top" | "bottom" | "right";

export interface ComboPanelOptions {
  zIndex?: number;
  placement?: ComboPanelPlacement | (() => ComboPanelPlacement);
  matchTriggerWidth?: boolean;
  onClose?: () => void;
}

export interface ComboPanelReturn {
  open: boolean;
  panelStyle: CSSProperties;
  side: ComboPanelSide;
  openPanel: () => void;
  closePanel: () => void;
  reposition: () => void;
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useComboPanel(
  anchor: ComboPanelAnchor,
  panel: RefObject<HTMLElement | null>,
  options: ComboPanelOptions = {},
): ComboPanelReturn {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});
  const [side, setSide] = useState<ComboPanelSide>("bottom");

  const openRef = useRef(open);
  openRef.current = open;
  const anchorRef = useRef(anchor);
  anchorRef.current = anchor;
  const panelRefHolder = useRef(panel);
  panelRefHolder.current = panel;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const computeAndApplyPosition = useCallback(() => {
    if (typeof window === "undefined") return;
    const currentAnchor = anchorRef.current;
    const r =
      typeof currentAnchor === "function"
        ? currentAnchor()
        : (currentAnchor.current?.getBoundingClientRect() ?? null);
    if (!r) return;

    const panelEl = panelRefHolder.current.current;
    const panelH = panelEl?.offsetHeight ?? 0;
    const panelW = panelEl?.offsetWidth ?? 0;
    const opts = optionsRef.current;

    const anchorLayerZ = (): number | null => {
      if (typeof currentAnchor === "function") return null;
      let max: number | null = null;
      for (
        let el = currentAnchor.current;
        el && el !== document.body;
        el = el.parentElement
      ) {
        const z = Number.parseInt(getComputedStyle(el).zIndex, 10);
        if (Number.isFinite(z) && (max === null || z > max)) max = z;
      }
      return max;
    };

    const floor = opts.zIndex ?? 1300;
    const zIndex = String(Math.max(floor, (anchorLayerZ() ?? 0) + 1));

    const placement =
      typeof opts.placement === "function" ? opts.placement() : opts.placement;

    if (placement === "right") {
      setSide("right");
      const left =
        panelW > 0
          ? Math.max(8, Math.min(r.right + 8, window.innerWidth - panelW - 8))
          : r.right + 8;
      const top =
        panelH > 0
          ? Math.max(8, Math.min(r.top - 4, window.innerHeight - panelH - 8))
          : r.top - 4;
      setPanelStyle({
        position: "fixed",
        left: `${Math.round(left)}px`,
        top: `${Math.round(top)}px`,
        zIndex,
      });
      return;
    }

    const below = window.innerHeight - r.bottom;
    const flip = below < Math.min(panelH || 240, 240) && r.top > below;
    const left =
      panelW > 0
        ? Math.max(8, Math.min(r.left, window.innerWidth - panelW - 8))
        : r.left;

    setSide(flip ? "top" : "bottom");
    setPanelStyle({
      position: "fixed",
      left: `${Math.round(left)}px`,
      ...(opts.matchTriggerWidth === false
        ? {}
        : { minWidth: `${Math.round(r.width)}px` }),
      zIndex,
      ...(flip
        ? { bottom: `${Math.round(window.innerHeight - r.top + 2)}px` }
        : { top: `${Math.round(r.bottom + 2)}px` }),
    });
  }, []);

  const closePanel = useCallback(() => {
    if (!openRef.current) return;
    openRef.current = false;
    setOpen(false);
    optionsRef.current.onClose?.();
  }, []);

  const openPanel = useCallback(() => {
    if (openRef.current) return;
    openRef.current = true;
    computeAndApplyPosition();
    setOpen(true);
  }, [computeAndApplyPosition]);

  useIsomorphicLayoutEffect(() => {
    if (!open || typeof document === "undefined" || typeof window === "undefined") {
      return;
    }

    computeAndApplyPosition();
    let rafId: number | null = null;
    if (typeof requestAnimationFrame === "function") {
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (openRef.current) computeAndApplyPosition();
      });
    }

    const onDocPointerDown = (e: PointerEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      const currentAnchor = anchorRef.current;
      if (typeof currentAnchor !== "function" && currentAnchor.current?.contains(t)) {
        return;
      }
      if (panelRefHolder.current.current?.contains(t)) {
        return;
      }
      closePanel();
    };

    const onDocKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closePanel();
      }
    };

    const onScrollOrResize = () => {
      if (openRef.current) computeAndApplyPosition();
    };

    document.addEventListener("pointerdown", onDocPointerDown, true);
    document.addEventListener("keydown", onDocKeydown, true);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize, true);

    return () => {
      if (rafId !== null && typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(rafId);
      }
      document.removeEventListener("pointerdown", onDocPointerDown, true);
      document.removeEventListener("keydown", onDocKeydown, true);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize, true);
    };
  }, [open, computeAndApplyPosition, closePanel]);

  return {
    open,
    panelStyle,
    side,
    openPanel,
    closePanel,
    reposition: computeAndApplyPosition,
  };
}
