import { defineComponent } from "vue";
import { describe, expect, it } from "vitest";
import {
  attrName,
  entryCode,
  entryReactCode,
  literal,
  reactAttrName,
  reactDisplayAttr,
  reactModelProps,
  sfc,
  tsx,
  valueKey,
} from "./codegen";
import type { UsageControl, UsageEntry, UsageValues } from "./types";

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

const entryModules = import.meta.glob<{ usage: UsageEntry }>("./entries/*.ts", { eager: true });

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

describe("usage react tsx codegen", () => {
  it("默认值省略并输出标准 React TSX 组件结构", () => {
    const code = entryReactCode(entry, {
      label: "保存修改",
      severity: "primary",
      size: "md",
      loading: false,
      disabled: false,
      badge: 0,
    });
    expect(code).toBe(
      [
        'import { Dummy } from "@mango-write/ui-react";',
        "",
        "export default function Example() {",
        "  return <Dummy>保存修改</Dummy>;",
        "}",
      ].join("\n"),
    );
  });

  it("非默认值按 JSX 语法序列化:字符串字面量、裸布尔、={false}、={number} 与 lucide-react", () => {
    const e: UsageEntry = {
      slug: "dummy-props",
      component: Dummy,
      tag: "Dummy",
      controls: [
        ...controls,
        { prop: "showHeader", label: "头部", kind: "boolean", default: true },
        {
          prop: "icon",
          label: "图标",
          kind: "enum",
          default: "",
          componentOptions: [{ name: "Plus", component: Dummy }],
        },
      ],
    };
    const code = entryReactCode(e, {
      label: "删除",
      severity: "danger",
      size: "md",
      loading: true,
      disabled: false,
      badge: 3,
      showHeader: false,
      icon: "Plus",
    });
    expect(code).toContain('import { Dummy } from "@mango-write/ui-react";');
    expect(code).toContain('import { Plus } from "lucide-react";');
    expect(code).toContain('<Dummy severity="danger" loading badge={3} showHeader={false} icon={Plus}>删除</Dummy>');
  });

  it("受控 v-model 自动转换为 useState + checked/onCheckedChange、open/onOpenChange、value/onValueChange", () => {
    const e: UsageEntry = {
      slug: "dummy-controlled",
      component: Dummy,
      tag: "Dummy",
      controls: [
        { prop: "modelValue", vname: "checked", label: "选中", kind: "boolean", default: false, vmodel: true },
        { prop: "open", label: "打开", kind: "boolean", default: false, vmodel: true },
        { prop: "value", label: "当前", kind: "enum", default: "a", options: [{ label: "A", value: "a" }], vmodel: true },
      ],
    };
    const code = entryReactCode(e, { checked: true, open: false, value: "a" });
    expect(code).toContain('import { useState } from "react";');
    expect(code).toContain("const [checked, setChecked] = useState(true);");
    expect(code).toContain("const [open, setOpen] = useState(false);");
    expect(code).toContain('const [value, setValue] = useState("a");');
    expect(code).toContain(
      "<Dummy checked={checked} onCheckedChange={setChecked} open={open} onOpenChange={setOpen} value={value} onValueChange={setValue} />",
    );
  });

  it("Paginator 与只读 ProgressBar 受控属性映射准确", () => {
    expect(
      reactModelProps({ prop: "first", label: "起始", kind: "number", vmodel: true }, "Paginator"),
    ).toEqual({ valueProp: "first", handlerProp: "onFirstChange" });
    expect(
      reactModelProps({ prop: "value", label: "进度", kind: "number", vmodel: true }, "ProgressBar"),
    ).toEqual({ valueProp: "value" });

    expect(
      reactDisplayAttr({ prop: "modelValue", label: "开关", kind: "boolean", vmodel: true }, "ToggleSwitch"),
    ).toBe("checked / onCheckedChange");
    expect(
      reactDisplayAttr({ prop: "open", label: "打开", kind: "boolean", vmodel: true }, "Dialog"),
    ).toBe("open / onOpenChange");
    expect(
      reactDisplayAttr({ prop: "label", label: "文案", kind: "text", slot: true }, "Button"),
    ).toBe("children");
    expect(
      reactDisplayAttr(
        { prop: "closable", label: "可关", kind: "boolean", default: true },
        "Dialog",
        { closable: false },
      ),
    ).toBe("closable={false}");
    expect(reactAttrName({ prop: "aria-label", label: "", kind: "text" })).toBe("aria-label");
    expect(reactAttrName({ prop: "showClear", label: "", kind: "boolean" })).toBe("showClear");
  });

  it("自定义 SFC entry 在未注册专用分支时也能自动降级转换为 TSX", () => {
    const e: UsageEntry = {
      slug: "custom-synthetic",
      component: Dummy,
      tag: "Tabs",
      controls: [],
      code: () =>
        sfc({
          ui: ["Tab", "TabList", "Tabs"],
          vue: ["ref"],
          lucide: ["Sparkles"],
          setup: ['const active = ref("a");'],
          template: '<Tabs v-model:value="active" :show-clear="false"><Sparkles /></Tabs>',
        }),
    };
    const code = entryReactCode(e, {});
    expect(code).toContain('import { useState } from "react";');
    expect(code).toContain('import { Tab, TabList, Tabs } from "@mango-write/ui-react";');
    expect(code).toContain('import { Sparkles } from "lucide-react";');
    expect(code).toContain('const [active, setActive] = useState("a");');
    expect(code).toContain("<Tabs value={active} onValueChange={setActive} showClear={false}><Sparkles /></Tabs>");
  });

  it("tsx 构造器支持多行 JSX 自动括号包裹", () => {
    const out = tsx({
      ui: ["Dialog", "Button"],
      react: ["useState"],
      setup: ["const [open, setOpen] = useState(false);"],
      jsx: "<Dialog open={open} onOpenChange={setOpen}>\n  <Button label=\"确认\" />\n</Dialog>",
    });
    expect(out).toContain("  return (\n    <Dialog open={open} onOpenChange={setOpen}>");
  });

  it("全量 51 个桌面组件 usage entry 均输出无 Vue 残留的合法 React TSX", () => {
    const entries = Object.values(entryModules).map((m) => m.usage);
    expect(entries.length).toBeGreaterThanOrEqual(51);

    for (const item of entries) {
      const defaults: UsageValues = {};
      for (const c of item.controls) defaults[valueKey(c)] = c.default;
      const reactCode = entryReactCode(item, defaults);

      expect(reactCode, `${item.slug} should import @mango-write/ui-react`).toContain("@mango-write/ui-react");
      expect(reactCode, `${item.slug} should not leak @mango-write/ui-vue`).not.toContain("@mango-write/ui-vue");
      expect(reactCode, `${item.slug} should not leak lucide-vue-next`).not.toContain("lucide-vue-next");
      expect(reactCode, `${item.slug} should not leak <script setup>`).not.toContain("<script setup");
      expect(reactCode, `${item.slug} should not leak <template>`).not.toContain("<template");
      expect(reactCode, `${item.slug} should not leak v-model`).not.toContain("v-model");
    }
  });
});
