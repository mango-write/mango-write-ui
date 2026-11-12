import { h } from "vue";
import { Button, SiteFooter, SiteHeader } from "@mango-write/ui-vue";
import { sfc } from "../codegen";
import type { UsageEntry } from "../types";

const navItems = [
  { label: "功能", href: "#features", active: true },
  { label: "价格", href: "#pricing" },
  { label: "文档", href: "#docs" },
];

export const usage: UsageEntry = {
  slug: "site",
  component: SiteHeader,
  tag: "SiteHeader",
  extraTags: ["SiteFooter"],
  flatPreview: true,
  controls: [
    { prop: "showLang", label: "语言按钮", kind: "boolean", default: true },
    { prop: "langLabel", label: "语言文字", kind: "text", default: "EN" },
    {
      prop: "locale",
      label: "页脚语言",
      kind: "enum",
      options: [
        { label: "简体中文 (zh-CN)", value: "zh-CN" },
        { label: "English (en)", value: "en" },
      ],
      default: "zh-CN",
    },
  ],
  render: (v, { notify }) =>
    h("div", { style: "width: 100%; display: grid; gap: var(--space-4)" }, [
      h(
        SiteHeader,
        {
          items: navItems,
          showLang: Boolean(v.showLang),
          langLabel: String(v.langLabel ?? "EN"),
          onToggleLang: () => notify.info("切换语言"),
        },
        {
          actions: () => h(Button, { size: "sm", label: "进入工作台" }),
        },
      ),
      h(
        SiteFooter,
        {
          locale: (v.locale as "zh-CN" | "en") ?? "zh-CN",
        },
        {
          default: () => [
            h("a", { href: "#terms" }, "服务条款"),
            h("a", { href: "#privacy" }, "隐私政策"),
          ],
        },
      ),
    ]),
  code: (v) => {
    const headerAttrs = [
      ':items="items"',
      v.showLang === false ? ':show-lang="false"' : "show-lang",
      v.langLabel && v.langLabel !== "EN" ? `lang-label="${v.langLabel}"` : "",
    ]
      .filter(Boolean)
      .join(" ");
    const footerAttr = v.locale && v.locale !== "zh-CN" ? ` locale="${v.locale}"` : "";
    return sfc({
      ui: ["Button", "SiteFooter", "SiteHeader"],
      setup: [
        "const items = [",
        '  { label: "功能", href: "#features", active: true },',
        '  { label: "价格", href: "#pricing" },',
        '  { label: "文档", href: "#docs" },',
        "];",
      ],
      template: `<SiteHeader ${headerAttrs}>
  <template #actions>
    <Button size="sm" label="进入工作台" />
  </template>
</SiteHeader>
<SiteFooter${footerAttr}>
  <a href="#terms">服务条款</a>
  <a href="#privacy">隐私政策</a>
</SiteFooter>`,
    });
  },
};
