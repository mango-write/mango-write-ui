import { h } from "vue";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "../../../src";
import { sfc } from "../codegen";
import type { UsageEntry, UsageValues } from "../types";

const tabs = [
  { value: "draft", label: "草稿", badge: 3 },
  { value: "refs", label: "文献", badge: 28 },
  { value: "figures", label: "图表" },
  { value: "review", label: "审阅", disabled: true },
];

const panelText: Record<string, string> = {
  draft: "正文按锚定空间存储，编辑提案经锚点写回。",
  refs: "28 处正文引用与题录库双向锚定。",
  figures: "图 1 架构总览 · 图 2 消融实验对比。",
};

export const usage: UsageEntry = {
  slug: "tabs",
  component: Tabs,
  tag: "Tabs",
  extraTags: ["TabList", "Tab", "TabPanels", "TabPanel"],
  controls: [
    { prop: "value", vname: "active", label: "激活页签", kind: "enum", default: "draft", options: tabs.map((t) => ({ label: t.label, value: t.value })), vmodel: true },
    {
      prop: "orientation",
      label: "排列方向",
      kind: "enum",
      default: "horizontal",
      options: [
        { label: "横向", value: "horizontal" },
        { label: "纵向", value: "vertical" },
      ],
    },
    { prop: "badge", label: "显示角标计数", kind: "boolean", default: false },
    { prop: "hideWhenSingle", label: "单页签自动隐藏", kind: "boolean", default: false },
  ],
  render: (v: UsageValues) => {
    const visibleTabs = v.hideWhenSingle ? tabs.slice(0, 1) : tabs;
    const activeVal = v.hideWhenSingle ? "draft" : ((v.active as string) ?? "draft");
    return h(
      Tabs,
      {
        value: activeVal,
        "onUpdate:value": (x: unknown) => {
          v.active = x as string;
        },
        orientation: (v.orientation as "horizontal" | "vertical") ?? "horizontal",
      },
      {
        default: () => [
          h(
            TabList,
            { hideWhenSingle: Boolean(v.hideWhenSingle) },
            () =>
              visibleTabs.map((t) =>
                h(
                  Tab,
                  {
                    value: t.value,
                    disabled: t.disabled,
                    badge: v.badge ? t.badge : undefined,
                  },
                  () => t.label,
                ),
              ),
          ),
          h(
            TabPanels,
            () =>
              visibleTabs
                .filter((t) => !t.disabled)
                .map((t) =>
                  h(TabPanel, { value: t.value }, () =>
                    h("p", { class: "doc-note", style: "margin:0" }, panelText[t.value]),
                  ),
                ),
          ),
        ],
      },
    );
  },
  code: (v: UsageValues) => {
    const attrs = [
      'v-model:value="active"',
      v.orientation && v.orientation !== "horizontal" ? 'orientation="vertical"' : "",
    ].filter(Boolean);
    const visibleTabs = v.hideWhenSingle ? tabs.slice(0, 1) : tabs;
    const listAttr = v.hideWhenSingle ? " hide-when-single" : "";
    const tabLines = visibleTabs
      .map(
        (t) =>
          `      <Tab value="${t.value}"${v.badge && t.badge !== undefined ? ` :badge="${t.badge}"` : ""}${t.disabled ? " disabled" : ""}>${t.label}</Tab>`,
      )
      .join("\n");
    const panelLines = visibleTabs
      .filter((t) => !t.disabled)
      .map((t) => `      <TabPanel value="${t.value}">\n        <p class="doc-note">${panelText[t.value]}</p>\n      </TabPanel>`)
      .join("\n");
    return sfc({
      ui: ["Tab", "TabList", "TabPanel", "TabPanels", "Tabs"],
      vue: ["ref"],
      setup: [`const active = ref(${JSON.stringify(v.active ?? "draft")});`],
      template: `<Tabs\n    ${attrs.join("\n    ")}\n  >\n    <TabList${listAttr}>\n${tabLines}\n    </TabList>\n    <TabPanels>\n${panelLines}\n    </TabPanels>\n  </Tabs>`,
    });
  },
};
