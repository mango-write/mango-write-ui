import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "config-section",
  component: "ConfigSection / ConfigRow",
  title: { zh: "配置分组行", en: "ConfigSection / ConfigRow" },
  importPath: "@mango-write/ui-vue",
  exports: ["ConfigSection", "ConfigRow", "AdminConfigSection", "AdminConfigRow"],
  rows: [
    {
      name: "ConfigSection title / #title",
      kind: "prop",
      type: "string · slot",
      desc: {
        zh: "配置分组卡片标题；外框采用凹陷底（<code>--bg-sunken</code>）并启用容器查询（<code>container-type: inline-size</code>）",
        en: "Group card title; uses the sunken surface (<code>--bg-sunken</code>) with <code>container-type: inline-size</code>",
      },
    },
    {
      name: "ConfigRow label / keyHint",
      kind: "prop",
      type: "string · string",
      desc: {
        zh: "左侧配置项标签（默认宽 168px）；传入 <code>keyHint</code> 时鼠标悬停经 <code>v-tooltip</code> 显示底层配置键名",
        en: "Left setting label (default 168px wide); hovering displays <code>keyHint</code> via <code>v-tooltip</code>",
      },
    },
    {
      name: "ConfigRow hint / #hint",
      kind: "prop",
      type: "string · slot",
      desc: {
        zh: "右侧自适应宽度说明文案；容器窄于 720px 时自动折至控件下方，窄于 520px 时转为单列流",
        en: "Right-column helper text; wraps below the control under 720px and collapses to a single column under 520px",
      },
    },
    {
      name: "ConfigRow status / statusTone / #status",
      kind: "prop",
      type: "string · 'muted' | 'success' | 'warning' | 'danger' · slot",
      desc: {
        zh: "跨整行底部的状态反馈行与语义色调（默认 <code>muted</code>）",
        en: "Full-width bottom status feedback line and semantic tone (default <code>muted</code>)",
      },
    },
  ],
};
