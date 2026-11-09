import { defineComponent } from "vue";
import { describe, expect, it } from "vitest";
import { attrName, entryCode, literal, sfc } from "./codegen";
import type { UsageControl, UsageEntry } from "./types";

const Dummy = defineComponent({ name: "MwDummy", render: () => null });

const controls: UsageControl[] = [
  { prop: "label", label: "文字", kind: "text", default: "保存修改", slot: true },
  { prop: "severity", label: "语义", kind: "enum", default: "primary", options: [{ label: "主", value: "primary" }, { label: "险", value: "danger" }] },
  { prop: "size", label: "尺寸", kind: "enum", default: "md", options: [{ label: "小", value: "sm" }, { label: "中", value: "md" }] },
  { prop: "loading", label: "加载", kind: "boolean", default: false },
  { prop: "disabled", label: "禁用", kind: "boolean", default: false },
  { prop: "badge", label: "徽标", kind: "number", default: 0 },
];

const entry: UsageEntry = {
  slug: "dummy",
  component: Dummy,
  tag: "Dummy",
  controls,
};

describe("usage codegen", () => {
  it("等于 default 的属性省略,得到最简代码", () => {
    const code = entryCode(entry, { label: "保存修改", severity: "primary", size: "md", loading: false, disabled: false, badge: 0 });
    expect(code).toBe(
      [
        '<script setup lang="ts">',
        'import { Dummy } from "@mango-write/ui-vue";',
        "</script>",
        "",
        "<template>",
        "  <Dummy>保存修改</Dummy>",
        "</template>",
      ].join("\n"),
    );
  });

  it("非默认值按类型序列化:枚举裸属性、boolean 裸属性/:false、数字 :attr", () => {
    const code = entryCode(entry, { label: "删除", severity: "danger", size: "md", loading: true, disabled: false, badge: 3 });
    expect(code).toContain('<Dummy severity="danger" loading :badge="3">删除</Dummy>');
  });

  it("boolean false 的非默认值显式输出 :attr=\"false\"", () => {
    const e: UsageEntry = {
      slug: "dummy",
      component: Dummy,
      tag: "Dummy",
      controls: [{ prop: "closable", label: "可关", kind: "boolean", default: true }],
    };
    const code = entryCode(e, { closable: false });
    expect(code).toContain('<Dummy :closable="false" />');
  });

  it("v-model 恒输出并声明 ref,初始值跟随当前配置;命名 model 输出 v-model:value", () => {
    const e: UsageEntry = {
      slug: "dummy",
      component: Dummy,
      tag: "Dummy",
      controls: [
        { prop: "modelValue", vname: "checked", label: "选中", kind: "boolean", default: false, vmodel: true },
        { prop: "value", label: "当前", kind: "enum", default: "a", options: [{ label: "A", value: "a" }], vmodel: true },
      ],
    };
    const code = entryCode(e, { checked: false, value: "a" });
    expect(code).toContain('import { ref } from "vue";');
    expect(code).toContain('const checked = ref(false);');
    expect(code).toContain('const value = ref("a");');
    expect(code).toContain('<Dummy v-model="checked" v-model:value="value" />');
  });

  it("插槽文本不做属性转义,原样输出", () => {
    const code = entryCode(entry, { label: "说\"不\"", severity: "primary", size: "md", loading: false, disabled: false, badge: 0 });
    expect(code).toContain('>说"不"</Dummy>');
  });

  it("componentOptions 输出 :attr=\"名字\" 并收进 lucide 导入", () => {
    const e: UsageEntry = {
      slug: "dummy",
      component: Dummy,
      tag: "Dummy",
      controls: [
        {
          prop: "icon",
          label: "图标",
          kind: "enum",
          default: "",
          componentOptions: [
            { name: "Plus", component: Dummy },
            { name: "Filter", component: Dummy },
          ],
        },
      ],
    };
    const code = entryCode(e, { icon: "Plus" });
    expect(code).toContain('import { Plus } from "lucide-vue-next";');
    expect(code).toContain('<Dummy :icon="Plus" />');
  });

  it("baseProps 参与输出,false 与空串省略", () => {
    const e: UsageEntry = {
      slug: "dummy",
      component: Dummy,
      tag: "Dummy",
      controls: [],
      baseProps: { fluid: true, bare: false, title: "" },
    };
    expect(entryCode(e, {})).toContain("<Dummy fluid />");
  });

  it("多标签伴生导入(Tabs 全家桶)", () => {
    const e: UsageEntry = {
      slug: "dummy",
      component: Dummy,
      tag: "Tabs",
      extraTags: ["TabList", "Tab", "TabPanels", "TabPanel"],
      controls: [],
      code: () =>
        sfc({
          ui: ["Tab", "TabList", "TabPanel", "TabPanels", "Tabs"],
          vue: ["ref"],
          setup: ['const value = ref("a");'],
          template: "<Tabs v-model:value=\"value\">…</Tabs>",
        }),
    };
    const code = entryCode(e, {});
    expect(code).toContain('import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@mango-write/ui-vue";');
    expect(code).toContain("  <Tabs v-model:value=\"value\">…</Tabs>");
    expect(code.trimEnd().endsWith("</template>")).toBe(true);
  });

  it("attrName 用 kebab-case 或显式 attr", () => {
    expect(attrName({ prop: "showHeader", label: "", kind: "boolean" })).toBe("show-header");
    expect(attrName({ prop: "showHeader", label: "", kind: "boolean", attr: "show-header" })).toBe("show-header");
  });

  it("literal 序列化字符串/数字/布尔/undefined", () => {
    expect(literal("a")).toBe('"a"');
    expect(literal(3)).toBe("3");
    expect(literal(true)).toBe("true");
    expect(literal(undefined)).toBe("undefined");
  });
});
