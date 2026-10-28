// 公共组件与主题入口；CSS 通过独立样式入口引入。
export { MangoPreset } from "./theme";
export { MangoPresetLite } from "./theme-lite";
export { default as AppLogo } from "./components/AppLogo.vue";
export { default as ActionMenu } from "./components/ActionMenu.vue";
export { type ActionMenuItem } from "./components/action-menu";
export { default as FileDropZone } from "./components/FileDropZone.vue";
export { default as PageHeader } from "./components/PageHeader.vue";
export { default as FormField } from "./components/FormField.vue";
export { default as HoverCard } from "./components/HoverCard.vue";
export { default as ImageLightbox } from "./components/ImageLightbox.vue";
export { default as SearchableMultiSelect } from "./components/SearchableMultiSelect.vue";
export { default as SearchableSelect } from "./components/SearchableSelect.vue";
export { default as SiteHeader } from "./components/site/SiteHeader.vue";
export { default as SiteFooter } from "./components/site/SiteFooter.vue";
export { default as UserChip } from "./components/UserChip.vue";
export { default as UserCard } from "./components/UserCard.vue";
export { type UserProfile } from "./components/UserCard.vue";
export { default as UserSelect } from "./components/UserSelect.vue";
export { type UserSelectOption } from "./components/user-select";
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
