// 主题偏好（issue #110 · P6；issue #117 后提升到 packages/ui 供三个前端共用）：
// 设备偏好，存本地（localStorage）——主题不是账号数据，不加后端字段。
// 三档：跟随系统 / 浅色 / 深色。
//
// 落地方式只有一件事：维护 <html data-theme="light|dark">。
// - var.css 的深色 token 与 PrimeVue 的 darkModeSelector 都认这个属性；
// - 「跟随系统」= 监听 prefers-color-scheme 实时解析成显式属性（PrimeVue 的
//   属性开关不认 media，只能由我们把系统状态翻译成属性）；
// - var.css 另有 @media (prefers-color-scheme: dark) 块兜「JS 落定属性之前的
//   首帧」——深色系统用户不会闪白；属性一旦落定，两处选择器结论一致。
import { ref } from "vue";

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

/** 宿主可定制：存储键（多应用同域共存时不互踩）与主题属性落点（默认 <html>）。
 *  缺省值即 MangoWrite 两个产品站的现状，主站接入不需要传任何东西。 */
export interface ThemeOptions {
  storageKey?: string;
  /** 返回主题属性要写到的元素；返回 null（如 SSR）时跳过 DOM 写入。 */
  rootEl?: () => HTMLElement | null;
}

const DEFAULT_STORAGE_KEY = "mango-write:theme";
let storageKey = DEFAULT_STORAGE_KEY;
let pickRoot: () => HTMLElement | null = () =>
  typeof document === "undefined" ? null : document.documentElement;
const VALID: readonly ThemePreference[] = ["system", "light", "dark"];

function readStored(): ThemePreference {
  if (typeof window === "undefined") return "system";
  try {
    const raw = window.localStorage.getItem(storageKey);
    return VALID.includes(raw as ThemePreference) ? (raw as ThemePreference) : "system";
  } catch {
    return "system";
  }
}

export function resolveTheme(pref: ThemePreference): ResolvedTheme {
  if (pref === "light" || pref === "dark") return pref;
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

function applyTheme(pref: ThemePreference): void {
  const next = resolveTheme(pref);
  resolved.value = next;
  const root = pickRoot();
  if (root) root.dataset.theme = next;
}

const preference = ref<ThemePreference>(readStored());
/** 当前实际生效的深浅（「跟随系统」时随 prefers-color-scheme 实时变）。 */
const resolved = ref<ResolvedTheme>(resolveTheme(preference.value));

function setTheme(next: ThemePreference): void {
  preference.value = next;
  try {
    window.localStorage.setItem(storageKey, next);
  } catch {
    /* 私有模式等存不进就算了：本次会话仍生效 */
  }
  applyTheme(next);
}

/** 挂载前调用一次（main.ts 顶部、任何 await 之前）：落定属性，避免首帧闪白。
 *  存储在应用里总早于本模块加载就绪，这里统一重读一次——顺带覆盖 options 换键
 *  的场景（模块加载期是按默认键读的）。 */
export function initTheme(options?: ThemeOptions): void {
  if (options?.storageKey) storageKey = options.storageKey;
  if (options?.rootEl) pickRoot = options.rootEl;
  preference.value = readStored();
  applyTheme(preference.value);
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener?.("change", () => {
    if (preference.value === "system") applyTheme("system");
  });
}

export function useThemePreference() {
  return { preference, resolved, setTheme };
}
