<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useAttrs, watch } from "vue";
import {
  provideMpTheme,
  type ResolvedTheme,
  type ThemePreference,
} from "../lib/mp-theme.js";

defineOptions({
  name: "MwMpThemeProvider",
  inheritAttrs: true,
  options: {
    styleIsolation: "shared",
    virtualHost: true,
  },
} as any);
const attrs = useAttrs();

export interface MpThemeProviderProps {
  theme?: ThemePreference;
  systemDark?: boolean;
  debugHitArea?: boolean;
  safeTop?: string;
  safeBottom?: string;
  keyboardOffset?: string;
  viewportWidth?: number;
  viewportHeight?: number;
}

const props = withDefaults(defineProps<MpThemeProviderProps>(), {
  theme: "light",
  systemDark: false,
  debugHitArea: false,
  safeTop: undefined,
  safeBottom: undefined,
  keyboardOffset: undefined,
  viewportWidth: undefined,
  viewportHeight: undefined,
});

const emit = defineEmits<{
  "update:theme": [value: ThemePreference];
  "resolved-change": [value: ResolvedTheme];
}>();

const ctx = provideMpTheme(props.theme);

const runtimeWidth = ref<number | undefined>(undefined);
const runtimeHeight = ref<number | undefined>(undefined);

function syncRuntimeViewport(): void {
  const g = globalThis as any;
  if (typeof g.uni?.getWindowInfo === "function") {
    try {
      const info = g.uni.getWindowInfo();
      if (info?.windowWidth) runtimeWidth.value = info.windowWidth;
      if (info?.windowHeight) runtimeHeight.value = info.windowHeight;
      return;
    } catch {
      // ignore runtime probe failure
    }
  }
  if (typeof window !== "undefined" && window.innerWidth > 0) {
    runtimeWidth.value = window.innerWidth;
    runtimeHeight.value = window.innerHeight;
  }
}

onMounted(() => {
  if (props.viewportWidth === undefined || props.viewportHeight === undefined) {
    syncRuntimeViewport();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", syncRuntimeViewport, { passive: true });
    }
  }
});

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", syncRuntimeViewport);
  }
});

const effectiveWidth = computed(() => props.viewportWidth ?? runtimeWidth.value ?? 402);
const effectiveHeight = computed(() => props.viewportHeight ?? runtimeHeight.value ?? 874);

const isExpanded = computed(() => effectiveWidth.value >= 600);
const isShort = computed(() => effectiveHeight.value <= 740);
const orientation = computed<"portrait" | "landscape">(() =>
  effectiveWidth.value > effectiveHeight.value ? "landscape" : "portrait",
);

const viewportMode = computed<"compact" | "wide-short" | "expanded">(() => {
  if (isExpanded.value) return "expanded";
  if (isShort.value) return "wide-short";
  return "compact";
});

watch(
  () => props.theme,
  (val) => {
    if (val && val !== ctx.preference.value) {
      ctx.setTheme(val);
    }
  },
  { immediate: true },
);

watch(
  () => props.systemDark,
  (val) => {
    ctx.systemDark.value = Boolean(val);
  },
  { immediate: true },
);

watch(
  () => props.debugHitArea,
  (val) => {
    ctx.setDebugHitArea(Boolean(val));
  },
  { immediate: true },
);

watch(
  () => ctx.resolved.value,
  (val) => {
    emit("resolved-change", val);
  },
  { immediate: true },
);

const rootClasses = computed(() => [
  "mw-mp-root",
  `mw-theme-${ctx.resolved.value}`,
  {
    "mw-mp-debug-hit": ctx.debugHitArea.value,
    "mw-mp-root--expanded": isExpanded.value,
    "mw-mp-root--wide-short": isShort.value,
    "mw-mp-root--landscape": orientation.value === "landscape",
  },
]);

const rootStyle = computed(() => {
  const styles: Record<string, string> = {};
  if (props.safeTop !== undefined) styles["--mw-mp-safe-top"] = props.safeTop;
  if (props.safeBottom !== undefined) styles["--mw-mp-safe-bottom"] = props.safeBottom;
  if (props.keyboardOffset !== undefined) {
    styles["--mw-mp-keyboard-offset"] = props.keyboardOffset;
  }
  return styles;
});
</script>

<template>
  <div
    :data-testid="attrs['data-testid']"
    :class="rootClasses"
    :data-theme="ctx.resolved.value"
    :data-viewport-mode="viewportMode"
    :data-orientation="orientation"
    :style="[rootStyle, $attrs.style]"
  >
    <slot :theme="ctx.resolved.value" :set-theme="ctx.setTheme" :toggle-theme="ctx.toggleTheme" />
  </div>
</template>
