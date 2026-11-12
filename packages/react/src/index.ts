// 公共组件与主题入口；CSS 通过独立样式入口引入。
export { default as AppLogo, type AppLogoProps } from "./components/AppLogo";
export { default as ActionMenu } from "./components/ActionMenu";
export {
  type ActionMenuCommandEvent,
  type ActionMenuEventLike,
  type ActionMenuHandle,
  type ActionMenuIcon,
  type ActionMenuItem,
  type ActionMenuPoint,
  type ActionMenuProps,
  type ActionMenuTriggerRenderProps,
} from "./components/action-menu";
export {
  default as Avatar,
  type AvatarIcon,
  type AvatarIconComponent,
  type AvatarProps,
  type AvatarShape,
  type AvatarSize,
} from "./components/Avatar";
export {
  default as Badge,
  type BadgeProps,
  type BadgeSeverity,
  type BadgeSize,
} from "./components/Badge";
export { default as Button } from "./components/Button";
export {
  type ButtonIconComponent,
  type ButtonIconPosition,
  type ButtonIconProp,
  type ButtonProps,
  type ButtonSeverity,
  type ButtonSize,
  type ButtonVariant,
  type NativeButtonType,
} from "./components/button-defs";
export {
  default as Checkbox,
  type CheckboxChangeEvent,
  type CheckboxProps,
  type CheckboxSize,
} from "./components/Checkbox";
export {
  default as ConfirmHost,
  type ConfirmHostMessageRenderProps,
  type ConfirmHostProps,
  type ConfirmHostRenderProps,
} from "./components/ConfirmHost";
export { default as Dialog } from "./components/Dialog";
export { type DialogEmits, type DialogProps, type DialogSize } from "./components/dialog-defs";
export {
  default as FileDropZone,
  type FileDropZoneProps,
  type FileDropZoneSurface,
} from "./components/FileDropZone";
export { default as PageHeader, type PageHeaderProps } from "./components/PageHeader";
export { default as NotFoundPage, type NotFoundPageProps } from "./components/NotFoundPage";
export { default as FormField, type FormFieldProps } from "./components/FormField";
export {
  FormFieldContext,
  mergeDescribedBy,
  useFormFieldContext,
  type FormFieldContextValue,
  type FormFieldSlotProps,
} from "./components/form-field-context";
export { default as HoverCard, type HoverCardProps } from "./components/HoverCard";
export { default as ImageLightbox, type ImageLightboxProps } from "./components/ImageLightbox";
export {
  default as InputText,
  type InputTextProps,
  type InputTextSize,
} from "./components/InputText";
export {
  default as Message,
  type MessageIcon,
  type MessageIconComponent,
  type MessageProps,
  type MessageSeverity,
} from "./components/Message";
export {
  default as Popover,
  type PopoverAlign,
  type PopoverAnchorInput,
  type PopoverContentRenderProps,
  type PopoverHandle,
  type PopoverProps,
  type PopoverSide,
  type PopoverTriggerRenderProps,
} from "./components/Popover";
export {
  default as ProgressBar,
  type ProgressBarMode,
  type ProgressBarProps,
  type ProgressBarSlotProps,
} from "./components/ProgressBar";
export {
  default as SearchableMultiSelect,
  type SearchableMultiSelectChipProps,
  type SearchableMultiSelectComponent,
  type SearchableMultiSelectOptionProps,
  type SearchableMultiSelectProps,
  type SearchableMultiSelectSize,
} from "./components/SearchableMultiSelect";
export {
  default as SearchableSelect,
  type SearchableSelectComponent,
  type SearchableSelectOptionSlotProps,
  type SearchableSelectProps,
  type SearchableSelectSize,
} from "./components/SearchableSelect";
export { default as Select, type SelectComponent } from "./components/Select";
export {
  type SelectChangeEvent,
  type SelectFilterEvent,
  type SelectOptionAccessor,
  type SelectOptionSlotProps,
  type SelectProps,
  type SelectSize,
  type SelectValueSlotProps,
} from "./components/select-defs";
export {
  default as SiteHeader,
  type SiteHeaderMobileActionsProps,
  type SiteHeaderProps,
  type SiteNavItem,
} from "./components/site/SiteHeader";
export {
  default as SiteFooter,
  type SiteFooterLocale,
  type SiteFooterProps,
  type SiteSocialItem,
} from "./components/site/SiteFooter";
export { default as AdminListPage } from "./components/admin/AdminListPage";
export { default as AdminConfigPage } from "./components/admin/AdminConfigPage";
export {
  ConfigSection,
  default as AdminConfigSection,
} from "./components/admin/AdminConfigSection";
export {
  ConfigRow,
  default as AdminConfigRow,
} from "./components/admin/AdminConfigRow";
export { default as AdminDetailPage } from "./components/admin/AdminDetailPage";
export {
  StatCard,
  default as AdminDetailCard,
} from "./components/admin/AdminDetailCard";
export { default as AdminBoardPage } from "./components/admin/AdminBoardPage";
export { default as AdminBoardSection } from "./components/admin/AdminBoardSection";
export {
  StatBar,
  default as AdminStatBar,
} from "./components/admin/AdminStatBar";
export {
  ADMIN_HEADER_LEAD_TAKEN,
  type AdminBoardPageProps,
  type AdminBoardSectionProps,
  type AdminConfigPageEmits,
  type AdminConfigPageProps,
  type AdminConfigRowProps,
  type AdminConfigRowProps as ConfigRowProps,
  type AdminConfigRowStatusTone,
  type AdminConfigRowStatusTone as ConfigRowStatusTone,
  type AdminConfigSectionProps,
  type AdminConfigSectionProps as ConfigSectionProps,
  type AdminDetailCardEmits,
  type AdminDetailCardEmits as StatCardEmits,
  type AdminDetailCardProps,
  type AdminDetailCardProps as StatCardProps,
  type AdminDetailPageEmits,
  type AdminDetailPageProps,
  type AdminHeaderLeadTakenHolder,
  type AdminListPageProps,
  type AdminStatBarProps,
  type AdminStatBarProps as StatBarProps,
  type AdminStatItem,
  type AdminStatItem as StatItem,
  type AdminStatTone,
  type AdminStatTone as StatTone,
} from "./components/admin/admin-defs";
export { default as Tabs } from "./components/Tabs";
export { default as TabList } from "./components/TabList";
export { default as Tab } from "./components/Tab";
export { default as TabPanels } from "./components/TabPanels";
export { default as TabPanel } from "./components/TabPanel";
export {
  type TabListProps,
  type TabPanelProps,
  type TabPanelsProps,
  type TabProps,
  type TabsEmits,
  type TabsProps,
  type TabValue,
} from "./components/tabs-defs";
export {
  default as Tag,
  type TagIcon,
  type TagIconComponent,
  type TagProps,
  type TagSeverity,
} from "./components/Tag";
export { default as Textarea, type TextareaProps } from "./components/Textarea";
export {
  default as ToastHost,
  type ToastHostMessageRenderProps,
  type ToastHostProps,
  type ToastPosition,
} from "./components/ToastHost";
export { default as ToggleSwitch, type ToggleSwitchProps } from "./components/ToggleSwitch";
export {
  default as UserChip,
  type UserChipProps,
  type UserChipSize,
  type UserChipVariant,
} from "./components/UserChip";
export {
  default as UserCard,
  type UserCardProps,
  type UserProfile,
} from "./components/UserCard";
export { default as UserSelect } from "./components/UserSelect";
export { type UserSelectOption, type UserSelectProps } from "./components/user-select";

export {
  useComboPanel,
  type ComboPanelAnchor,
  type ComboPanelOptions,
  type ComboPanelPlacement,
  type ComboPanelReturn,
  type ComboPanelSide,
} from "./lib/useComboPanel";
export {
  TOOLTIP_SHOW_DELAY,
  Tooltip,
  attachTooltip,
  useTooltipProps,
  type TooltipController,
  type TooltipProps,
  type TooltipTriggerProps,
  type UseTooltipOptions,
  type UseTooltipReturn,
} from "./lib/tooltip";
export {
  attachScrollFade,
  computeScrollFadeState,
  syncScrollFade,
  useScrollFade,
  type ScrollFadeBinding,
  type ScrollFadeController,
  type ScrollFadeMetrics,
  type ScrollFadeOptions,
  type ScrollFadeRef,
  type ScrollFadeSize,
  type ScrollFadeState,
  type ScrollFadeX,
  type ScrollFadeY,
} from "./lib/scroll-fade";
export {
  initTheme,
  resolveTheme,
  setTheme,
  toggleTheme,
  useThemePreference,
  type ResolvedTheme,
  type SetThemeOptions,
  type ThemeOptions,
  type ThemePreference,
  type ThemeTransitionOrigin,
  type UseThemePreferenceReturn,
} from "./lib/theme";
export {
  computeHoverCardPosition,
  isRectOutsideViewport,
  type HoverCardGeometry,
  type HoverCardPlacement,
  type HoverCardPosition,
  type RectLike,
} from "./lib/hover-card";
export {
  CONFIRM_KEY,
  ConfirmContext,
  ConfirmProvider,
  createConfirmStore,
  defaultConfirmStore,
  normalizeAcceptSeverity,
  useConfirm,
  useConfirmQueue,
  useConfirmStore,
  validateLegacyConfirmOptions,
  type ConfirmAcceptSeverity,
  type ConfirmDefaultFocus,
  type ConfirmIcon,
  type ConfirmOptions,
  type ConfirmProviderProps,
  type ConfirmRequest,
  type ConfirmStore,
  type InternalConfirmEntry,
  type LegacyConfirmButtonProps,
  type LegacyConfirmRequireOptions,
} from "./lib/confirm";
export {
  DEFAULT_TOAST_LIFE,
  NOTIFY_KEY,
  NotifyContext,
  NotifyProvider,
  createNotifyStore,
  defaultNotifyStore,
  useNotify,
  useNotifyMessages,
  type NotifyProviderProps,
  type NotifyStore,
  type ToastAction,
  type ToastMessage,
  type ToastMessageOptions,
  type ToastSeverity,
  type ToastShortcutOptions,
} from "./lib/notify";
export {
  acquireOverlaySlot,
  acquireOverlayZIndex,
  formatOverlayLayerZ,
  formatOverlayScrimZ,
  releaseOverlaySlot,
  useOverlayLayer,
  useOverlayZIndex,
  type OverlayZIndex,
  type OverlayZIndexHandle,
} from "./lib/overlay-layer";
export { MOTION_AREA_DURATION_MS, areaDurationMs } from "./lib/area-transition";
export { measureMaxTextWidth } from "./lib/text-fit";
export {
  UiLocaleContext,
  UiLocaleProvider,
  formatUiMessage,
  mergeUiMessages,
  resolveUiLocaleSource,
  uiMessages,
  useUiLocale,
  type DeepPartial,
  type I18nWithMerge,
  type UiLocaleContextValue,
  type UiLocaleProviderProps,
  type UiLocaleSource,
  type UiMessages,
} from "./locale";

export {
  default as AsyncSlot,
  type AsyncSlotProps,
  type AsyncSlotSkeleton,
  type AsyncSlotStatus,
} from "./components/AsyncSlot";
export { default as AsyncSearchSelect } from "./components/AsyncSearchSelect";
export {
  type AsyncSearchOption,
  type AsyncSearchSelectOptionSlotProps,
  type AsyncSearchSelectProps,
} from "./components/async-search-select";
export { default as Accordion } from "./components/Accordion";
export { default as AccordionPanel } from "./components/AccordionPanel";
export { default as AccordionHeader } from "./components/AccordionHeader";
export { default as AccordionContent } from "./components/AccordionContent";
export {
  type AccordionContentProps,
  type AccordionEmits,
  type AccordionHeaderProps,
  type AccordionPanelProps,
  type AccordionPanelValue,
  type AccordionProps,
  type AccordionValue,
} from "./components/accordion-defs";
export { default as Chip } from "./components/Chip";
export {
  type ChipIcon,
  type ChipIconComponent,
  type ChipProps,
  type ChipRemoveIconSlotProps,
} from "./components/chip-defs";
export { default as ColorPicker } from "./components/ColorPicker";
export {
  type ColorPickerChangeEvent,
  type ColorPickerFormat,
  type ColorPickerProps,
} from "./components/color-picker";
export { default as Column, type ColumnComponent } from "./components/Column";
export { default as Calendar } from "./components/Calendar";
export {
  type CalendarCell,
  type CalendarFirstDayOfWeek,
  type CalendarHandle,
  type CalendarModelValue,
  type CalendarOutputValue,
  type CalendarProps,
  type CalendarSelectionMode,
  type CalendarVariant,
  type CalendarViewRange,
} from "./components/calendar-defs";
export { default as DataTable, type DataTableComponent } from "./components/DataTable";
export {
  type ColumnBodyScope,
  type ColumnHeaderScope,
  type ColumnProps,
  type DataTableClassValue,
  type DataTableColumnResizeEndEvent,
  type DataTableColumnResizeMode,
  type DataTableEmits,
  type DataTableExportCSVOptions,
  type DataTableFieldAccessor,
  type DataTableFrozenAlign,
  type DataTableHandle,
  type DataTablePageEvent,
  type DataTablePaginationState,
  type DataTableProps,
  type DataTableRowClickEvent,
  type DataTableRowCollapseEvent,
  type DataTableRowExpandEvent,
  type DataTableRowSelectAllEvent,
  type DataTableRowSelectEvent,
  type DataTableRowUnselectAllEvent,
  type DataTableRowUnselectEvent,
  type DataTableSelectionMode,
  type DataTableSize,
  type DataTableSortDirection,
  type DataTableSortEvent,
  type DataTableSortingRule,
  type PaginatorEmits,
  type PaginatorPageEvent,
  type PaginatorProps,
  type PaginatorSlotProps,
} from "./components/data-table";
export { default as DatePicker } from "./components/DatePicker";
export {
  type DatePickerHourFormat,
  type DatePickerMode,
  type DatePickerModelValue,
  type DatePickerOutputValue,
  type DatePickerProps,
  type DatePickerSelectionMode,
  type DatePickerSize,
} from "./components/date-picker";
export { default as IconField, type IconFieldProps } from "./components/IconField";
export {
  default as InputIcon,
  type InputIconProp,
  type InputIconProps,
} from "./components/InputIcon";
export { default as InputGroup, type InputGroupProps } from "./components/InputGroup";
export {
  default as InputGroupAddon,
  type InputGroupAddonProps,
} from "./components/InputGroupAddon";
export { default as InputNumber } from "./components/InputNumber";
export {
  type InputNumberButtonLayout,
  type InputNumberInputEvent,
  type InputNumberMode,
  type InputNumberProps,
  type InputNumberSize,
} from "./components/input-number";
export { default as Listbox, type ListboxComponent } from "./components/Listbox";
export {
  type ListboxChangeEvent,
  type ListboxOptionAccessor,
  type ListboxOptionSlotProps,
  type ListboxProps,
} from "./components/listbox-defs";
export { default as Menu } from "./components/Menu";
export {
  type MenuCommandEvent,
  type MenuEventLike,
  type MenuHandle,
  type MenuIcon,
  type MenuItem,
  type MenuItemCommandEvent,
  type MenuItemSlotProps,
  type MenuProps,
  type MenuTriggerRenderProps,
} from "./components/menu-defs";
export { default as MultiSelect, type MultiSelectComponent } from "./components/MultiSelect";
export {
  type MultiSelectChangeEvent,
  type MultiSelectDisplay,
  type MultiSelectOptionAccessor,
  type MultiSelectOptionSlotProps,
  type MultiSelectProps,
  type MultiSelectSize,
  type MultiSelectValueSlotProps,
} from "./components/multi-select";
export { default as Paginator } from "./components/Paginator";
export { default as ProgressSpinner } from "./components/ProgressSpinner";
export { type ProgressSpinnerProps } from "./components/progress-spinner";
export { default as RadioButton } from "./components/RadioButton";
export {
  type RadioButtonChangeEvent,
  type RadioButtonProps,
  type RadioButtonSize,
} from "./components/radio-button";
export { default as SelectButton } from "./components/SelectButton";
export {
  type SelectButtonChangeEvent,
  type SelectButtonOptionAccessor,
  type SelectButtonProps,
  type SelectButtonSize,
} from "./components/select-button";
export { default as Skeleton } from "./components/Skeleton";
export {
  type SkeletonAnimation,
  type SkeletonProps,
  type SkeletonShape,
} from "./components/skeleton-defs";
export { default as Slider } from "./components/Slider";
export {
  type SliderOrientation,
  type SliderProps,
  type SliderSlideEndEvent,
  type SliderValue,
} from "./components/slider-defs";
