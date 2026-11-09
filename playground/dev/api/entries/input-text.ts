import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "input-text",
  component: "InputText",
  title: { zh: "文本框", en: "Text input" },
  importPath: "@mango-write/ui-vue",
  rows: [
    { name: "v-model", kind: "prop", type: "string", desc: { zh: "输入法组合期间不回写，组合结束一次提交", en: "No writes back while composing; one commit when composition ends" } },
    { name: "size", kind: "prop", type: "xs · sm · md · lg", desc: { zh: "不传则跟随密度上下文", en: "Follows the density context when omitted" } },
    { name: "invalid / disabled / readonly", kind: "prop", type: "boolean", desc: { zh: "状态；错误说明由 <code>FormField</code> 负责", en: "States; error messaging is <code>FormField</code>'s job" } },
    { name: "fluid", kind: "prop", type: "boolean", desc: { zh: "撑满父容器宽度", en: "Fills the parent container width" } },
  ],
};
