// A lightweight dropdown-panel controller for combobox-style widgets
// (SearchableSelect / SearchableMultiSelect) and small anchored popovers
// (章节编号浮层). PrimeVue's Popover fights a focus-driven "type to filter"
// flow — it dismisses itself mid-typing — so these widgets manage their own
// teleported panel instead:
//   • opens on focus/click, stays open while typing in the trigger's input,
//   • closes only on outside pointerdown, Escape, or an explicit call,
//   • positions with fixed coords (flips above when there's no room below) and
//     RE-ALIGNS on scroll/resize — the panel follows its anchor instead of
//     blocking the page behind a full-screen backdrop.
//
// The anchor is either a static element ref (combobox) or a rect getter
// (decoration widgets whose DOM node is rebuilt on every transaction — the
// getter re-resolves the live rect on each scroll frame).
import { onBeforeUnmount, ref, type Ref } from "vue";

export type ComboPanelAnchor = Ref<HTMLElement | null> | (() => DOMRect | null);

export type ComboPanelPlacement = "bottom" | "right";

export interface ComboPanelOptions {
  /**
   * 面板 z-index 的下限：锚点祖先链上没有更高浮层时用它；函数锚点拿不到
   * DOM，恒用它。
   *
   * 默认 1300：低于它的页面内层级（吸顶栏等）压不住面板，高于它的只剩
   * PrimeVue 浮层——那部分不靠这个常数，见 anchorLayerZ。
   */
  zIndex?: number;
  /**
   * "bottom" (default) opens below the anchor and flips above when there is no
   * room. "right" opens beside the anchor's right edge — for popovers whose
   * anchor column carries MORE clickable markers below it (章节号 / 列表 marker
   * widget): opening below would cover the numbers of the following blocks and
   * make them unclickable while the panel is open.
   *
   * 传函数 = 每次定位现算：同一个面板被不同入口打开时放置方式不同（点正文里
   * 的号要向右开，点工具栏按钮要在按钮下方开）。放置方式跟着**入口**走，不跟
   * 着面板走——面板只有一个，入口有好几个。
   */
  placement?: ComboPanelPlacement | (() => ComboPanelPlacement);
}

export function useComboPanel(
  anchor: ComboPanelAnchor,
  panel: Ref<HTMLElement | null>,
  options: ComboPanelOptions = {},
) {
  const open = ref(false);
  const panelStyle = ref<Record<string, string>>({});

  function anchorRect(): DOMRect | null {
    return typeof anchor === "function" ? anchor() : (anchor.value?.getBoundingClientRect() ?? null);
  }

  /**
   * 锚点所在浮层的最小 z-index：祖先链上出现过的最大 z-index。PrimeVue 的浮层
   * 计数器全站共享、只增不降（跨浮层类型跳变时一次 +1100+），长会话里 Dialog
   * 遮罩能越过任何固定常数——触发器在 Dialog 里时面板必须贴着遮罩上面落。
   */
  function anchorLayerZ(): number | null {
    if (typeof anchor === "function") return null;
    let max: number | null = null;
    for (let el = anchor.value; el && el !== document.body; el = el.parentElement) {
      const z = Number.parseInt(getComputedStyle(el).zIndex, 10);
      if (Number.isFinite(z) && (max === null || z > max)) max = z;
    }
    return max;
  }

  function panelZIndex(): number {
    const floor = options.zIndex ?? 1300;
    return Math.max(floor, (anchorLayerZ() ?? 0) + 1);
  }

  function reposition() {
    const r = anchorRect();
    if (!r) return;
    const panelH = panel.value?.offsetHeight ?? 0;
    const panelW = panel.value?.offsetWidth ?? 0;
    const placement =
      typeof options.placement === "function" ? options.placement() : options.placement;
    if (placement === "right") {
      // 夹进视口：右侧放不下时往左收（极窄视口下可能回盖锚点列，可接受兜底）。
      const left =
        panelW > 0
          ? Math.max(8, Math.min(r.right + 8, window.innerWidth - panelW - 8))
          : r.right + 8;
      const top =
        panelH > 0
          ? Math.max(8, Math.min(r.top - 4, window.innerHeight - panelH - 8))
          : r.top - 4;
      panelStyle.value = {
        position: "fixed",
        left: `${Math.round(left)}px`,
        top: `${Math.round(top)}px`,
        zIndex: String(panelZIndex()),
      };
      return;
    }
    const below = window.innerHeight - r.bottom;
    const flip = below < Math.min(panelH || 240, 240) && r.top > below;
    // 夹进视口：锚点贴右边缘时面板不能溢出去。
    const left = panelW > 0 ? Math.max(8, Math.min(r.left, window.innerWidth - panelW - 8)) : r.left;
    panelStyle.value = {
      position: "fixed",
      left: `${Math.round(left)}px`,
      minWidth: `${Math.round(r.width)}px`,
      zIndex: String(panelZIndex()),
      ...(flip
        ? { bottom: `${Math.round(window.innerHeight - r.top + 2)}px` }
        : { top: `${Math.round(r.bottom + 2)}px` }),
    };
  }

  function onDocPointerDown(e: PointerEvent) {
    const t = e.target as Node;
    if (typeof anchor !== "function" && anchor.value?.contains(t)) return;
    if (panel.value?.contains(t)) return;
    closePanel();
  }
  function onDocKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") closePanel();
  }
  function onScroll() {
    if (open.value) reposition();
  }

  function bind() {
    document.addEventListener("pointerdown", onDocPointerDown, true);
    document.addEventListener("keydown", onDocKeydown, true);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll, true);
  }
  function unbind() {
    document.removeEventListener("pointerdown", onDocPointerDown, true);
    document.removeEventListener("keydown", onDocKeydown, true);
    window.removeEventListener("scroll", onScroll, true);
    window.removeEventListener("resize", onScroll, true);
  }

  function openPanel() {
    if (open.value) return;
    open.value = true;
    bind();
    reposition(); // provisional (below) placement so the panel renders in place…
    requestAnimationFrame(reposition); // …then refine once its height is known (flip).
  }
  function closePanel() {
    if (!open.value) return;
    open.value = false;
    unbind();
  }

  onBeforeUnmount(unbind);

  return { open, panelStyle, openPanel, closePanel, reposition };
}
