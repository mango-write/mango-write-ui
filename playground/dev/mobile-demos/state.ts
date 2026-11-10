import { reactive, watch } from "vue";
import { locale, t, type Bi } from "../i18n";

export type MpPageSlug =
  | "installation"
  | "navbar"
  | "cell"
  | "button"
  | "input"
  | "filters"
  | "empty"
  | "sheet"
  | "action-sheet"
  | "feedback"
  | "patterns";

export type MpDeviceId =
  | "iphone-18-pro"
  | "iphone-18-pro-max"
  | "android-21-9"
  | "huawei-pura-x"
  | "iphone-duo";

export type MpFormFactor = "bar" | "wide-fold" | "book-fold";
export type MpOrientation = "portrait" | "landscape";

export interface MpDevicePreset {
  id: MpDeviceId;
  name: Bi;
  shortLabel: Bi;
  os: "ios" | "android";
  formFactor: MpFormFactor;
  aspect: string;
  width: number;
  height: number;
  physical: string;
  dpr: number;
  diagonal: string;
  safeTop: number;
  safeBottom: number;
  cutout: "island" | "punch" | "none";
  isDefaultBenchmark?: boolean;
}

export const MP_DEVICE_PRESETS: readonly MpDevicePreset[] = [
  {
    id: "iphone-18-pro",
    name: { zh: "iPhone 18 Pro（默认开发基准）", en: "iPhone 18 Pro (Default Benchmark)" },
    shortLabel: { zh: "18 Pro · 402×874", en: "18 Pro · 402×874" },
    os: "ios",
    formFactor: "bar",
    aspect: "19.5:9",
    width: 402,
    height: 874,
    physical: "1206 × 2622",
    dpr: 3,
    diagonal: '6.3"',
    safeTop: 50,
    safeBottom: 28,
    cutout: "island",
    isDefaultBenchmark: true,
  },
  {
    id: "iphone-18-pro-max",
    name: { zh: "iPhone 18 Pro Max（iOS 大屏）", en: "iPhone 18 Pro Max (iOS Large)" },
    shortLabel: { zh: "Pro Max · 440×956", en: "Pro Max · 440×956" },
    os: "ios",
    formFactor: "bar",
    aspect: "19.5:9",
    width: 440,
    height: 956,
    physical: "1320 × 2868",
    dpr: 3,
    diagonal: '6.9"',
    safeTop: 50,
    safeBottom: 28,
    cutout: "island",
  },
  {
    id: "android-21-9",
    name: { zh: "Android 主流新机（21:9 修长屏）", en: "Android Flagship (21:9 Tall)" },
    shortLabel: { zh: "Android 21:9 · 414×966", en: "Android 21:9 · 414×966" },
    os: "android",
    formFactor: "bar",
    aspect: "21:9",
    width: 414,
    height: 966,
    physical: "1242 × 2898",
    dpr: 3,
    diagonal: '6.7"',
    safeTop: 36,
    safeBottom: 20,
    cutout: "punch",
  },
  {
    id: "huawei-pura-x",
    name: { zh: "HUAWEI Pura X（16:10 阔折叠）", en: "HUAWEI Pura X (16:10 Wide Fold)" },
    shortLabel: { zh: "Pura X · 440×706", en: "Pura X · 440×706" },
    os: "android",
    formFactor: "wide-fold",
    aspect: "16:10",
    width: 440,
    height: 706,
    physical: "1320 × 2120",
    dpr: 3,
    diagonal: '6.3"',
    safeTop: 32,
    safeBottom: 18,
    cutout: "punch",
  },
  {
    id: "iphone-duo",
    name: { zh: "iPhone Duo（折叠展开态）", en: "iPhone Duo (Fold Expanded)" },
    shortLabel: { zh: "iPhone Duo · 688×874", en: "iPhone Duo · 688×874" },
    os: "ios",
    formFactor: "book-fold",
    aspect: "4:5",
    width: 688,
    height: 874,
    physical: "2064 × 2622",
    dpr: 3,
    diagonal: '7.8"',
    safeTop: 32,
    safeBottom: 20,
    cutout: "none",
  },
] as const;

export function getMpDevicePreset(id: MpDeviceId): MpDevicePreset {
  return MP_DEVICE_PRESETS.find((item) => item.id === id) ?? MP_DEVICE_PRESETS[0];
}

function freshState() {
  return structuredClone({
    button: {
      label: t({ zh: "保存研究记录", en: "Save research note" }),
      variant: "solid" as "solid" | "tinted" | "outlined" | "text",
      severity: "primary" as "primary" | "secondary" | "danger",
      size: "md" as "sm" | "md" | "lg",
      block: true,
      disabled: false,
      loading: false,
    },
    navbar: { showBack: false, capsuleSafe: true, showBadges: false },
    cell: { grouped: false, showLead: false, clickable: true, arrow: true, selected: false, disabled: false },
    input: {
      query: "ColBERTv2",
      inputValue: "Attention Is All You Need",
      textareaValue: t({ zh: "记录实验观察、文献批注或下一步假设。", en: "Record observations, literature notes, or the next hypothesis." }),
      clearable: true,
      disabled: false,
      invalid: false,
      maxlength: 300,
    },
    filters: { category: "all", tags: ["experiment"] as string[], disabled: false },
    empty: { status: "empty" as "empty" | "error" | "loading", showAction: true },
    sheet: { open: false, selectOpen: false, showFooter: true },
    actionSheet: { open: false, hasDanger: true, disabledShare: false },
    feedback: {
      danger: true,
      toastTone: "success" as "info" | "success" | "warn" | "error",
      toastMessage: t({ zh: "已保存至当前空间", en: "Saved to current space" }),
      confirmTick: 0,
      toastTick: 0,
    },
    patterns: { mode: "action" as "action" | "composer", message: "", submitted: "" },
  });
}

export const mpSim = reactive({
  activeSlug: "installation" as MpPageSlug,
  theme: "light" as "light" | "dark",
  deviceId: "iphone-18-pro" as MpDeviceId,
  orientation: "portrait" as MpOrientation,
  width: 402 as number,
  height: 874 as number,
  scaleMode: "1:1" as "1:1" | "fit",
  longContent: false,
  debugTouch: false,
  ...freshState(),
});

function syncMpViewport(): void {
  const preset = getMpDevicePreset(mpSim.deviceId);
  if (mpSim.orientation === "landscape") {
    mpSim.width = preset.height;
    mpSim.height = preset.width;
  } else {
    mpSim.width = preset.width;
    mpSim.height = preset.height;
  }
}

export function selectMpDevice(deviceId: MpDeviceId): void {
  const preset = getMpDevicePreset(deviceId);
  mpSim.deviceId = preset.id;
  syncMpViewport();
}

export function setMpOrientation(orientation: MpOrientation): void {
  mpSim.orientation = orientation;
  syncMpViewport();
}

export function toggleMpOrientation(): void {
  setMpOrientation(mpSim.orientation === "portrait" ? "landscape" : "portrait");
}

const SLUG_STATE_KEY: Partial<Record<MpPageSlug, keyof ReturnType<typeof freshState>>> = {
  button: "button",
  navbar: "navbar",
  cell: "cell",
  input: "input",
  filters: "filters",
  empty: "empty",
  sheet: "sheet",
  "action-sheet": "actionSheet",
  feedback: "feedback",
  patterns: "patterns",
};

export function isMpPageChanged(slug: MpPageSlug): boolean {
  const key = SLUG_STATE_KEY[slug];
  if (!key) return false;
  const fresh = freshState()[key];
  const current = mpSim[key];
  return JSON.stringify(current) !== JSON.stringify(fresh);
}

watch(locale, () => Object.assign(mpSim, freshState()));

export function resetMpPageState(slug?: MpPageSlug): void {
  const fresh = freshState();
  const key = slug ? SLUG_STATE_KEY[slug] : undefined;
  if (key) {
    (mpSim as Record<string, unknown>)[key] = fresh[key];
    return;
  }
  Object.assign(mpSim, fresh);
}

export function activateMpRoute(slug: string): void {
  if (
    ["installation", "navbar", "cell", "button", "input", "filters", "empty", "sheet", "action-sheet", "feedback", "patterns"].includes(slug)
  ) {
    mpSim.activeSlug = slug as MpPageSlug;
  }
}
