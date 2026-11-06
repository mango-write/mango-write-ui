import { docGroups } from "./registry";
import { apiEntries } from "./api";
import type { Bi } from "./i18n";

export interface SearchItem {
  url: string;
  /** 展示标题,如「按钮 Button」——两种语言都在检索面,不随界面语言切换 */
  title: string;
  en: string;
  /** 侧栏分组(操作 / 输入 / 选择…),SearchDialog 按当前语言渲染 */
  group: Bi;
  /** 小写检索面:slug、en、导入名、接口行名 */
  keywords: string;
}

export interface SearchHit {
  item: SearchItem;
  score: number;
}

let index: SearchItem[] | undefined;

/** 检索面与 ApiTable/gen-llms 同源:目录来自 docGroups,关键词来自 api/entries。 */
export function buildSearchIndex(): SearchItem[] {
  if (index) return index;
  const items: SearchItem[] = [];
  for (const group of docGroups) {
    for (const entry of group.entries) {
      const api = apiEntries[entry.slug];
      const names = api?.exports ?? (api ? [api.component] : []);
      items.push({
        url: `${group.base}/${entry.slug}`,
        title: `${entry.title.zh} ${entry.title.en}`,
        en: entry.title.en,
        group: group.title,
        keywords: [entry.slug, entry.title.en, ...names, ...(api?.rows.map((r) => r.name) ?? [])]
          .join(" ")
          .toLowerCase(),
      });
    }
  }
  index = items;
  return items;
}

/** 全词命中(AND)才入选;en 全词精确命中 > 标题命中 > 关键词命中。 */
export function scoreItem(item: SearchItem, query: string): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  const title = item.title.toLowerCase();
  let score = 0;
  for (const term of q.split(/\s+/)) {
    if (item.en.toLowerCase() === term) score += 150;
    else if (title.startsWith(term)) score += 120;
    else if (title.includes(term)) score += 100;
    else if (item.keywords.includes(term)) score += 10;
    else return 0;
  }
  return score;
}

export function searchDocs(query: string): SearchHit[] {
  return buildSearchIndex()
    .map((item) => ({ item, score: scoreItem(item, query) }))
    .filter((hit) => hit.score > 0)
    // 平分决胜只用 ASCII 的 url/localeCompare(en)——中文标题的 localeCompare
    // 依赖系统 ICU（Windows 与 macOS 的中文排序不同），会让同分命中顺序漂移。
    .sort((a, b) => b.score - a.score || a.item.url.localeCompare(b.item.url));
}
