// 公共组件与主题入口；CSS 通过独立样式入口引入。
export { MangoPreset } from "./theme";
export { MangoPresetLite } from "./theme-lite";
export { default as AppLogo } from "./components/AppLogo.vue";
export { default as FormField } from "./components/FormField.vue";
export { default as HoverCard } from "./components/HoverCard.vue";
export { default as ImageLightbox } from "./components/ImageLightbox.vue";
export { default as SearchableMultiSelect } from "./components/SearchableMultiSelect.vue";
export { default as SearchableSelect } from "./components/SearchableSelect.vue";
export { default as SiteHeader } from "./components/site/SiteHeader.vue";
export { default as SiteFooter } from "./components/site/SiteFooter.vue";
export { useComboPanel, type ComboPanelAnchor, type ComboPanelOptions, type ComboPanelPlacement } from "./lib/useComboPanel";
export { vTooltip } from "./lib/tooltip";
export {
  initTheme,
  resolveTheme,
  useThemePreference,
  type ResolvedTheme,
  type ThemePreference,
} from "./lib/theme";
export {
  computeHoverCardPosition,
  isRectOutsideViewport,
  type HoverCardPlacement,
} from "./lib/hover-card";
export {
  mergeUiMessages,
  uiMessages,
  type UiLocaleSource,
  type UiMessages,
} from "./locale";

export { default as AsyncSlot } from "./components/AsyncSlot.vue";
