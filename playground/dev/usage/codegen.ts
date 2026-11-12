import { buildTsx, convertSfcToTsxFallback, customReactEntryCode, type TsxOptions } from "./react-codegen";
import type { UsageControl, UsageEntry, UsageValues } from "./types";

const kebab = (s: string) => s.replace(/[A-Z]/g, (ch) => `-${ch.toLowerCase()}`);

const camel = (s: string) => s.replace(/-([a-z])/g, (_, ch: string) => ch.toUpperCase());

export const attrName = (c: UsageControl): string => c.attr ?? kebab(c.prop);

/** React JSX 属性名:aria-* 与 data-* 保持连字符,其余统一 camelCase */
export const reactAttrName = (c: UsageControl): string => {
  if (c.attr && (c.attr.startsWith("aria-") || c.attr.startsWith("data-"))) return c.attr;
  if (c.prop.startsWith("aria-") || c.prop.startsWith("data-")) return c.prop;
  return camel(c.prop);
};

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

/** 生成 React TSX 示例文本:react / ui-react / lucide-react 导入 + 函数组件体 */
export function tsx(opts: TsxOptions): string {
  return buildTsx(opts);
}

function attrText(c: UsageControl, value: string | number | boolean): string {
  if (typeof value === "boolean") return value ? attrName(c) : `:${attrName(c)}="false"`;
  if (typeof value === "number") return `:${attrName(c)}="${value}"`;
  return `${attrName(c)}="${value.replace(/"/g, "&quot;")}"`;
}

function reactAttrText(c: UsageControl, value: string | number | boolean): string {
  const name = reactAttrName(c);
  if (typeof value === "boolean") return value ? name : `${name}={false}`;
  if (typeof value === "number") return `${name}={${value}}`;
  return `${name}=${JSON.stringify(value)}`;
}

export interface ReactModelBinding {
  valueProp: string;
  handlerProp?: string;
}

/** 受控控件在 React 组件上的受控属性对(value/onValueChange、checked/onCheckedChange 等) */
export function reactModelProps(c: UsageControl, tag?: string): ReactModelBinding {
  if (tag === "ProgressBar") {
    return { valueProp: "value" };
  }
  if (c.prop === "open" || c.prop === "visible") {
    return { valueProp: "open", handlerProp: "onOpenChange" };
  }
  if (c.prop === "first") {
    return { valueProp: "first", handlerProp: "onFirstChange" };
  }
  if (
    c.prop === "checked" ||
    tag === "Checkbox" ||
    tag === "ToggleSwitch" ||
    (c.prop === "modelValue" && c.kind === "boolean")
  ) {
    return { valueProp: "checked", handlerProp: "onCheckedChange" };
  }
  return { valueProp: "value", handlerProp: "onValueChange" };
}

/** 配置面板右上角的 React 属性名提示 */
export function reactDisplayAttr(c: UsageControl, tag?: string, v?: UsageValues): string {
  if (c.vmodel) {
    const { valueProp, handlerProp } = reactModelProps(c, tag);
    return handlerProp ? `${valueProp} / ${handlerProp}` : valueProp;
  }
  if (c.slot) return "children";
  const name = reactAttrName(c);
  if (c.kind === "boolean" && v && v[valueKey(c)] === false && c.default !== false) {
    return `${name}={false}`;
  }
  return name;
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

function setterOf(varName: string): string {
  return `set${varName.charAt(0).toUpperCase()}${varName.slice(1)}`;
}

/**
 * React TSX 代码生成器:与 entryCode 对称输出 @mango-write/ui-react + lucide-react 代码。
 */
export function entryReactCode(entry: UsageEntry, v: UsageValues): string {
  if (entry.reactCode) return entry.reactCode(v);

  const custom = customReactEntryCode(entry.slug, v);
  if (custom !== null) return custom;

  if (entry.code) {
    return convertSfcToTsxFallback(entry.code(v));
  }

  const attrs: string[] = [];
  const setup: string[] = [];
  const lucide: string[] = [];
  let needsUseState = false;
  let slotText: string | undefined;

  for (const c of entry.controls) {
    const key = valueKey(c);
    const value = v[key];
    if (c.vmodel) {
      const { valueProp, handlerProp } = reactModelProps(c, entry.tag);
      if (handlerProp) {
        needsUseState = true;
        const setter = setterOf(key);
        const typeParam =
          entry.tag === "InputNumber" && c.kind === "number"
            ? "<number | null>"
            : entry.tag === "InputText" || entry.tag === "Textarea"
              ? "<string | null>"
              : "";
        setup.push(`const [${key}, ${setter}] = useState${typeParam}(${literal(value)});`);
        attrs.push(`${valueProp}={${key}}`, `${handlerProp}={${setter}}`);
      } else {
        attrs.push(`${valueProp}={${literal(value)}}`);
      }
      continue;
    }
    if (c.slot) {
      if (typeof value === "string" && value) slotText = value;
      continue;
    }
    if (value === undefined || value === c.default) continue;
    if (c.componentOptions) {
      attrs.push(`${reactAttrName(c)}={${value}}`);
      lucide.push(String(value));
      continue;
    }
    attrs.push(reactAttrText(c, value as string | number | boolean));
  }

  for (const [key, value] of Object.entries(entry.baseProps ?? {})) {
    if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") continue;
    const pseudo = { prop: key } as UsageControl;
    if (typeof value === "boolean" ? !value : value === "") continue;
    attrs.push(reactAttrText(pseudo, value));
  }

  const open = `<${entry.tag}${attrs.length ? ` ${attrs.join(" ")}` : ""}`;
  const jsx = slotText ? `${open}>${slotText}</${entry.tag}>` : `${open} />`;
  return tsx({
    ui: [entry.tag, ...(entry.extraTags ?? [])],
    react: needsUseState ? ["useState"] : [],
    lucide,
    setup,
    jsx,
  });
}
