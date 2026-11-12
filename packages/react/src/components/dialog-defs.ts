import type {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  MouseEvent,
  ReactNode,
} from "react";

export type DialogSize = "sm" | "md" | "lg" | "xl";

export interface DialogProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** 受控打开状态（主契约） */
  open?: boolean;
  /** 非受控初始打开状态 */
  defaultOpen?: boolean;
  /** 受控打开状态（兼容 `visible` 调用点） */
  visible?: boolean;
  /** 打开状态变更回调 */
  onOpenChange?: (open: boolean) => void;
  /** 打开状态变更回调（兼容 `visible` 调用点） */
  onVisibleChange?: (visible: boolean) => void;
  /** 弹窗标题 */
  title?: ReactNode;
  /** 弹窗标题或自定义头部标题节点 */
  header?: ReactNode;
  /** 标题行右侧扩展节点 */
  headerExtra?: ReactNode;
  /** 标题下方的补充说明文案 */
  description?: ReactNode;
  /** 标准宽度分档：sm (27.5rem) / md (40rem) / lg (53.75rem) / xl (68.75rem)；未传时默认 32rem */
  size?: DialogSize;
  /** 是否在标题左侧显示同窗多级下钻返回按钮（默认 false） */
  canBack?: boolean;
  /** 返回按钮的无障碍与提示文案 */
  backLabel?: string;
  /** 点击返回按钮回调 */
  onBack?: () => void;
  /** 头部下方常驻的范围与筛选上下文说明条 */
  scopeText?: string;
  /** 范围说明条附加节点 */
  scope?: ReactNode;
  /** 头部下方工具条节点 */
  toolbar?: ReactNode;
  /** 头部下方引导区节点 */
  lead?: ReactNode;
  /** 内容区空态节点 */
  empty?: ReactNode;
  /** 页脚左侧辅助节点 */
  footerLeft?: ReactNode;
  /** 页脚右侧主动作区节点 */
  footer?: ReactNode;
  /** 弹窗主体是否整体滚动（默认 true；主从表或双区弹窗设 false 由内部表格独立滚动） */
  bodyScroll?: boolean;
  /** 是否为模态弹窗（默认 true） */
  modal?: boolean;
  /** 是否显示右上角关闭按钮（默认 true） */
  closable?: boolean;
  /** 是否显示头部区域（默认 true） */
  showHeader?: boolean;
  /** 按下 Escape 是否可关闭（默认 true） */
  closeOnEscape?: boolean;
  /** 点击遮罩是否可关闭（默认 false） */
  dismissableMask?: boolean;
  /** 是否显示最大化/还原切换按钮（默认 false） */
  maximizable?: boolean;
  /** 兼容保留项：默认不可拖拽（默认 false） */
  draggable?: boolean;
  /** 打开期间是否锁定背景滚动（默认 true） */
  blockScroll?: boolean;
  /** 弹窗自定义宽度（优先级高于 `size`） */
  width?: string;
  /** 内容区附加类名 */
  contentClass?: string;
  /** 内容区附加类名别名 */
  contentClassName?: string;
  /** 内容区附加内联样式 */
  contentStyle?: CSSProperties;
  /** 无可见标题时的无障碍名称 */
  ariaLabel?: string;
  /** 挂载目标容器（传 `'self'` 时禁用 Portal 原地挂载，默认 `'body'`） */
  appendTo?: "self" | "body" | (string & {}) | HTMLElement | null;
  /** 关闭按钮附加属性 */
  closeButtonProps?: ButtonHTMLAttributes<HTMLButtonElement> & Record<string, unknown>;
  /** 打开后回调 */
  onShow?: () => void;
  /** 离场完成后回调（兼容别名） */
  onHide?: () => void;
  /** 退场动画结束并卸载后触发，绝不在仅点击关闭按钮而受控状态未变为 false 时触发 */
  onAfterLeave?: () => void;
  /** 切换为最大化回调 */
  onMaximize?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** 从最大化还原回调 */
  onUnmaximize?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** 弹窗正文 */
  children?: ReactNode;
}

export interface DialogEmits {
  onOpenChange?: (open: boolean) => void;
  onVisibleChange?: (visible: boolean) => void;
  onBack?: () => void;
  onShow?: () => void;
  onHide?: () => void;
  onAfterLeave?: () => void;
  onMaximize?: (event: MouseEvent<HTMLButtonElement>) => void;
  onUnmaximize?: (event: MouseEvent<HTMLButtonElement>) => void;
}
