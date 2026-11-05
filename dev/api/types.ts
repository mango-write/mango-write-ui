export type ApiRowKind = "prop" | "event" | "slot" | "method" | "css";

export interface ApiRow {
  /** 名称,保留文档原文写法(# 插槽、@ 事件、-- CSS 变量;组合行不拆分) */
  name: string;
  kind: ApiRowKind;
  /** 取值/类型,自由文本(可含「插槽」「CSS 变量」这类类别词) */
  type?: string;
  /** 说明;允许内联 <code> 标记——ApiTable 以 v-html 渲染,gen-llms 转回反引号 */
  desc: string;
}

export interface ApiExample {
  title: string;
  code: string;
}

export interface ApiEntry {
  slug: string;
  /** 展示用英文名(Button / Toast) */
  component: string;
  title: string;
  /** 消费方导入路径(默认根入口,lib 入口单独标) */
  importPath: string;
  /** 从该入口导入的名字;缺省视为 [component]。复合页(toast/confirm/tabs 等)必须显式给出 */
  exports?: string[];
  rows: ApiRow[];
  /** 可复制的最小用法;ApiTable 展示,gen-llms 收进 llms-full.txt */
  examples?: ApiExample[];
}
