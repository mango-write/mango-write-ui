import type {
  MpActionSheetProps,
  MpButtonProps,
  MpCellProps,
  MpComposerProps,
  MpEmptyProps,
  MpFilterChipProps,
  MpInputProps,
  MpNavBarProps,
  MpSearchBarProps,
  MpSelectSheetProps,
  MpSheetProps,
  MpTabBarProps,
} from "@mango-write/ui-mp";
import type { MpApiRow } from "../kit/MpDocPage.vue";

type MpApiName<Props> = keyof Props | `#${string}` | "search" | "select" | "submit";

function props<Props>(rows: readonly (MpApiRow & { name: MpApiName<Props> })[]): readonly MpApiRow[] {
  return rows;
}

const button = props<MpButtonProps>([
  { name: "label", type: "string", description: { zh: "按钮文本，也可使用默认插槽。", en: "Button text, or use the default slot." } },
  { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: { zh: "36 / 44 / 48px 交互尺寸。", en: "36 / 44 / 48px interactive sizes." } },
  { name: "variant", type: '"solid" | "tinted" | "outlined" | "text"', defaultValue: '"solid"', description: { zh: "动作视觉层级。", en: "Visual action hierarchy." } },
  { name: "loading", type: "boolean", defaultValue: "false", description: { zh: "显示矢量加载图标并阻断重复动作。", en: "Shows a vector spinner and blocks repeat actions." } },
]);

export const mobileApi = {
  installation: [
    { name: "theme", type: '"light" | "dark" | "system"', defaultValue: '"light"', description: { zh: "主题偏好与解析后的作用域。", en: "Theme preference and resolved scope." } },
    { name: "MpIcon.name", type: "MpIconName", description: { zh: "统一矢量图标名称，不使用 Unicode 模拟。", en: "Unified vector icon name; never Unicode substitutes." } },
  ],
  navbar: [
    ...props<MpNavBarProps>([
      { name: "title", type: "string", description: { zh: "二级页面标题。", en: "Secondary page title." } },
      { name: "showBack", type: "boolean", defaultValue: "false", description: { zh: "显示返回动作；空间入口使用 leading 插槽。", en: "Shows back; use the leading slot for space context." } },
    ]),
    ...props<MpTabBarProps>([
      { name: "items", type: "readonly MpTabBarItem[]", description: { zh: "一级目的地、矢量图标与可选通知计数。", en: "Destinations, vector icons, and optional notification counts." } },
      { name: "contained", type: "boolean", defaultValue: "false", description: { zh: "在预览容器内使用绝对定位。", en: "Uses absolute positioning inside a preview container." } },
    ]),
  ],
  cell: props<MpCellProps>([
    { name: "title", type: "string", description: { zh: "完整内容标题，不与时间争夺横向轨道。", en: "Full content title, not squeezed against timestamps." } },
    { name: "subtitle", type: "string", description: { zh: "最多两行的摘要，长英文与 DOI 可断行。", en: "Two-line summary with wrapping for English and DOIs." } },
    { name: "clickable", type: "boolean", defaultValue: "false", description: { zh: "启用按钮角色与键盘操作。", en: "Enables button semantics and keyboard actions." } },
    { name: "selectable", type: "boolean", defaultValue: "false", description: { zh: "使用 option 与 aria-selected 选择语义。", en: "Uses option and aria-selected semantics." } },
  ]),
  button,
  input: [
    ...props<MpInputProps>([
      { name: "modelValue", type: "string", defaultValue: '""', description: { zh: "单行绑定值，支持组合输入。", en: "Single-line value with composition support." } },
      { name: "clearable", type: "boolean", defaultValue: "false", description: { zh: "非空且可编辑时显示真实清空动作。", en: "Shows a working clear action when editable and non-empty." } },
    ]),
    ...props<MpSearchBarProps>([
      { name: "clearable", type: "boolean", defaultValue: "true", description: { zh: "控制搜索清空按钮。", en: "Controls the search clear button." } },
      { name: "search", type: "(value: string) => void", description: { zh: "回车且非组合输入时提交搜索。", en: "Emits on Enter outside composition." } },
    ]),
  ],
  filters: props<MpFilterChipProps>([
    { name: "selected", type: "boolean", defaultValue: "false", description: { zh: "选择状态，同步 aria-pressed。", en: "Selected state synchronized with aria-pressed." } },
    { name: "disabled", type: "boolean", defaultValue: "false", description: { zh: "禁用并阻止点击。", en: "Disables interaction." } },
  ]),
  empty: props<MpEmptyProps>([
    { name: "status", type: '"empty" | "error"', defaultValue: '"empty"', description: { zh: "空数据或错误恢复；加载使用 MpLoading。", en: "Empty or error recovery; use MpLoading for loading." } },
    { name: "#action", type: "slot", description: { zh: "真实渲染的下一步动作。", en: "A rendered next action." } },
  ]),
  sheet: [
    ...props<MpSheetProps>([
      { name: "open", type: "boolean", defaultValue: "false", description: { zh: "受控展开状态。", en: "Controlled open state." } },
      { name: "contained", type: "boolean", defaultValue: "false", description: { zh: "限制在相对定位预览容器内。", en: "Confines the sheet to a positioned preview." } },
    ]),
    ...props<MpSelectSheetProps>([
      { name: "modelValue", type: "unknown", description: { zh: "当前单选值，0、false 和空字符串均为合法值。", en: "Selected value; 0, false, and empty string are valid." } },
      { name: "options", type: "readonly unknown[]", description: { zh: "单选选项，支持 label/value/disabled 访问器。", en: "Options with label/value/disabled accessors." } },
    ]),
  ],
  "action-sheet": props<MpActionSheetProps>([
    { name: "options", type: "readonly MpActionSheetOption[]", description: { zh: "动作列表，支持 danger 与 disabled。", en: "Actions with danger and disabled states." } },
    { name: "select", type: "(option, value) => void", description: { zh: "选择动作后触发并关闭。", en: "Emits the selected action and closes." } },
  ]),
  feedback: [
    { name: "useMpConfirm().ask", type: "(options) => Promise<boolean>", description: { zh: "确认 true，其余关闭方式 false。", en: "Resolves true on accept and false otherwise." } },
    { name: "useMpNotify()", type: "info / success / warn / error", description: { zh: "单条最新通知，支持关闭与自动消失。", en: "Latest-only toast with close and timeout." } },
    { name: "MpToastHost.service", type: "MpNotifyService", description: { zh: "可选显式服务，跨 uni-app 页面边界时与页面通知共用。", en: "Optional explicit service shared with the page across uni-app boundaries." } },
    { name: "MpMessage.from", type: '"user" | "assistant"', description: { zh: "问答消息角色与排版。", en: "Message role and typography." } },
  ],
  patterns: props<MpComposerProps>([
    { name: "modelValue", type: "string", defaultValue: '""', description: { zh: "输入内容。", en: "Composer value." } },
    { name: "submit", type: "(value: string) => void", description: { zh: "非空时通过发送动作或 Enter 提交。", en: "Submits non-empty text via send or Enter." } },
    { name: "offsetBottom", type: "string", description: { zh: "底部导航或安全区偏移。", en: "Bottom navigation or safe-area offset." } },
  ]),
} as const;
