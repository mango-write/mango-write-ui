import {
  createContext,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";

export type AccordionPanelValue = string | number;
export type AccordionValue =
  | AccordionPanelValue
  | AccordionPanelValue[]
  | null
  | undefined;

export interface AccordionProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  /** 受控展开面板值 */
  value?: AccordionValue;
  /** 非受控初始展开面板值 */
  defaultValue?: AccordionValue;
  /** 展开面板值变化回调 */
  onValueChange?: (value: AccordionPanelValue | AccordionPanelValue[] | null) => void;
  /** 是否允许多个面板同时展开（默认 false） */
  multiple?: boolean;
}

export interface AccordionEmits {
  onValueChange?: (value: AccordionPanelValue | AccordionPanelValue[] | null) => void;
}

export interface AccordionPanelProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** 面板唯一标识值 */
  value: AccordionPanelValue;
  /** 是否禁用该面板 */
  disabled?: boolean;
  /** 子节点或作用域渲染函数 */
  children?: ReactNode | ((props: { active: boolean }) => ReactNode);
}

export interface AccordionHeaderProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** 是否禁用该面板头 */
  disabled?: boolean;
  /** 子节点或作用域渲染函数 */
  children?: ReactNode | ((props: { active: boolean }) => ReactNode);
}

export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {}

export interface AccordionContextValue {
  isPanelOpen: (value: AccordionPanelValue) => boolean;
  togglePanel: (value: AccordionPanelValue) => void;
  registerHeader: (el: HTMLButtonElement) => void;
  unregisterHeader: (el: HTMLButtonElement) => void;
  moveFocus: (
    current: HTMLButtonElement,
    direction: "next" | "prev" | "first" | "last",
  ) => void;
}

export interface AccordionPanelContextValue {
  value: AccordionPanelValue;
  disabled: boolean;
  isOpen: boolean;
  headerId: string;
  contentId: string;
  toggle: () => void;
}

export const AccordionContext = createContext<AccordionContextValue | null>(null);
export const AccordionPanelContext = createContext<AccordionPanelContextValue | null>(
  null,
);
