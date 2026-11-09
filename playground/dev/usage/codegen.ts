import type { UsageControl, UsageEntry, UsageValues } from "./types";

const kebab = (s: string) => s.replace(/[A-Z]/g, (ch) => `-${ch.toLowerCase()}`);

export const attrName = (c: UsageControl): string => c.attr ?? kebab(c.prop);

/** vmodel 控件在 values 与生成代码中的变量名 */
export const valueKey = (c: UsageControl): string => c.vname ?? c.prop;

/** v-model 的命名后缀:prop 为 modelValue 时省略,其余输出 v-model:prop */
export const modelSuffix = (c: UsageControl): string => (c.prop === "modelValue" ? "" : `:${c.prop}`);

/** 值 → 代码字面量(ref 初始值等位置用) */
export function literal(v: string | number | boolean | undefined): string {
  return typeof v === "string" ? JSON.stringify(v) : String(v ?? "undefined");
}

/**
 * 生成 SFC 文本:ui / vue / lucide 三段 import + setup 语句 + 模板体。
 * 复杂组件的 code 也走这里组装,保证整站示例代码格式一致。
 */
export function sfc(opts: {
  ui: readonly string[];
  vue?: readonly string[];
  lucide?: readonly string[];
  setup?: readonly string[];
  template: string;
}): string {
  const out: string[] = [];
  if (opts.ui.length || opts.vue?.length || opts.setup?.length) {
    out.push(`<script setup lang="ts">`);
    if (opts.vue?.length) out.push(`import { ${opts.vue.join(", ")} } from "vue";`);
    if (opts.ui.length) out.push(`import { ${opts.ui.join(", ")} } from "@mango-write/ui-vue";`);
    if (opts.lucide?.length)
      out.push(`import { ${[...new Set(opts.lucide)].join(", ")} } from "lucide-vue-next";`);
    if (opts.setup?.length) {
      if (opts.ui.length || opts.vue?.length) out.push("");
      out.push(...opts.setup);
    }
    out.push("</script>", "");
  }
  out.push("<template>");
  for (const line of opts.template.split("\n")) out.push(`  ${line}`);
  out.push("</template>");
  return out.join("\n");
}

function attrText(c: UsageControl, value: string | number | boolean): string {
  if (typeof value === "boolean") return value ? attrName(c) : `:${attrName(c)}="false"`;
  if (typeof value === "number") return `:${attrName(c)}="${value}"`;
  return `${attrName(c)}="${value.replace(/"/g, "&quot;")}"`;
}

/**
 * 声明式 entry 的生成代码。规则:v-model 恒带(附 ref 声明,初始值跟随当前配置);
 * 其余属性等于 default 的省略;boolean true 裸属性、false 显式 :attr="false";
 * 数字输出 :attr="n";componentOptions 输出 :attr="名字" 并收进 lucide 导入。
 */
export function entryCode(entry: UsageEntry, v: UsageValues): string {
  if (entry.code) return entry.code(v);

  const attrs: string[] = [];
  const setup: string[] = [];
  const lucide: string[] = [];
  let slotText: string | undefined;

  for (const c of entry.controls) {
    const key = valueKey(c);
    const value = v[key];
    if (c.vmodel) {
      attrs.push(`v-model${modelSuffix(c)}="${key}"`);
      setup.push(`const ${key} = ref(${literal(value)});`);
      continue;
    }
    if (c.slot) {
      if (typeof value === "string" && value) slotText = value;
      continue;
    }
    if (value === undefined || value === c.default) continue;
    if (c.componentOptions) {
      attrs.push(`:${attrName(c)}="${value}"`);
      lucide.push(String(value));
      continue;
    }
    attrs.push(attrText(c, value as string | number | boolean));
  }

  for (const [key, value] of Object.entries(entry.baseProps ?? {})) {
    // 数组/对象/函数(options 等)进不了属性序列化,由自定义 code 负责输出
    if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") continue;
    const pseudo = { prop: key } as UsageControl;
    if (typeof value === "boolean" ? !value : value === "") continue;
    attrs.push(attrText(pseudo, value));
  }

  const open = `<${entry.tag}${attrs.length ? ` ${attrs.join(" ")}` : ""}`;
  const template = slotText ? `${open}>${slotText}</${entry.tag}>` : `${open} />`;
  return sfc({
    ui: [entry.tag, ...(entry.extraTags ?? [])],
    vue: setup.length ? ["ref"] : [],
    lucide,
    setup,
    template,
  });
}
