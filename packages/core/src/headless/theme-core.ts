export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const DEFAULT_THEME_STORAGE_KEY = "mango-write:theme";
export const VALID_THEME_PREFERENCES: readonly ThemePreference[] = ["system", "light", "dark"];
export const MOTION_AREA_DURATION_MS = 180;

export function parseThemePreference(raw: string | null | undefined): ThemePreference {
  return VALID_THEME_PREFERENCES.includes(raw as ThemePreference)
    ? (raw as ThemePreference)
    : "system";
}

export function resolveTheme(preference: ThemePreference, systemDark: boolean): ResolvedTheme {
  return preference === "system" ? (systemDark ? "dark" : "light") : preference;
}
