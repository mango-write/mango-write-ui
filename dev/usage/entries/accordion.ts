import { h } from "vue";
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from "../../../src";
import { sfc } from "../codegen";
import type { UsageEntry, UsageValues } from "../types";

const panels = [
  { value: "meta", title: "题录元数据", text: "DOI: 10.1038/s41586-026-00001-x · 期刊：Nature" },
  { value: "export", title: "导出格式设置", text: "目标模板：ACM sigconf · 参考文献样式：BibTeX" },
  { value: "locked", title: "团队归档策略（管理员）", text: "仅团队管理员可修改。", disabled: true },
];

export const usage: UsageEntry = {
  slug: "accordion",
  component: Accordion,
  tag: "Accordion",
  extraTags: ["AccordionContent", "AccordionHeader", "AccordionPanel"],
  controls: [
    {
      prop: "value",
      vname: "active",
      label: "展开面板",
      kind: "enum",
      default: "meta",
      options: panels.filter((p) => !p.disabled).map((p) => ({ label: p.title, value: p.value })),
      vmodel: true,
    },
  ],
  render: (v: UsageValues) =>
    h(
      Accordion,
      {
        value: (v.active as string) ?? "meta",
        "onUpdate:value": (x: unknown) => {
          v.active = x as string;
        },
      },
      {
        default: () =>
          panels.map((p) =>
            h(AccordionPanel, { key: p.value, value: p.value, disabled: p.disabled }, () => [
              h(AccordionHeader, () => p.title),
              h(AccordionContent, () => h("p", { class: "doc-note", style: "margin:0" }, p.text)),
            ]),
          ),
      },
    ),
  code: (v: UsageValues) => {
    const panelLines = panels
      .map(
        (p) =>
          `  <AccordionPanel value="${p.value}"${p.disabled ? " disabled" : ""}>\n    <AccordionHeader>${p.title}</AccordionHeader>\n    <AccordionContent>\n      <p class="doc-note">${p.text}</p>\n    </AccordionContent>\n  </AccordionPanel>`,
      )
      .join("\n");
    return sfc({
      ui: ["Accordion", "AccordionContent", "AccordionHeader", "AccordionPanel"],
      vue: ["ref"],
      setup: [`const active = ref(${JSON.stringify(v.active ?? "meta")});`],
      template: `<Accordion v-model:value="active">\n${panelLines}\n</Accordion>`,
    });
  },
};
