// 目录数据在 registry-data.ts(纯字面量,gen-llms 直读);这里只补懒加载函数。
import type { Component } from "vue";
import { docGroups as groupData } from "./registry-data";
import type { DocEntry as DocEntryData, DocGroup as DocGroupData, DocSectionId } from "./registry-data";

export type { DocSectionId };

const f = import.meta.glob<{ default: Component }>("./pages/foundations/*.vue");
const c = import.meta.glob<{ default: Component }>("./pages/components/*.vue");
const m = import.meta.glob<{ default: Component }>("./pages/mobile/*.vue");

export interface DocEntry extends DocEntryData {
  load: () => Promise<{ default: Component }>;
}

export interface DocGroup extends Omit<DocGroupData, "entries"> {
  entries: DocEntry[];
}

function withLoad(group: DocGroupData, entry: DocEntryData): DocEntry {
  const load =
    group.base === "/mobile"
      ? m[`./pages/mobile/${entry.slug}.vue`]
      : f[`./pages/foundations/${entry.slug}.vue`] ?? c[`./pages/components/${entry.slug}.vue`];
  if (!load) throw new Error(`registry: 无页面文件 ${group.base}/${entry.slug}`); // i18n-allow 开发者报错,非界面文案
  return { ...entry, load };
}

export const docGroups: DocGroup[] = groupData.map((group) => ({
  ...group,
  entries: group.entries.map((entry) => withLoad(group, entry)),
}));
