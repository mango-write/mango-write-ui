<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useThemePreference } from "@mango-write/ui-vue";
import { MpThemeProvider, provideMpConfirm, provideMpNotify } from "@mango-write/ui-mp";
import { mobilePreviews } from "../mobile-demos/registry";
import { getMpDevicePreset, mpSim } from "../mobile-demos/state";
import { t } from "../i18n";

provideMpConfirm();
provideMpNotify();
const { resolved } = useThemePreference();
watch(
  resolved,
  (value) => {
    if (value === "light" || value === "dark") mpSim.theme = value;
  },
  { immediate: true },
);

const s = {
  aria: { zh: "移动端 1:1 真实机型预览", en: "Mobile 1:1 device preview" },
} as const;

const activeDevice = computed(() => getMpDevicePreset(mpSim.deviceId));

const stageRef = ref<HTMLElement | null>(null);
const stageSize = ref({ width: 0, height: 0 });
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  if (!stageRef.value || typeof ResizeObserver === "undefined") return;
  resizeObserver = new ResizeObserver((entries) => {
    const rect = entries[0]?.contentRect;
    if (!rect) return;
    stageSize.value = { width: rect.width, height: rect.height };
  });
  resizeObserver.observe(stageRef.value);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});

const BEZEL_FRAME = 6;
const outerWidth = computed(() => mpSim.width + BEZEL_FRAME * 2);
const outerHeight = computed(() => mpSim.height + BEZEL_FRAME * 2);

const dockStyle = computed(() => ({
  width: `${Math.max(448, outerWidth.value + 16)}px`,
}));

const fitScale = computed(() => {
  const availW = stageSize.value.width - 8;
  const availH = stageSize.value.height - 8;
  if (availW <= 0 || availH <= 0) return 1;
  if (mpSim.scaleMode === "1:1") {
    return availW < outerWidth.value ? Math.min(1, availW / outerWidth.value) : 1;
  }
  return Math.min(1, availW / outerWidth.value, availH / outerHeight.value);
});

const frameWrapperStyle = computed(() => {
  const scale = fitScale.value;
  return {
    width: `${Math.round(outerWidth.value * scale)}px`,
    height: `${Math.round(outerHeight.value * scale)}px`,
  };
});

const phoneStyle = computed(() => ({
  width: `${outerWidth.value}px`,
  height: `${outerHeight.value}px`,
  transform: fitScale.value < 1 ? `scale(${fitScale.value.toFixed(4)})` : undefined,
  transformOrigin: "top center",
}));

const viewportStyle = computed(() => ({
  width: `${mpSim.width}px`,
  height: `${mpSim.height}px`,
}));

const statusbarStyle = computed(() => ({
  height: `${mpSim.orientation === "landscape" ? Math.min(activeDevice.value.safeTop, 28) : activeDevice.value.safeTop}px`,
}));

const homeBarStyle = computed(() => ({
  height: `${mpSim.orientation === "landscape" ? Math.min(activeDevice.value.safeBottom, 16) : activeDevice.value.safeBottom}px`,
}));

const creaseAxis = computed<"horizontal" | "vertical" | null>(() => {
  if (activeDevice.value.formFactor === "wide-fold") {
    return mpSim.orientation === "portrait" ? "horizontal" : "vertical";
  }
  if (activeDevice.value.formFactor === "book-fold") {
    return mpSim.orientation === "portrait" ? "vertical" : "horizontal";
  }
  return null;
});

const activePreview = computed(() => mobilePreviews[mpSim.activeSlug]);
</script>

<template>
  <aside class="mp-dock" :style="dockStyle" :aria-label="t(s.aria)">
    <div
      ref="stageRef"
      class="mp-dock__stage"
      :class="{ 'mp-dock__stage--fit': mpSim.scaleMode === 'fit' }"
    >
      <div class="mp-phone-holder" :style="frameWrapperStyle">
        <div
          class="mp-phone"
          :class="[
            `mp-phone--${activeDevice.os}`,
            `mp-phone--${activeDevice.formFactor}`,
            `mp-phone--${mpSim.orientation}`,
            { 'mp-phone--debug': mpSim.debugTouch },
          ]"
          :data-device="activeDevice.id"
          :data-form-factor="activeDevice.formFactor"
          :data-orientation="mpSim.orientation"
          :data-theme="mpSim.theme"
          :style="phoneStyle"
        >
          <div class="mp-phone__viewport" :style="viewportStyle">
            <span
              v-if="creaseAxis"
              class="mp-phone__crease"
              :class="`mp-phone__crease--${creaseAxis}`"
              aria-hidden="true"
            />
            <div class="mp-phone__statusbar" :style="statusbarStyle" aria-hidden="true">
              <span class="mp-phone__time">09:41</span>
              <span
                v-if="activeDevice.cutout !== 'none' && mpSim.orientation === 'portrait'"
                class="mp-phone__cutout"
                :class="`mp-phone__cutout--${activeDevice.cutout}`"
              />
              <span v-else />
              <span class="mp-phone__status-right">{{ activeDevice.aspect }} · 5G</span>
            </div>
            <div class="mp-phone__screen">
              <MpThemeProvider
                :theme="mpSim.theme"
                :viewport-width="mpSim.width"
                :viewport-height="mpSim.height"
                safe-top="0px"
                safe-bottom="0px"
                class="mp-theme"
              >
                <component :is="activePreview" />
              </MpThemeProvider>
            </div>
            <div class="mp-phone__home-bar" :style="homeBarStyle" aria-hidden="true">
              <span class="mp-phone__home-indicator" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.mp-dock {
  flex: none;
  width: 448px;
  max-width: 64vw;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  transition: width var(--duration-base) var(--ease-standard);
}

.mp-dock__stage {
  flex: 1;
  min-height: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow: auto;
  padding: var(--space-1) 0 var(--space-2);
}

.mp-dock__stage--fit {
  align-items: center;
  overflow: hidden;
}

.mp-phone-holder {
  flex: none;
  position: relative;
  display: flex;
  justify-content: center;
}

.mp-phone {
  flex: none;
  box-sizing: border-box;
  padding: 6px;
  background: var(--bg-inverse);
  border: var(--border-width) solid var(--border-strong);
  border-radius: 50px;
  box-shadow: var(--shadow-overlay);
  position: relative;
}

.mp-phone--android {
  border-radius: 34px;
}

.mp-phone--book-fold {
  border-radius: 40px;
}

.mp-phone__viewport {
  display: flex;
  flex-direction: column;
  background: var(--bg-canvas);
  border-radius: 44px;
  overflow: hidden;
  position: relative;
}

.mp-phone--android .mp-phone__viewport {
  border-radius: 28px;
}

.mp-phone--book-fold .mp-phone__viewport {
  border-radius: 34px;
}

.mp-phone__crease {
  position: absolute;
  z-index: 20;
  pointer-events: none;
}

.mp-phone__crease--horizontal {
  right: 0;
  left: 0;
  top: 50%;
  height: 2px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.14) 0%,
    rgba(15, 14, 13, 0.08) 100%
  );
}

.mp-phone__crease--vertical {
  top: 0;
  bottom: 0;
  left: 50%;
  width: 2px;
  background: linear-gradient(
    90deg,
    rgba(15, 14, 13, 0.08) 0%,
    rgba(255, 255, 255, 0.16) 50%,
    rgba(15, 14, 13, 0.06) 100%
  );
}

.mp-phone__statusbar {
  flex: none;
  padding: 0 var(--space-6);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  color: var(--text-primary);
  font-size: var(--type-caption-size);
  font-weight: var(--weight-semibold);
}

.mp-phone__time {
  justify-self: start;
}

.mp-phone__status-right {
  justify-self: end;
  font-size: var(--type-micro-size);
}

.mp-phone__cutout--island {
  width: 112px;
  height: 30px;
  border-radius: var(--radius-full);
  background: #0f0e0d;
}

.mp-phone__cutout--punch {
  width: 14px;
  height: 14px;
  border-radius: var(--radius-full);
  background: #0f0e0d;
}

.mp-phone__screen {
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
}

.mp-theme {
  position: relative;
  display: block;
  height: 100%;
  overflow: hidden;
}

.mp-phone__home-bar {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-canvas);
}

.mp-phone__home-indicator {
  width: 134px;
  height: 5px;
  border-radius: var(--radius-full);
  background: var(--text-tertiary);
  opacity: 0.65;
}

.mp-phone--android .mp-phone__home-indicator {
  width: 104px;
  height: 4px;
}

.mp-phone--debug :deep(button),
.mp-phone--debug :deep([role="button"]),
.mp-phone--debug :deep([role="switch"]) {
  outline: var(--border-width) dashed var(--accent);
  outline-offset: calc(0px - var(--border-width));
}

:deep(.mp-stage) {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

:deep(.mp-preview__scroll) {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

:deep(.mp-preview__pad) {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: 0 var(--mp-card-inset) calc(var(--mp-tabbar-h) + var(--space-6));
}

:deep(.mp-preview__with-action) {
  padding-bottom: calc(var(--mp-size-lg-h) + var(--space-16));
}

:deep(.mp-preview__row) {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}

:deep(.mp-preview__stack) {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

:deep(.mp-preview__center) {
  justify-content: center;
}

:deep(.mp-preview__conversation) {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

:deep(.mp-icon-grid) {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--space-4) var(--space-2);
}

:deep(.mp-icon-grid > span) {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: var(--space-1);
  color: var(--text-secondary);
}

:deep(.mp-icon-grid small) {
  max-width: 100%;
  overflow: hidden;
  font-size: var(--mp-type-caption-size);
  text-overflow: ellipsis;
}

@media (max-width: 1280px) {
  .mp-dock {
    max-width: 48vw;
  }
}

@media (max-width: 900px) {
  .mp-dock {
    width: 100% !important;
    max-width: 100%;
    height: auto;
  }
}
</style>
