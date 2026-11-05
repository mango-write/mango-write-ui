import type { ApiEntry } from "./types";

const modules = import.meta.glob<{ api: ApiEntry }>("./entries/*.ts", { eager: true });

/** slug → 接口元数据。ApiTable、站内搜索与 gen-llms 共用这一份事实源。 */
export const apiEntries: Record<string, ApiEntry> = Object.fromEntries(
  Object.values(modules).map((m) => [m.api.slug, m.api]),
);
