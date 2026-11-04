// 公共组件与主题入口；CSS 通过独立样式入口引入。
export { MangoPreset } from "./theme";
export { MangoPresetLite } from "./theme-lite";
export { default as AppLogo } from "./components/AppLogo.vue";
export { default as ActionMenu } from "./components/ActionMenu.vue";
export { type ActionMenuItem } from "./components/action-menu";
export { default as Avatar } from "./components/Avatar.vue";
export { default as Badge } from "./components/Badge.vue";
export { default as Button } from "./components/Button.vue";
export {
  type ButtonIconPosition,
  type ButtonProps,
  type ButtonSeverity,
  type ButtonSize,
  type ButtonVariant,
  type NativeButtonType,
} from "./components/button";
export { default as Checkbox } from "./components/Checkbox.vue";
export { default as ConfirmHost } from "./components/ConfirmHost.vue";
export { default as Dialog } from "./components/Dialog.vue";
export { type DialogEmits, type DialogProps } from "./components/dialog";
export { default as FileDropZone } from "./components/FileDropZone.vue";
export { default as PageHeader } from "./components/PageHeader.vue";
export { default as NotFoundPage } from "./components/NotFoundPage.vue";
export { default as FormField } from "./components/FormField.vue";
export { default as HoverCard } from "./components/HoverCard.vue";
export { default as ImageLightbox } from "./components/ImageLightbox.vue";
export { default as InputText } from "./components/InputText.vue";
export { default as Message } from "./components/Message.vue";
export { default as Popover } from "./components/Popover.vue";
export { default as ProgressBar } from "./components/ProgressBar.vue";
export { default as SearchableMultiSelect } from "./components/SearchableMultiSelect.vue";
export { default as SearchableSelect } from "./components/SearchableSelect.vue";
export { default as Select } from "./components/Select.vue";
export {
  type SelectChangeEvent,
  type SelectFilterEvent,
  type SelectOptionAccessor,
  type SelectProps,
  type SelectSize,
} from "./components/select";
export { default as SiteHeader } from "./components/site/SiteHeader.vue";
export { default as SiteFooter } from "./components/site/SiteFooter.vue";
export { default as Tabs } from "./components/Tabs.vue";
export { default as TabList } from "./components/TabList.vue";
export { default as Tab } from "./components/Tab.vue";
export { default as TabPanels } from "./components/TabPanels.vue";
export { default as TabPanel } from "./components/TabPanel.vue";
export {
  type TabListProps,
  type TabPanelProps,
  type TabPanelsProps,
  type TabProps,
  type TabsEmits,
  type TabsProps,
  type TabValue,
} from "./components/tabs";
export { default as Tag } from "./components/Tag.vue";
export { default as Textarea } from "./components/Textarea.vue";
export { default as ToastHost } from "./components/ToastHost.vue";
export { default as ToggleSwitch } from "./components/ToggleSwitch.vue";
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
  CONFIRM_KEY,
  createConfirmStore,
  provideConfirm,
  useConfirm,
  validateLegacyConfirmOptions,
  type ConfirmOptions,
  type ConfirmRequest,
  type ConfirmStore,
  type LegacyConfirmButtonProps,
  type LegacyConfirmRequireOptions,
} from "./lib/confirm";
export {
  NOTIFY_KEY,
  createNotifyStore,
  provideNotify,
  useNotify,
  type NotifyStore,
  type ToastAction,
  type ToastMessage,
  type ToastMessageOptions,
  type ToastSeverity,
} from "./lib/notify";
export {
  mergeUiMessages,
  uiMessages,
  type UiLocaleSource,
  type UiMessages,
} from "./locale";

export { default as AsyncSlot } from "./components/AsyncSlot.vue";
export { default as AsyncSearchSelect } from "./components/AsyncSearchSelect.vue";
export { type AsyncSearchOption } from "./components/async-search-select";
