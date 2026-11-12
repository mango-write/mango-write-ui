import type { ReactNode } from "react";
import { CONTROL_REACT_ENTRIES } from "./entries-controls";
import { DISPLAY_OVERLAY_REACT_ENTRIES } from "./entries-display-overlays";
import type { ReactEntryRenderer, ReactPreviewContext } from "./types";

export const REACT_USAGE_ENTRIES: Record<string, ReactEntryRenderer> = {
  ...CONTROL_REACT_ENTRIES,
  ...DISPLAY_OVERLAY_REACT_ENTRIES,
};

export function renderReactUsageEntry(slug: string, ctx: ReactPreviewContext): ReactNode {
  const renderer = REACT_USAGE_ENTRIES[slug];
  if (!renderer) {
    return (
      <span className="rp-missing">
        {ctx.locale === "zh-CN" ? `未注册预览：${slug}` : `Unregistered preview: ${slug}`}
      </span>
    );
  }
  return renderer(ctx);
}
