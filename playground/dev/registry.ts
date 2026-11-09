// 目录数据在 registry-data.ts(纯字面量,gen-llms 直读);这里只补懒加载函数。
import type { Component } from "vue";
import { docGroups as groupData } from "./registry-data";
import type { DocEntry as DocEntryData, DocGroup as DocGroupData } from "./registry-data";

const f = import.meta.glob<{ default: Component }>("./pages/foundations/*.vue");
const c = import.meta.glob<{ default: Component }>("./pages/components/*.vue");

export interface DocEntry extends DocEntryData {
  load: () => Promise<{ default: Component }>;
}

export interface DocGroup extends Omit<DocGroupData, "entries"> {
  entries: DocEntry[];
}

function withLoad(entry: DocEntryData): DocEntry {
  const load = f[`./pages/foundations/${entry.slug}.vue`] ?? c[`./pages/components/${entry.slug}.vue`];
  if (!load) throw new Error(`registry: 无页面文件 ${entry.slug}`); // i18n-allow 开发者报错,非界面文案
  return { ...entry, load };
}

export const docGroups: DocGroup[] = groupData.map((group) => ({
  ...group,
  entries: group.entries.map(withLoad),
}));
