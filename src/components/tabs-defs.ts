export type TabValue = string | number;

export interface TabsProps {
  /** 受控激活页签值（`v-model`） */
  modelValue?: TabValue;
  /** 受控或初始激活页签值（兼容 `v-model:value` / `:value`） */
  value?: TabValue;
  /** 非受控初始页签值 */
  defaultValue?: TabValue;
  /** 排列方向（默认 'horizontal'） */
  orientation?: "horizontal" | "vertical";
  /** 键盘焦点切换是否立即激活（默认 'automatic'） */
  activationMode?: "automatic" | "manual";
  /** 隐藏面板时是否卸载子树（默认 true） */
  unmountOnHide?: boolean;
}

export interface TabsEmits {
  "update:modelValue": [value: TabValue];
  "update:value": [value: TabValue];
}

export interface TabListProps {
  /** 键盘方向键导航是否首尾循环（默认 true） */
  loop?: boolean;
}

export interface TabProps {
  /** 页签标识值 */
  value: TabValue;
  /** 是否禁用该页签 */
  disabled?: boolean;
}

export interface TabPanelsProps {}

export interface TabPanelProps {
  /** 关联页签标识值 */
  value: TabValue;
  /** 非激活时是否强制保留挂载 */
  forceMount?: boolean;
}
