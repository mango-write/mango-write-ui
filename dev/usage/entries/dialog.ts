import { h } from "vue";
import { Button, Dialog } from "../../../src";
import { sfc } from "../codegen";
import type { UsageEntry, UsageValues } from "../types";

export const usage: UsageEntry = {
  slug: "dialog",
  component: Dialog,
  tag: "Dialog",
  flatPreview: true,
  minHeight: "200px",
  controls: [
    { prop: "open", label: "打开", kind: "boolean", default: false, vmodel: true },
    { prop: "title", label: "标题", kind: "text", default: "导出为 PDF" },
    { prop: "description", label: "补充说明", kind: "text", default: "包含全部正文与图表" },
    { prop: "width", label: "宽度", kind: "text", default: undefined },
    { prop: "modal", label: "模态遮罩", kind: "boolean", default: true },
    { prop: "dismissableMask", label: "点遮罩可关", kind: "boolean", default: false },
    { prop: "maximizable", label: "可最大化", kind: "boolean", default: false },
    { prop: "closable", label: "右上角关闭", kind: "boolean", default: true },
    { prop: "closeOnEscape", label: "Esc 可关", kind: "boolean", default: true },
  ],
  render: (v: UsageValues) => [
    h(Button, {
      label: "打开对话框",
      size: "sm",
      onClick: () => {
        v.open = true;
      },
    }),
    h(
      Dialog,
      {
        open: Boolean(v.open),
        "onUpdate:open": (x: unknown) => {
          v.open = Boolean(x);
        },
        title: v.title as string | undefined,
        description: v.description as string | undefined,
        width: v.width as string | undefined,
        modal: v.modal !== false,
        dismissableMask: Boolean(v.dismissableMask),
        maximizable: Boolean(v.maximizable),
        closable: v.closable !== false,
        closeOnEscape: v.closeOnEscape !== false,
        ariaLabel: typeof v.title === "string" ? v.title : "示例对话框",
      },
      {
        default: () =>
          h("p", { style: "margin:0;color:var(--text-secondary)" }, "导出范围与版式可在下一步确认。"),
        footer: () => [
          h(
            Button,
            {
              variant: "text",
              severity: "secondary",
              label: "取消",
              onClick: () => {
                v.open = false;
              },
            },
          ),
          h(
            Button,
            {
              label: "开始导出",
              onClick: () => {
                v.open = false;
              },
            },
          ),
        ],
      },
    ),
  ],
  code: (v: UsageValues) => {
    const attrs = [
      'v-model:open="open"',
      v.title ? `title="${v.title}"` : "",
      v.description ? `description="${v.description}"` : "",
      v.width ? `width="${v.width}"` : "",
      v.modal === false ? ":modal=\"false\"" : "",
      v.dismissableMask ? "dismissable-mask" : "",
      v.maximizable ? "maximizable" : "",
      v.closable === false ? ":closable=\"false\"" : "",
      v.closeOnEscape === false ? ":close-on-escape=\"false\"" : "",
    ].filter(Boolean);
    return sfc({
      ui: ["Button", "Dialog"],
      vue: ["ref"],
      setup: ["const open = ref(false);"],
      template: `<Button label="打开对话框" @click="open = true" />\n<Dialog\n    ${attrs.join("\n    ")}\n  >\n    <p>导出范围与版式可在下一步确认。</p>\n    <template #footer>\n      <Button variant="text" severity="secondary" label="取消" @click="open = false" />\n      <Button label="开始导出" @click="open = false" />\n    </template>\n  </Dialog>`,
    });
  },
};
