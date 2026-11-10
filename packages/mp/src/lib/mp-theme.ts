import { computed, inject, provide, ref, type InjectionKey, type Ref } from "vue";
import {
  DEFAULT_THEME_STORAGE_KEY,
  parseThemePreference,
  resolveTheme,
  type ResolvedTheme,
  type ThemePreference,
} from "@mango-write/ui-core/headless/theme-core";

export type { ResolvedTheme, ThemePreference };

export interface MpThemeContext {
  preference: Ref<ThemePreference>;
  systemDark: Ref<boolean>;
  resolved: Ref<ResolvedTheme>;
  debugHitArea: Ref<boolean>;
  setTheme: (next: ThemePreference) => void;
  toggleTheme: () => void;
  setDebugHitArea: (enabled: boolean) => void;
}

const MP_THEME_KEY: InjectionKey<MpThemeContext> = Symbol("MwMpTheme");
const STORAGE_KEY = DEFAULT_THEME_STORAGE_KEY;

function readStoredPreference(fallback: ThemePreference): ThemePreference {
  try {
    const g = globalThis as Record<string, any>;
    const raw =
      g.uni?.getStorageSync?.(STORAGE_KEY) ??
      g.wx?.getStorageSync?.(STORAGE_KEY) ??
      g.localStorage?.getItem?.(STORAGE_KEY);
    if (typeof raw === "string" && raw.length > 0) {
      return parseThemePreference(raw);
    }
  } catch {
    // Ignore storage access errors in restricted sandboxes
  }
  return fallback;
}

function writeStoredPreference(value: ThemePreference): void {
  try {
    const g = globalThis as Record<string, any>;
    if (g.uni?.setStorageSync) {
      g.uni.setStorageSync(STORAGE_KEY, value);
      return;
    }
    if (g.wx?.setStorageSync) {
      g.wx.setStorageSync(STORAGE_KEY, value);
      return;
    }
    g.localStorage?.setItem?.(STORAGE_KEY, value);
  } catch {
    // Ignore storage write errors
  }
}

export function createMpThemeState(initial: ThemePreference = "light"): MpThemeContext {
  const preference = ref<ThemePreference>(readStoredPreference(initial));
  const systemDark = ref<boolean>(false);
  const debugHitArea = ref<boolean>(false);

  const resolved = computed<ResolvedTheme>(() =>
    resolveTheme(preference.value, systemDark.value),
  );

  function setTheme(next: ThemePreference): void {
    preference.value = next;
    writeStoredPreference(next);
  }

  function toggleTheme(): void {
    setTheme(resolved.value === "dark" ? "light" : "dark");
  }

  function setDebugHitArea(enabled: boolean): void {
    debugHitArea.value = enabled;
  }

  return {
    preference,
    systemDark,
    resolved,
    debugHitArea,
    setTheme,
    toggleTheme,
    setDebugHitArea,
  };
}

export function provideMpTheme(initial: ThemePreference = "light"): MpThemeContext {
  const ctx = createMpThemeState(initial);
  provide(MP_THEME_KEY, ctx);
  return ctx;
}

export function useMpTheme(): MpThemeContext {
  const injected = inject(MP_THEME_KEY, null);
  if (injected) return injected;
  return createMpThemeState("light");
}
