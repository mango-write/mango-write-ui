// 展示站页面文案的双语底座:内联 { zh, en } 字典 + 轻量取词器。
// 不建集中词表——文案与页面/数据就近放一起,TS 逐条强制中英对齐,漏译直接
// typecheck 红;scripts/check-dev-locale.mjs 再兜一层裸中文棘轮。
// 库组件内置文案不在这里:那套走 src/locale 的 mergeUiMessages(main.ts 同步 locale)。
import { ref } from "vue";

export type Locale = "zh-CN" | "en-US";

/** 一条文案的两种语言。页面、套件与 api 数据的文案类字段都用它。 */
export interface Bi {
  zh: string;
  en: string;
}

const STORAGE_KEY = "mango-write-ui:locale";

function initialLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "zh-CN" || saved === "en-US") return saved;
  } catch {
    // 隐私模式等 localStorage 不可用场景,回落浏览器语言
  }
  // 预渲染快照按 seo.config locales[0] 钉了浏览器语言,首屏必然落在默认档。
  return navigator.language?.toLowerCase().startsWith("zh") ? "zh-CN" : "en-US";
}

export const locale = ref<Locale>(initialLocale());

export function setLocale(next: Locale): void {
  locale.value = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // 写不进就只活在本会话
  }
}

/** 取词。语言中立的内容直接传 string;render 期调用,读 locale ref,切换即重渲染。 */
export function t(value: string | Bi): string {
  return typeof value === "string" ? value : locale.value === "zh-CN" ? value.zh : value.en;
}

/** 运行时区分普通字符串值与双语值(usage 控件值、slot 默认文本等宽类型场景)。 */
export function isBi(value: unknown): value is Bi {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Bi).zh === "string" &&
    typeof (value as Bi).en === "string"
  );
}

/** 双语文案的另一语言副名(侧栏次行、DocPage eyebrow):主名当前语言,副名固定给对面。 */
export function alt(value: Bi, current: Locale): string {
  return current === "zh-CN" ? value.en : value.zh;
}
