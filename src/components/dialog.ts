import type { StyleValue } from "vue";

export interface DialogProps {
  /** 受控打开状态（主契约） */
  open?: boolean;
  /** 受控打开状态（向后兼容旧调用点 `v-model:visible`） */
  visible?: boolean;
  /** 弹窗标题 */
  title?: string;
  /** 弹窗标题（向后兼容旧调用点 `:header`） */
  header?: string;
  /** 标题下方的补充说明文案 */
  description?: string;
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
  /** 弹窗宽度（如 `'28rem'`、`'min(760px, 92vw)'`） */
  width?: string;
  /** 内容区附加类名 */
  contentClass?: unknown;
  /** 内容区附加内联样式 */
  contentStyle?: StyleValue;
  /** 无可见标题时的无障碍名称 */
  ariaLabel?: string;
  /** 挂载目标容器（传 `'self'` 时禁用 Portal 原地挂载，默认 `'body'`） */
  appendTo?: string | HTMLElement;
  /** 关闭按钮附加属性（兼容旧调用点） */
  closeButtonProps?: Record<string, unknown>;
}

export interface DialogEmits {
  "update:open": [value: boolean];
  "update:visible": [value: boolean];
  show: [];
  hide: [];
  afterLeave: [];
  maximize: [event: MouseEvent];
  unmaximize: [event: MouseEvent];
}
