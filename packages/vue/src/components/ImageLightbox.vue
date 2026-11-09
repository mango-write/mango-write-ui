<script setup lang="ts">
// 图片灯箱：全屏查看单张图片（缩放 / 旋转 / 拖动）。是媒体查看器而不是表单对话框，
// 固定暗场（--lightbox-*），不随主题翻转。
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { RotateCw, RotateCcw, X, ZoomIn, ZoomOut, Maximize } from "lucide-vue-next";
import { useOverlayLayer } from "../lib/overlay-layer.js";

const { t } = useI18n();

const props = defineProps<{
  visible: boolean;
  src: string;
  alt?: string;
  caption?: string | null;
}>();

const emit = defineEmits<{ (event: "update:visible", value: boolean): void }>();

const layer = useOverlayLayer(() => props.visible);
const lightboxStyle = computed(() =>
  layer.layerZ.value ? { zIndex: layer.layerZ.value } : undefined,
);

const MIN_SCALE = 0.2;
const MAX_SCALE = 8;

const scale = ref(1);
const rotation = ref(0); // degrees, multiples of 90
const translate = ref({ x: 0, y: 0 });

const transform = computed(
  () =>
    `translate(${translate.value.x}px, ${translate.value.y}px) scale(${scale.value}) rotate(${rotation.value}deg)`,
);

function reset() {
  scale.value = 1;
  rotation.value = 0;
  translate.value = { x: 0, y: 0 };
}

function close() {
  emit("update:visible", false);
}

function zoomBy(factor: number) {
  scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale.value * factor));
}

function rotate(delta: number) {
  rotation.value = (rotation.value + delta) % 360;
}

function onWheel(event: WheelEvent) {
  event.preventDefault();
  zoomBy(event.deltaY < 0 ? 1.15 : 1 / 1.15);
}

// ── Drag to pan
let dragStart: { x: number; y: number; tx: number; ty: number } | null = null;

function onPointerDown(event: PointerEvent) {
  dragStart = {
    x: event.clientX,
    y: event.clientY,
    tx: translate.value.x,
    ty: translate.value.y,
  };
  (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
}

function onPointerMove(event: PointerEvent) {
  if (!dragStart) return;
  translate.value = {
    x: dragStart.tx + (event.clientX - dragStart.x),
    y: dragStart.ty + (event.clientY - dragStart.y),
  };
}

function onPointerUp() {
  dragStart = null;
}

const dialogRef = ref<HTMLElement | null>(null);
const closeButtonRef = ref<HTMLButtonElement | null>(null);
let previousActive: HTMLElement | null = null;
let previousOverflow = "";
let scrollLocked = false;

function toolbarButtons(): HTMLButtonElement[] {
  return Array.from(dialogRef.value?.querySelectorAll<HTMLButtonElement>("button:not([disabled])") ?? []);
}

function onKey(event: KeyboardEvent) {
  if (event.key === "Tab") {
    const buttons = toolbarButtons();
    const first = buttons[0];
    const last = buttons.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.value)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.value)) {
      event.preventDefault();
      first.focus();
    }
    return;
  }
  if (event.key === "Escape") close();
  else if (event.key === "+" || event.key === "=") zoomBy(1.2);
  else if (event.key === "-") zoomBy(1 / 1.2);
}

function openViewer() {
  reset();
  previousActive = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  scrollLocked = true;
  window.addEventListener("keydown", onKey);
  nextTick(() => closeButtonRef.value?.focus());
}

function closeViewer() {
  window.removeEventListener("keydown", onKey);
  if (scrollLocked) {
    document.body.style.overflow = previousOverflow;
    scrollLocked = false;
    previousActive?.focus();
    previousActive = null;
  }
}

watch(
  () => props.visible,
  (open) => {
    if (open) openViewer();
    else closeViewer();
  },
  { immediate: true },
);

onBeforeUnmount(closeViewer);
</script>

<template>
  <Teleport to="body">
    <Transition name="mw-lightbox">
      <div
        v-if="visible"
        ref="dialogRef"
        class="mw-lightbox"
        role="dialog"
        aria-modal="true"
        :aria-label="caption ?? alt ?? t('common.lightbox.imageAlt')"
        :style="lightboxStyle"
        tabindex="-1"
        @click.self="close"
      >
        <div class="mw-lightbox__toolbar" @click.stop>
          <button type="button" @click="zoomBy(1.2)" :aria-label="t('common.lightbox.zoomIn')">
            <ZoomIn :size="18" aria-hidden="true" />
          </button>
          <button type="button" @click="zoomBy(1 / 1.2)" :aria-label="t('common.lightbox.zoomOut')">
            <ZoomOut :size="18" aria-hidden="true" />
          </button>
          <button type="button" @click="rotate(-90)" :aria-label="t('common.lightbox.rotateLeft')">
            <RotateCcw :size="18" aria-hidden="true" />
          </button>
          <button type="button" @click="rotate(90)" :aria-label="t('common.lightbox.rotateRight')">
            <RotateCw :size="18" aria-hidden="true" />
          </button>
          <button type="button" @click="reset" :aria-label="t('common.lightbox.reset')">
            <Maximize :size="18" aria-hidden="true" />
          </button>
          <span class="mw-lightbox__divider" aria-hidden="true" />
          <button ref="closeButtonRef" type="button" @click="close" :aria-label="t('common.action.close')">
            <X :size="18" aria-hidden="true" />
          </button>
        </div>

        <div class="mw-lightbox__stage" @click.self="close" @wheel="onWheel">
          <img
            class="mw-lightbox__img"
            :src="src"
            :alt="alt ?? t('common.lightbox.imageAlt')"
            :style="{ transform }"
            draggable="false"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointercancel="onPointerUp"
          />
        </div>

        <figcaption v-if="caption" class="mw-lightbox__caption" @click.stop>
          {{ caption }}
        </figcaption>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.mw-lightbox {
  position: fixed;
  inset: 0;
  z-index: var(--z-overlay);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--lightbox-scrim);
}

.mw-lightbox__toolbar {
  position: absolute;
  top: var(--space-4);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1);
  border: var(--border-width) solid var(--lightbox-divider);
  border-radius: var(--radius-full);
  background: var(--lightbox-toolbar);
  box-shadow: var(--shadow-overlay);
}

.mw-lightbox__toolbar button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--size-lg-h);
  height: var(--size-lg-h);
  padding: 0;
  border: 0;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--lightbox-text);
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-standard);
}

.mw-lightbox__toolbar button :deep(svg) {
  width: var(--icon-lg);
  height: var(--icon-lg);
}

.mw-lightbox__toolbar button:hover {
  background: var(--lightbox-hover);
}

.mw-lightbox__toolbar button:focus-visible {
  outline: var(--focus-width) solid var(--lightbox-text);
  outline-offset: var(--focus-offset);
}

.mw-lightbox__divider {
  width: var(--border-width);
  height: var(--icon-xl);
  margin: 0 var(--space-1);
  background: var(--lightbox-divider);
}

.mw-lightbox__stage {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.mw-lightbox__img {
  max-width: 92vw;
  max-height: 82vh;
  object-fit: contain;
  cursor: grab;
  transition: transform var(--duration-fast) var(--ease-standard);
  user-select: none;
  -webkit-user-drag: none;
}

.mw-lightbox__img:active {
  cursor: grabbing;
}

.mw-lightbox__caption {
  max-width: min(92vw, var(--container-prose));
  margin: 0 0 var(--space-6);
  padding: var(--space-2) var(--space-4);
  color: var(--lightbox-text-muted);
  font-family: var(--font-sans);
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
  text-align: center;
}

.mw-lightbox-enter-active {
  transition: opacity var(--duration-base) var(--ease-enter);
}

.mw-lightbox-leave-active {
  transition: opacity var(--duration-fast) var(--ease-exit);
}

.mw-lightbox-enter-from,
.mw-lightbox-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .mw-lightbox__img,
  .mw-lightbox__toolbar button {
    transition: none;
  }
}
</style>
