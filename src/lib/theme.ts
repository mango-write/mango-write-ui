// 主题偏好（issue #110 · P6；issue #117 后提升到 packages/ui 供三个前端共用）：
// 设备偏好，存本地（localStorage）——主题不是账号数据，不加后端字段。
// 三档：跟随系统 / 浅色 / 深色。
//
// 落地方式只有一件事：维护 <html data-theme="light|dark">。
// - var.css 的深色 token 与组件层的深色选择器都认这个属性；
// - 「跟随系统」= 监听 prefers-color-scheme 实时解析成显式属性（media
//   查询只在落定前读一次，动态翻深浅只能由我们把系统状态翻译成属性）；
// - var.css 另有 @media (prefers-color-scheme: dark) 块兜「JS 落定属性之前的
//   首帧」——深色系统用户不会闪白；属性一旦落定，两处选择器结论一致。
import { ref } from "vue";

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

/** 动画径向扩散的起点：鼠标/指针事件、触发元素或视口坐标。 */
export type ThemeTransitionOrigin =
  | { clientX: number; clientY: number }
  | HTMLElement
  | Event
  | null;

export interface SetThemeOptions {
  /** 径向揭幕起点；缺省取最近一次指针点击坐标或当前焦点控件中心。 */
  origin?: ThemeTransitionOrigin;
  /** 是否启用主题切换过渡动画（默认 true；初始化与减少动态效果时自动降级）。 */
  animate?: boolean;
}

/** 宿主可定制：存储键（多应用同域共存时不互踩）与主题属性落点（默认 <html>）。
 *  缺省值即 MangoWrite 两个产品站的现状，主站接入不需要传任何东西。 */
export interface ThemeOptions {
  storageKey?: string;
  /** 返回主题属性要写到的元素；返回 null（如 SSR）时跳过 DOM 写入。 */
  rootEl?: () => HTMLElement | null;
}

interface ViewTransitionLike {
  ready: Promise<void>;
  finished: Promise<void>;
  skipTransition: () => void;
}

type DocumentWithVT = Document & {
  startViewTransition?: (updateCallback: () => Promise<void> | void) => ViewTransitionLike;
};

const DEFAULT_STORAGE_KEY = "mango-write:theme";
const POINTER_FRESH_MS = 800;
const FALLBACK_TRANSITION_MS = 470;

let storageKey = DEFAULT_STORAGE_KEY;
let pickRoot: () => HTMLElement | null = () =>
  typeof document === "undefined" ? null : document.documentElement;
const VALID: readonly ThemePreference[] = ["system", "light", "dark"];

let lastPointer: { x: number; y: number; time: number } | null = null;
let pointerTrackerBound = false;
let activeTransition: ViewTransitionLike | null = null;
let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

function bindPointerTracker(): void {
  if (pointerTrackerBound || typeof window === "undefined") return;
  pointerTrackerBound = true;
  window.addEventListener(
    "pointerdown",
    (e: PointerEvent) => {
      if (Number.isFinite(e.clientX) && Number.isFinite(e.clientY)) {
        lastPointer = { x: e.clientX, y: e.clientY, time: Date.now() };
      }
    },
    { passive: true, capture: true },
  );
}

function readStored(): ThemePreference {
  if (typeof window === "undefined") return "system";
  try {
    const raw = window.localStorage.getItem(storageKey);
    return VALID.includes(raw as ThemePreference) ? (raw as ThemePreference) : "system";
  } catch {
    return "system";
  }
}

export function resolveTheme(pref: ThemePreference): ResolvedTheme {
  if (pref === "light" || pref === "dark") return pref;
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

function elementCenter(el: unknown): { x: number; y: number } | null {
  if (!el || typeof (el as Element).getBoundingClientRect !== "function") return null;
  const rect = (el as Element).getBoundingClientRect();
  if (rect.width <= 0 && rect.height <= 0) return null;
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function resolveOriginCoords(origin?: ThemeTransitionOrigin): { x: number; y: number } | null {
  if (origin) {
    const elCenter = elementCenter(origin);
    if (elCenter) return elCenter;
    const maybeCoords = origin as { clientX?: unknown; clientY?: unknown };
    if (
      typeof maybeCoords.clientX === "number" &&
      typeof maybeCoords.clientY === "number" &&
      Number.isFinite(maybeCoords.clientX) &&
      Number.isFinite(maybeCoords.clientY) &&
      (maybeCoords.clientX !== 0 || maybeCoords.clientY !== 0)
    ) {
      return { x: maybeCoords.clientX, y: maybeCoords.clientY };
    }
    const maybeEvent = origin as { currentTarget?: unknown; target?: unknown };
    const targetCenter = elementCenter(maybeEvent.currentTarget) ?? elementCenter(maybeEvent.target);
    if (targetCenter) return targetCenter;
  }

  if (lastPointer && Date.now() - lastPointer.time <= POINTER_FRESH_MS) {
    return { x: lastPointer.x, y: lastPointer.y };
  }

  if (
    typeof document !== "undefined" &&
    document.activeElement &&
    document.activeElement !== document.body &&
    document.activeElement !== document.documentElement
  ) {
    const activeCenter = elementCenter(document.activeElement);
    if (activeCenter) return activeCenter;
  }

  return null;
}

function normalizeSetThemeOptions(
  input?: ThemeTransitionOrigin | SetThemeOptions,
): SetThemeOptions {
  if (!input) return {};
  if (
    typeof input === "object" &&
    ("animate" in input || "origin" in input) &&
    !("clientX" in input) &&
    typeof (input as Element).getBoundingClientRect !== "function" &&
    !("target" in input)
  ) {
    return input as SetThemeOptions;
  }
  return { origin: input as ThemeTransitionOrigin };
}

function cleanupTransitionAttrs(root: HTMLElement): void {
  delete root.dataset.themeTransition;
  root.style.removeProperty("--mw-vt-x");
  root.style.removeProperty("--mw-vt-y");
  root.style.removeProperty("--mw-vt-r");
}

function applyThemeImmediate(pref: ThemePreference): void {
  const next = resolveTheme(pref);
  resolved.value = next;
  const root = pickRoot();
  if (root) root.dataset.theme = next;
}

function applyThemeWithTransition(
  pref: ThemePreference,
  rawOptions?: ThemeTransitionOrigin | SetThemeOptions,
): void {
  const opts = normalizeSetThemeOptions(rawOptions);
  const next = resolveTheme(pref);
  const root = pickRoot();
  const prev = (root?.dataset.theme as ResolvedTheme | undefined) ?? resolved.value;
  resolved.value = next;

  if (!root) return;
  if (prev === next || opts.animate === false) {
    root.dataset.theme = next;
    return;
  }

  const canAnimateDom =
    typeof window !== "undefined" &&
    typeof document !== "undefined" &&
    root === document.documentElement &&
    document.visibilityState !== "hidden" &&
    !root.classList.contains("mw-lowfx");

  if (!canAnimateDom) {
    root.dataset.theme = next;
    return;
  }

  const reducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const docWithVT = document as DocumentWithVT;

  if (typeof docWithVT.startViewTransition === "function") {
    if (activeTransition) {
      try {
        activeTransition.skipTransition();
      } catch {
        /* 忽略已结束的过渡 */
      }
      activeTransition = null;
    }
    if (fallbackTimer) {
      clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }

    const coords = reducedMotion ? null : resolveOriginCoords(opts.origin);
    if (coords) {
      const vw = Math.max(window.innerWidth || 0, 1);
      const vh = Math.max(window.innerHeight || 0, 1);
      const maxR = Math.hypot(
        Math.max(coords.x, vw - coords.x),
        Math.max(coords.y, vh - coords.y),
      );
      root.style.setProperty("--mw-vt-x", `${Math.round(coords.x)}px`);
      root.style.setProperty("--mw-vt-y", `${Math.round(coords.y)}px`);
      root.style.setProperty("--mw-vt-r", `${Math.ceil(maxR)}px`);
      root.dataset.themeTransition = "radial";
    } else {
      root.dataset.themeTransition = "fade";
    }

    try {
      const vt = docWithVT.startViewTransition(() => {
        root.dataset.theme = resolved.value;
      });
      activeTransition = vt;
      void vt.finished
        .catch(() => {})
        .finally(() => {
          root.dataset.theme = resolved.value;
          if (activeTransition === vt) {
            activeTransition = null;
            cleanupTransitionAttrs(root);
          }
        });
      return;
    } catch {
      cleanupTransitionAttrs(root);
      root.dataset.theme = next;
      return;
    }
  }

  root.dataset.theme = next;
  if (!reducedMotion) {
    root.dataset.themeTransition = "fallback";
    if (fallbackTimer) clearTimeout(fallbackTimer);
    fallbackTimer = setTimeout(() => {
      fallbackTimer = null;
      if (root.dataset.themeTransition === "fallback") {
        delete root.dataset.themeTransition;
      }
    }, FALLBACK_TRANSITION_MS);
  }
}

const preference = ref<ThemePreference>(readStored());
/** 当前实际生效的深浅（「跟随系统」时随 prefers-color-scheme 实时变）。 */
const resolved = ref<ResolvedTheme>(resolveTheme(preference.value));

function setTheme(
  next: ThemePreference,
  options?: ThemeTransitionOrigin | SetThemeOptions,
): void {
  preference.value = next;
  try {
    window.localStorage.setItem(storageKey, next);
  } catch {
    /* 私有模式等存不进就算了：本次会话仍生效 */
  }
  applyThemeWithTransition(next, options);
}

/** 在浅色与深色之间切换，支持传入触发事件或元素作为径向动画起点。 */
export function toggleTheme(
  options?: ThemeTransitionOrigin | SetThemeOptions,
): ResolvedTheme {
  const next: ResolvedTheme = resolved.value === "dark" ? "light" : "dark";
  setTheme(next, options);
  return next;
}

/** 挂载前调用一次（main.ts 顶部、任何 await 之前）：落定属性，避免首帧闪白。
 *  存储在应用里总早于本模块加载就绪，这里统一重读一次——顺带覆盖 options 换键
 *  的场景（模块加载期是按默认键读的）。 */
export function initTheme(options?: ThemeOptions): void {
  if (options?.storageKey) storageKey = options.storageKey;
  if (options?.rootEl) pickRoot = options.rootEl;
  bindPointerTracker();
  preference.value = readStored();
  applyThemeImmediate(preference.value);
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener?.("change", () => {
    if (preference.value === "system") applyThemeWithTransition("system", { origin: null });
  });
}

export function useThemePreference() {
  return { preference, resolved, setTheme, toggleTheme };
}
