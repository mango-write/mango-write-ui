import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "form-field",
  component: "FormField",
  title: { zh: "表单字段", en: "Form field" },
  importPath: "@mango-write/ui-vue",
  rows: [
    { name: "inputId / label", kind: "prop", type: "string", desc: { zh: "必填；标签通过 <code>for</code> 关联控件", en: "Required; the label is associated with the control via <code>for</code>" } },
    { name: "hint / error", kind: "prop", type: "string", desc: { zh: "说明与错误；有值时自动拼进 <code>describedBy</code>", en: "Hint and error; when set, both join <code>describedBy</code>" } },
    { name: "required", kind: "prop", type: "boolean", desc: { zh: "标签后显示 *，并下发给控件", en: "Shows * after the label and is forwarded to the control" } },
    { name: "默认插槽", kind: "prop", type: "{ inputId, describedBy, invalid, required }", desc: { zh: "绑定到控件上", en: "Bind these onto the control" } },
  ],
};
