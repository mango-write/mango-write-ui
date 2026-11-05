import type { Component, VNode } from "vue";
import type { ConfirmStore } from "../../src/lib/confirm";
import type { NotifyStore } from "../../src/lib/notify";

/** 容器在 setup 期注入后传给 render 的宿主能力(inject 不能发生在渲染期) */
export interface UsageHost {
  confirm: ConfirmStore;
  notify: NotifyStore;
}

export interface UsageOption {
  label: string;
  value: string | number;
}

export type UsageValue = string | number | boolean | undefined;

export type UsageValues = Record<string, UsageValue>;

export interface UsageControl {
  /** 组件 prop 名;命名 v-model 即其名称(如 value / open) */
  prop: string;
  label: string;
  kind: "boolean" | "enum" | "text" | "number" | "color";
  /** enum 必填(与 componentOptions 二选一) */
  options?: readonly UsageOption[];
  /** enum 选项为组件(图标选择):值是名字,渲染查表,代码输出 `:attr="名字"` 并加 lucide 导入 */
  componentOptions?: readonly { name: string; component: Component }[];
  /** 初始值;非 v-model 控件等于此值的属性在生成代码中省略 */
  default?: UsageValue;
  /** 受控绑定:预览可回写,生成代码恒带 v-model 与 ref 声明 */
  vmodel?: boolean;
  /** 受控值在 values 与生成代码里的变量名;缺省 = prop(如 prop 为 modelValue 时可用 vname 起业务名) */
  vname?: string;
  /** text 控件作为默认插槽内容而非属性 */
  slot?: boolean;
  /** 生成代码中的属性名;缺省 = prop 的 kebab-case */
  attr?: string;
}

export interface UsageEntry {
  slug: string;
  component: Component;
  /** 生成代码中的标签名(Button / TabList) */
  tag: string;
  /** 需要一起导入并在代码中出现的伴生名(Tabs 全家桶、Column) */
  extraTags?: string[];
  controls: UsageControl[];
  /** 固定属性:参与渲染与生成代码,不进配置面板;数组/对象只进渲染,代码侧由自定义 code 输出 */
  baseProps?: Record<string, unknown>;
  /** 复杂组件自定义渲染(浮层触发、子组件树);缺省走声明式统一渲染 */
  render?: (v: UsageValues, host: UsageHost) => VNode | VNode[];
  /** 复杂组件自定义代码生成;缺省走声明式统一生成 */
  code?: (v: UsageValues) => string;
  /** 预览格最小高度(浮层类演示) */
  minHeight?: string;
  /** 全屏模态类(Dialog/Lightbox)无法双格并排:只渲染单格纸面 */
  flatPreview?: boolean;
}
