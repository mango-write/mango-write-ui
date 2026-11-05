import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "form-field",
  component: "FormField",
  title: "表单字段",
  importPath: "@mango-write/ui",
  rows: [
    { name: "inputId / label", kind: "prop", type: "string", desc: "必填；标签通过 <code>for</code> 关联控件" },
    { name: "hint / error", kind: "prop", type: "string", desc: "说明与错误；有值时自动拼进 <code>describedBy</code>" },
    { name: "required", kind: "prop", type: "boolean", desc: "标签后显示 *，并下发给控件" },
    { name: "默认插槽", kind: "prop", type: "{ inputId, describedBy, invalid, required }", desc: "绑定到控件上" },
  ],
  examples: [
    { title: "基本用法", code: "<script setup lang=\"ts\">\nimport { ref } from \"vue\";\nimport { FormField, InputText } from \"@mango-write/ui\";\n\nconst title = ref(\"\");\n</script>\n\n<template>\n  <FormField v-slot=\"{ inputId, describedBy, invalid }\" input-id=\"title\" label=\"论文标题\" required>\n    <InputText\n      v-model=\"title\"\n      :id=\"inputId\"\n      :aria-describedby=\"describedBy\"\n      :invalid=\"invalid\"\n      fluid\n    />\n  </FormField>\n</template>" },
  ],
};
