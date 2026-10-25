<script setup lang="ts">
// Shared image lightbox: a full-screen viewer for inspecting a single image at
// large size with zoom / rotate / pan. Used by the Reader figure renderer and
// available to any other surface (e.g. the Writer figure node view) that wants
// "click to enlarge" without re-implementing the overlay. Intentionally
// self-contained (no PrimeVue Dialog) — it's a media viewer, not a form dialog.
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { RotateCw, RotateCcw, X, ZoomIn, ZoomOut, Maximize } from "lucide-vue-next";

const { t } = useI18n();

const props = defineProps<{
  visible: boolean;
  src: string;
  alt?: string;
  caption?: string | null;
}>();

const emit = defineEmits<{ (event: "update:visible", value: boolean): void }>();

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

function onKey(event: KeyboardEvent) {
  if (event.key === "Escape") close();
  else if (event.key === "+" || event.key === "=") zoomBy(1.2);
  else if (event.key === "-") zoomBy(1 / 1.2);
}

// Reset transforms each time the viewer opens; bind/unbind the global Esc key.
watch(
  () => props.visible,
  (open) => {
    if (open) {
      reset();
      window.addEventListener("keydown", onKey);
    } else {
      window.removeEventListener("keydown", onKey);
    }
  },
);

onBeforeUnmount(() => window.removeEventListener("keydown", onKey));
</script>

<template>
  <Teleport to="body">
    <Transition name="mw-lightbox">
      <div
        v-if="visible"
        class="mw-lightbox"
        role="dialog"
        aria-modal="true"
        @click.self="close"
      >
        <div class="mw-lightbox__toolbar" @click.stop>
          <button type="button" @click="zoomBy(1.2)" :aria-label="t('common.lightbox.zoomIn')">
            <ZoomIn :size="18" />
          </button>
          <button type="button" @click="zoomBy(1 / 1.2)" :aria-label="t('common.lightbox.zoomOut')">
            <ZoomOut :size="18" />
          </button>
          <button type="button" @click="rotate(-90)" :aria-label="t('common.lightbox.rotateLeft')">
            <RotateCcw :size="18" />
          </button>
          <button type="button" @click="rotate(90)" :aria-label="t('common.lightbox.rotateRight')">
            <RotateCw :size="18" />
          </button>
          <button type="button" @click="reset" :aria-label="t('common.lightbox.reset')">
            <Maximize :size="18" />
          </button>
          <span class="mw-lightbox__divider" />
          <button type="button" @click="close" :aria-label="t('common.action.close')">
            <X :size="18" />
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
  z-index: var(--z-scrim);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgb(15 15 15 / 0.82);
  backdrop-filter: blur(4px);
}

.mw-lightbox__toolbar {
  position: absolute;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px;
  border-radius: var(--radius-pill, 999px);
  background: rgb(38 38 38 / 0.9);
  box-shadow: var(--shadow-lg);
}

.mw-lightbox__toolbar button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: rgb(229 229 229);
  cursor: pointer;
  transition: background 0.12s ease;
}

.mw-lightbox__toolbar button:hover {
  background: rgb(255 255 255 / 0.14);
  color: #fff;
}

.mw-lightbox__divider {
  width: 1px;
  height: 20px;
  margin: 0 4px;
  background: rgb(255 255 255 / 0.18);
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
  transition: transform 0.08s ease-out;
  user-select: none;
  -webkit-user-drag: none;
}

.mw-lightbox__img:active {
  cursor: grabbing;
}

.mw-lightbox__caption {
  max-width: min(92vw, 720px);
  margin: 0 0 24px;
  padding: 8px 16px;
  color: rgb(212 212 212);
  font-family: var(--font-family-sans);
  font-size: 13px;
  line-height: 1.5;
  text-align: center;
}

.mw-lightbox-enter-active,
.mw-lightbox-leave-active {
  transition: opacity 0.16s ease;
}
.mw-lightbox-enter-from,
.mw-lightbox-leave-to {
  opacity: 0;
}
</style>
