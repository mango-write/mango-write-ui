import { MOTION_AREA_DURATION_MS } from "@mango-write/ui-core/headless/theme-core";

export { MOTION_AREA_DURATION_MS };

export function areaDurationMs(): number {
  if (typeof window === "undefined") return MOTION_AREA_DURATION_MS;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
    ? 0
    : MOTION_AREA_DURATION_MS;
}
