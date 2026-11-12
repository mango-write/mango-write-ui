import { useSyncExternalStore } from "react";
import {
  DEFAULT_THEME_STORAGE_KEY,
  parseThemePreference,
  type ResolvedTheme,
  type ThemePreference,
} from "@mango-write/ui-core/headless/theme-core";

export { type ResolvedTheme, type ThemePreference };

/** 动画径向扩散的起点：鼠标/指针事件（原生或 React 合成事件）、触发元素或视口坐标。 */
export type ThemeTransitionOrigin =
  | { clientX: number; clientY: number }
  | HTMLElement
  | Event
  | {
      clientX?: number;
      clientY?: number;
      currentTarget?: EventTarget | null;
      target?: EventTarget | null;
    }
  | null;

export interface SetThemeOptions {
  origin?: ThemeTransitionOrigin;
  animate?: boolean;
}

export interface ThemeOptions {
  storageKey?: string;
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

interface ThemeSnapshot {
  preference: ThemePreference;
  resolved: ResolvedTheme;
}

const DEFAULT_STORAGE_KEY = DEFAULT_THEME_STORAGE_KEY;
const POINTER_FRESH_MS = 800;
const FALLBACK_TRANSITION_MS = 470;
const SERVER_SNAPSHOT: ThemeSnapshot = { preference: "system", resolved: "light" };

let storageKey = DEFAULT_STORAGE_KEY;
let pickRoot: () => HTMLElement | null = () =>
  typeof document === "undefined" ? null : document.documentElement;

let lastPointer: { x: number; y: number; time: number } | null = null;
let pointerTrackerBound = false;
let storageListenerBound = false;
let cleanupMediaListener: (() => void) | null = null;
let activeTransition: ViewTransitionLike | null = null;
let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

const listeners = new Set<() => void>();

function readStored(): ThemePreference {
  if (typeof window === "undefined") return "system";
  try {
    return parseThemePreference(window.localStorage.getItem(storageKey));
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

let currentPreference: ThemePreference = readStored();
let currentResolved: ResolvedTheme = resolveTheme(currentPreference);
let currentSnapshot: ThemeSnapshot = {
  preference: currentPreference,
  resolved: currentResolved,
};

function updateState(nextPref: ThemePreference, nextResolved: ResolvedTheme): void {
  if (
    currentSnapshot.preference === nextPref &&
    currentSnapshot.resolved === nextResolved
  ) {
    return;
  }
  currentPreference = nextPref;
  currentResolved = nextResolved;
  currentSnapshot = { preference: nextPref, resolved: nextResolved };
  for (const listener of listeners) {
    listener();
  }
}

function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getThemeSnapshot(): ThemeSnapshot {
  return currentSnapshot;
}

function getServerThemeSnapshot(): ThemeSnapshot {
  return SERVER_SNAPSHOT;
}

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

function bindStorageTracker(): void {
  if (storageListenerBound || typeof window === "undefined") return;
  storageListenerBound = true;
  window.addEventListener("storage", (e: StorageEvent) => {
    if (e.key !== null && e.key !== storageKey) return;
    const nextPref = readStored();
    applyThemeImmediate(nextPref);
  });
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
    const targetCenter =
      elementCenter(maybeEvent.currentTarget) ?? elementCenter(maybeEvent.target);
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
  updateState(pref, next);
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
  const prev = (root?.dataset.theme as ResolvedTheme | undefined) ?? currentResolved;
  updateState(pref, next);

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
        root.dataset.theme = currentResolved;
      });
      activeTransition = vt;
      void vt.finished
        .catch(() => {})
        .finally(() => {
          root.dataset.theme = currentResolved;
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

export function setTheme(
  next: ThemePreference,
  options?: ThemeTransitionOrigin | SetThemeOptions,
): void {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, next);
    }
  } catch {
    /* 私有模式等存不进时本次会话仍生效 */
  }
  applyThemeWithTransition(next, options);
}

export function toggleTheme(
  options?: ThemeTransitionOrigin | SetThemeOptions,
): ResolvedTheme {
  const next: ResolvedTheme = currentResolved === "dark" ? "light" : "dark";
  setTheme(next, options);
  return next;
}

export function initTheme(options?: ThemeOptions): void {
  if (options?.storageKey) storageKey = options.storageKey;
  if (options?.rootEl) pickRoot = options.rootEl;
  bindPointerTracker();
  bindStorageTracker();
  const stored = readStored();
  applyThemeImmediate(stored);

  cleanupMediaListener?.();
  cleanupMediaListener = null;

  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onChange = () => {
    if (currentPreference === "system") {
      applyThemeWithTransition("system", { origin: null });
    }
  };
  media.addEventListener?.("change", onChange);
  cleanupMediaListener = () => {
    media.removeEventListener?.("change", onChange);
  };
}

export interface UseThemePreferenceReturn {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setTheme: typeof setTheme;
  toggleTheme: typeof toggleTheme;
}

export function useThemePreference(): UseThemePreferenceReturn {
  const snap = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  return {
    preference: snap.preference,
    resolved: snap.resolved,
    setTheme,
    toggleTheme,
  };
}
