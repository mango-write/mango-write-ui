import type { Bi } from "../i18n";

export type ApiRowKind = "prop" | "event" | "slot" | "method" | "css";

export interface ApiRow {
  /** 名称,保留文档原文写法(# 插槽、@ 事件、-- CSS 变量;组合行不拆分);含自然语言词时写 Bi */
  name: string | Bi;
  kind: ApiRowKind;
  /** 取值/类型,自由文本;多为代码记号,含自然语言词(「插槽」等)时写 Bi */
  type?: string | Bi;
  /** 说明;允许内联 <code> 标记——ApiTable 以 v-html 渲染,gen-llms 转回反引号 */
  desc: string | Bi;
}

export interface ApiEntry {
  slug: string;
  /** 展示用英文名(Button / Toast) */
  component: string;
  title: string | Bi;
  /** 消费方导入路径(默认根入口,lib 入口单独标) */
  importPath: string;
  /** 从该入口导入的名字;缺省视为 [component]。复合页(toast/confirm/tabs 等)必须显式给出 */
  exports?: string[];
  rows: ApiRow[];
}
