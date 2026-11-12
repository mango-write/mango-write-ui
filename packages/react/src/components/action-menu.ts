import type {
  CSSProperties,
  ComponentType,
  HTMLAttributes,
  ReactNode,
  SyntheticEvent,
} from "react";

export type ActionMenuIcon =
  | ComponentType<{ className?: string; size?: number | string; "aria-hidden"?: boolean | "true" }>
  | ReactNode;

export interface ActionMenuPoint {
  x: number;
  y: number;
}

export type ActionMenuEventLike =
  | Event
  | SyntheticEvent
  | ActionMenuPoint
  | HTMLElement
  | {
      currentTarget?: EventTarget | null;
      target?: EventTarget | null;
      clientX?: number;
      clientY?: number;
      type?: string;
      nativeEvent?: Event;
    };

export interface ActionMenuCommandEvent {
  originalEvent: Event;
  item: ActionMenuItem;
}

export interface ActionMenuItem {
  key?: string;
  label?: string | (() => string);
  icon?: ActionMenuIcon;
  command?: (event: ActionMenuCommandEvent) => void;
  url?: string;
  target?: string;
  disabled?: boolean | (() => boolean);
  disabledReason?: string;
  tooltip?: string;
  visible?: boolean | (() => boolean);
  separator?: boolean;
  items?: ActionMenuItem[];
  children?: ActionMenuItem[];
  shortcut?: string;
  danger?: boolean;
  class?: string;
  className?: string;
  style?: CSSProperties;
  [key: string]: unknown;
}

export interface ActionMenuTriggerRenderProps {
  open: boolean;
  show: (event?: ActionMenuEventLike | null, target?: HTMLElement | null) => void;
  hide: () => void;
  toggle: (event?: ActionMenuEventLike | null, target?: HTMLElement | null) => void;
}

export interface ActionMenuHandle {
  show: (event?: ActionMenuEventLike | null, target?: HTMLElement | null) => void;
  hide: () => void;
  toggle: (event?: ActionMenuEventLike | null, target?: HTMLElement | null) => void;
  readonly open: boolean;
}

export interface ActionMenuProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "contextMenu"> {
  /** 菜单项树（支持任意层级嵌套 `items` / `children`） */
  items: ActionMenuItem[];
  /** 受控展开状态 */
  open?: boolean;
  /** 非受控初始展开状态 */
  defaultOpen?: boolean;
  /** 展开状态变更回调 */
  onOpenChange?: (open: boolean) => void;
  /** 受控或初始坐标定位 `{ x, y }` */
  position?: ActionMenuPoint | null;
  /** 受控锚点元素 */
  anchorEl?: HTMLElement | null;
  /** 声明式触发器 */
  trigger?: ReactNode | ((props: ActionMenuTriggerRenderProps) => ReactNode);
  /** 声明式触发器是否响应右键 `contextmenu` 坐标打开（默认 false，响应点击锚定打开） */
  contextMenu?: boolean;
  /** 挂载目标容器（传 `'self'` 时禁用 Portal 原地挂载，默认 `'body'`） */
  appendTo?: "self" | "body" | (string & {}) | HTMLElement | null;
  /** 自定义菜单项图标渲染器（对标 Vue `#icon` 插槽） */
  renderIcon?: (props: { item: ActionMenuItem }) => ReactNode;
  /** `renderIcon` 别名 */
  icon?: (props: { item: ActionMenuItem }) => ReactNode;
  /** 打开回调 */
  onShow?: () => void;
  /** 关闭回调 */
  onHide?: () => void;
}
