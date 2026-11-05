import { h } from "vue";
import { valueKey } from "./codegen";
import type { UsageEntry, UsageHost, UsageValues } from "./types";

/**
 * 声明式 entry → VNode。与 entryCode 同一条数据路径:
 * 等于 default 的属性不传(与生成代码省略该属性的语义一致,预览即所得代码),
 * v-model 控件受控绑定并把回写落到 values(reactive)。
 */
export function entryRender(entry: UsageEntry, v: UsageValues, host?: UsageHost) {
  if (entry.render) return entry.render(v, host!);

  const props: Record<string, unknown> = { ...entry.baseProps };
  let children: string | undefined;

  for (const c of entry.controls) {
    const value = v[valueKey(c)];
    if (c.componentOptions) {
      const found = c.componentOptions.find((o) => o.name === value);
      if (found) props[c.prop] = found.component;
      continue;
    }
    if (c.slot) {
      if (typeof value === "string" && value) children = value;
      continue;
    }
    if (c.vmodel) {
      props[c.prop] = value;
      props[`onUpdate:${c.prop}`] = (x: unknown) => {
        v[valueKey(c)] = x as never;
      };
      continue;
    }
    if (value === undefined || value === c.default) continue;
    props[c.prop] = value;
  }

  return h(entry.component, props, children ? { default: () => children } : undefined);
}
