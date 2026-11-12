import { createContext, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";

export type TabValue = string | number;

export interface TabsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "children" | "dir"> {
  /** 受控激活页签值 */
  value?: TabValue;
  /** 非受控初始页签值 */
  defaultValue?: TabValue;
  /** 激活页签变化回调 */
  onValueChange?: (value: TabValue) => void;
  /** 排列方向（默认 'horizontal'） */
  orientation?: "horizontal" | "vertical";
  /** 文本与键盘阅读方向 */
  dir?: "ltr" | "rtl";
  /** 键盘焦点切换是否立即激活（默认 'automatic'） */
  activationMode?: "automatic" | "manual";
  /** 隐藏面板时是否卸载子树（默认 true） */
  unmountOnHide?: boolean;
  /** 子节点或作用域渲染函数 */
  children?: ReactNode | ((props: { value: TabValue | undefined }) => ReactNode);
}

export interface TabsEmits {
  onValueChange?: (value: TabValue) => void;
}

export interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  /** 键盘方向键导航是否首尾循环（默认 true） */
  loop?: boolean;
  /** 当列表内仅包含 1 个页签时是否自动隐藏（默认 false） */
  hideWhenSingle?: boolean;
}

export interface TabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  /** 页签标识值 */
  value: TabValue;
  /** 是否禁用该页签 */
  disabled?: boolean;
  /** 页签右侧角标计数或简短文本 */
  badge?: string | number;
}

export interface TabPanelsProps extends HTMLAttributes<HTMLDivElement> {}

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** 关联页签标识值 */
  value: TabValue;
  /** 非激活时是否强制保留挂载 */
  forceMount?: boolean;
}

export interface MwTabsContextValue {
  activeValue: TabValue | undefined;
  orientation: "horizontal" | "vertical";
  unmountOnHide: boolean;
  registerValue: (raw: TabValue) => string;
  selectValue: (raw: TabValue) => void;
}

export const MwTabsContext = createContext<MwTabsContextValue | null>(null);
