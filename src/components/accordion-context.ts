import type { ComputedRef, InjectionKey } from "vue";

export type AccordionPanelValue = string | number;
export type AccordionValue =
  | AccordionPanelValue
  | AccordionPanelValue[]
  | null
  | undefined;

export interface AccordionProps {
  /** 受控展开面板值（支持 `v-model:value`） */
  value?: AccordionValue;
  /** 受控展开面板值（支持 `v-model`） */
  modelValue?: AccordionValue;
  /** 非受控初始展开面板值 */
  defaultValue?: AccordionValue;
  /** 是否允许多个面板同时展开（默认 false） */
  multiple?: boolean;
}

export interface AccordionEmits {
  "update:value": [value: AccordionPanelValue | AccordionPanelValue[] | null];
  "update:modelValue": [value: AccordionPanelValue | AccordionPanelValue[] | null];
}

export interface AccordionPanelProps {
  /** 面板唯一标识值 */
  value: AccordionPanelValue;
  /** 是否禁用该面板 */
  disabled?: boolean;
}

export interface AccordionHeaderProps {
  /** 是否禁用该面板头 */
  disabled?: boolean;
}

export interface AccordionContentProps {}

export interface AccordionContext {
  isPanelOpen: (value: AccordionPanelValue) => boolean;
  togglePanel: (value: AccordionPanelValue) => void;
  registerHeader: (el: HTMLButtonElement) => void;
  unregisterHeader: (el: HTMLButtonElement) => void;
  moveFocus: (
    current: HTMLButtonElement,
    direction: "next" | "prev" | "first" | "last",
  ) => void;
}

export interface AccordionPanelContext {
  value: ComputedRef<AccordionPanelValue>;
  disabled: ComputedRef<boolean>;
  isOpen: ComputedRef<boolean>;
  headerId: string;
  contentId: string;
  toggle: () => void;
}

export const ACCORDION_INJECTION_KEY: InjectionKey<AccordionContext> =
  Symbol("MwAccordion");

export const ACCORDION_PANEL_INJECTION_KEY: InjectionKey<AccordionPanelContext> =
  Symbol("MwAccordionPanel");
