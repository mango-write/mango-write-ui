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
export type MpScaleMode = "1:1" | "fit" | "custom";

export const MP_CUSTOM_SCALE_MIN = 40;
export const MP_CUSTOM_SCALE_MAX = 150;

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

export function resolveMpCreaseAxis(
  formFactor: MpFormFactor,
  orientation: MpOrientation,
): "horizontal" | "vertical" | null {
  if (formFactor === "bar") return null;
  // Pura X (440×706) 与 iPhone Duo (688×874 = 双 437×688 屏拼合) 竖置时折轴均沿短边水平横贯,横置时垂直居中。
  return orientation === "portrait" ? "horizontal" : "vertical";
}

export function getMpDeviceDiagonalInches(preset: MpDevicePreset): number {
  const parsed = Number.parseFloat(preset.diagonal);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 6.3;
}

export function getMpDeviceCssPpi(preset: MpDevicePreset): number {
  return Math.hypot(preset.width, preset.height) / getMpDeviceDiagonalInches(preset);
}

// 浏览器因反指纹不暴露显示器物理尺寸(EDID),按特征背板分辨率与纵横比反推物理对角线英寸数。
export function estimateMonitorCssPpi(
  screenWidth: number,
  screenHeight: number,
  devicePixelRatio = 1,
): number {
  if (!(screenWidth > 0 && screenHeight > 0)) return 110;
  const w = Math.max(screenWidth, screenHeight);
  const h = Math.min(screenWidth, screenHeight);
  const dpr = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1;
  const diagCss = Math.hypot(w, h);
  const physW = Math.round(w * dpr);
  const physH = Math.round(h * dpr);
  const aspect = w / h;
  const near = (a: number, b: number, tol = 12) => Math.abs(a - b) <= tol;

  let diagInches: number | undefined;
  if (
    (near(physW, 3024) && near(physH, 1964)) ||
    (near(physW, 3600) && near(physH, 2338)) ||
    (near(physW, 2704) && near(physH, 1756))
  ) {
    diagInches = 14.2;
  } else if (
    (near(physW, 3456) && near(physH, 2234)) ||
    (near(physW, 4112) && near(physH, 2658)) ||
    (near(physW, 3008) && near(physH, 1944))
  ) {
    diagInches = 16.2;
  } else if ((near(physW, 2940) && near(physH, 1912)) || (near(physW, 2560) && near(physH, 1664))) {
    diagInches = 13.6;
  } else if ((near(physW, 3420) && near(physH, 2214)) || (near(physW, 2880) && near(physH, 1864))) {
    diagInches = 15.3;
  } else if (near(physW, 4480) && near(physH, 2520)) {
    diagInches = 23.5;
  } else if (near(physW, 6016) && near(physH, 3384)) {
    diagInches = 32.0;
  } else if (aspect >= 2.2) {
    diagInches = aspect >= 3.2 ? 49.0 : physW >= 5000 ? 38.0 : 34.0;
  } else if (aspect <= 1.68 && dpr >= 1.2) {
    if (near(physW, 2880, 16) && near(physH, 1800, 16)) diagInches = w <= 1440 ? 13.8 : 14.2;
    else if (near(physW, 3360, 16) && near(physH, 2100, 16)) diagInches = 14.0;
    else if (physW >= 3000) diagInches = 15.3;
    else diagInches = 14.5;
  } else if (physW >= 4800) {
    diagInches = 27.0;
  } else if (physW >= 3600) {
    diagInches = dpr <= 1.1 ? 31.5 : 27.0;
  } else if (physW >= 2400) {
    diagInches = dpr >= 1.4 ? 15.6 : 27.0;
  } else if (physW >= 1800) {
    diagInches = dpr >= 1.2 ? 15.6 : 23.8;
  }

  const ppi = diagInches ? diagCss / diagInches : 110;
  return Math.min(160, Math.max(72, ppi));
}

export function computePhysicalScale(preset: MpDevicePreset, monitorCssPpi: number): number {
  const raw = monitorCssPpi / getMpDeviceCssPpi(preset);
  return Math.min(MP_CUSTOM_SCALE_MAX / 100, Math.max(MP_CUSTOM_SCALE_MIN / 100, raw));
}

export function readRuntimeMonitorCssPpi(): number {
  if (typeof window === "undefined" || !window.screen) return 110;
  return estimateMonitorCssPpi(
    window.screen.width,
    window.screen.height,
    window.devicePixelRatio || 1,
  );
}

function freshState() {
  return structuredClone({
    button: {
      label: t({ zh: "保存研究记录", en: "Save research note" }),
      variant: "filled" as "filled" | "tinted" | "outlined" | "text",
      severity: "primary" as "primary" | "secondary" | "danger" | "contrast",
      size: "md" as "sm" | "md" | "lg",
      fluid: true,
      disabled: false,
      loading: false,
    },
    navbar: {
      showBack: false,
      railMode: "split" as "tabs" | "split" | "composer",
      showBadges: false,
      message: "",
    },
    cell: { grouped: true, showLead: false, clickable: true, arrow: true, selected: false, disabled: false },
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

const initialMonitorCssPpi = readRuntimeMonitorCssPpi();

export const mpSim = reactive({
  activeSlug: "installation" as MpPageSlug,
  theme: "light" as "light" | "dark",
  deviceId: "iphone-18-pro" as MpDeviceId,
  orientation: "portrait" as MpOrientation,
  width: 402 as number,
  height: 874 as number,
  scaleMode: "fit" as MpScaleMode,
  customScalePercent: 100 as number,
  monitorCssPpi: initialMonitorCssPpi,
  effectiveScale: computePhysicalScale(MP_DEVICE_PRESETS[0], initialMonitorCssPpi),
  longContent: false,
  debugTouch: false,
  ...freshState(),
});

export function clampMpScalePercent(percent: number): number {
  if (!Number.isFinite(percent)) return 100;
  return Math.min(MP_CUSTOM_SCALE_MAX, Math.max(MP_CUSTOM_SCALE_MIN, Math.round(percent)));
}

function syncNominalEffectiveScale(): void {
  if (mpSim.scaleMode === "1:1") {
    mpSim.effectiveScale = computePhysicalScale(getMpDevicePreset(mpSim.deviceId), mpSim.monitorCssPpi);
  } else if (mpSim.scaleMode === "custom") {
    mpSim.effectiveScale = mpSim.customScalePercent / 100;
  }
}

export function setMpScaleMode(mode: MpScaleMode): void {
  if (mode === "custom" && mpSim.scaleMode !== "custom") {
    mpSim.customScalePercent = clampMpScalePercent(mpSim.effectiveScale * 100);
  }
  mpSim.scaleMode = mode;
  syncNominalEffectiveScale();
}

export function setMpCustomScalePercent(percent: number): void {
  mpSim.customScalePercent = clampMpScalePercent(percent);
  mpSim.scaleMode = "custom";
  syncNominalEffectiveScale();
}

function syncMpViewport(): void {
  const preset = getMpDevicePreset(mpSim.deviceId);
  if (mpSim.orientation === "landscape") {
    mpSim.width = preset.height;
    mpSim.height = preset.width;
  } else {
    mpSim.width = preset.width;
    mpSim.height = preset.height;
  }
  syncNominalEffectiveScale();
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
