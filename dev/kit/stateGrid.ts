// StateGrid → StateRow 的列题注传递。走注入而不是给 StateRow 加 prop,
// 是为了不改动 40+ 演示页的 <StateRow> 用法。
import type { ComputedRef, InjectionKey } from "vue";

export const stateGridColumnsKey: InjectionKey<ComputedRef<string[]>> = Symbol(
  "stateGridColumns",
);
