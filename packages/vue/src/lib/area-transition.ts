import { MOTION_AREA_DURATION_MS } from "@mango-write/ui-core/headless/theme-core";

export { MOTION_AREA_DURATION_MS };

export function areaDurationMs(): number {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ? 0 : MOTION_AREA_DURATION_MS;
}
