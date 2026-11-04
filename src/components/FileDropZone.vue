<script setup lang="ts">
// 文件放置区：拖入或点击选择，两条路都归一成 File[] 从 files 事件出去。
// 类型/大小过滤、上传与后续流程归消费方。bare/plain 用于无框嵌入场景。
// 拖拽事件在本地终止，嵌套放置区不会重复接收同一份文件。
import { computed, ref } from "vue";

const props = withDefaults(
  defineProps<{
    /** 透传给隐藏 file input 的 accept（如 ".zip,application/zip"）。 */
    accept?: string;
    multiple?: boolean;
    /** solid = 页面 / 对话框里的控件面；inlay = 霜面或分组内的半透明内嵌面。 */
    surface?: "solid" | "inlay";
    /** 裸条档：配合消费方自定布局（横向单行），仅保留拖/点行为与 over 反馈。 */
    bare?: boolean;
    /** 无框档：纵向布局不变，去掉虚线框与底色（嵌入更大的岛内时用）。 */
    plain?: boolean;
    disabled?: boolean;
    ariaLabel?: string;
  }>(),
  { accept: undefined, multiple: false, surface: "solid", bare: false, plain: false, disabled: false, ariaLabel: undefined },
);

const framed = computed(() => !props.bare && !props.plain);

const emit = defineEmits<{ (e: "files", files: File[]): void }>();

const isOver = ref(false);
const input = ref<HTMLInputElement | null>(null);
// dragenter/leave 进出子元素会成对触发，按嵌套深度计数才不会闪烁。
let depth = 0;

function isFileDrag(event: DragEvent): boolean {
  return !props.disabled && Array.from(event.dataTransfer?.types ?? []).includes("Files");
}

function onDragEnter(event: DragEvent) {
  if (!isFileDrag(event)) return;
  event.preventDefault();
  event.stopPropagation();
  depth += 1;
  isOver.value = true;
}

function onDragOver(event: DragEvent) {
  if (!isFileDrag(event)) return;
  event.preventDefault();
  event.stopPropagation();
}

function onDragLeave(event: DragEvent) {
  if (depth === 0) return;
  event.stopPropagation();
  depth = Math.max(0, depth - 1);
  if (depth === 0) isOver.value = false;
}

function onDrop(event: DragEvent) {
  event.preventDefault();
  event.stopPropagation();
  depth = 0;
  isOver.value = false;
  if (props.disabled) return;
  const files = Array.from(event.dataTransfer?.files ?? []);
  if (files.length > 0) emit("files", files);
}

function pick() {
  if (!props.disabled) input.value?.click();
}

function onPicked(event: Event) {
  if (props.disabled) return;
  const files = Array.from((event.target as HTMLInputElement).files ?? []);
  // 清空让 input 允许重选同一个文件。
  (event.target as HTMLInputElement).value = "";
  if (files.length > 0) emit("files", files);
}
</script>

<template>
  <div
    class="mw-filedrop"
    :class="[
      bare ? 'mw-filedrop--bare' : framed ? 'mw-filedrop--framed' : 'mw-filedrop--plain',
      framed ? `mw-filedrop--${surface}` : '',
      isOver ? 'mw-filedrop--over' : '',
      disabled ? 'mw-filedrop--disabled' : '',
    ]"
    role="button"
    :tabindex="disabled ? -1 : 0"
    :aria-disabled="disabled"
    :aria-label="ariaLabel"
    @click="pick"
    @keydown.enter.prevent="pick"
    @keydown.space.prevent="pick"
    @dragover="onDragOver"
    @dragenter="onDragEnter"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <slot />
    <input
      ref="input"
      type="file"
      class="mw-filedrop__input"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      @click.stop
      @change="onPicked"
    />
  </div>
</template>

<style scoped>
.mw-filedrop {
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: var(--radius-card);
  color: var(--text-secondary);
  text-align: center;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    border-color var(--duration-fast) var(--ease-standard),
    outline-color var(--duration-fast) var(--ease-standard);
}

.mw-filedrop--bare {
  flex-direction: row;
  gap: var(--space-1-5);
  text-align: start;
}

.mw-filedrop--framed {
  border: var(--border-width) dashed var(--border-strong);
}

.mw-filedrop--solid {
  background-color: var(--control-bg);
}

.mw-filedrop--inlay {
  background-color: var(--fill-subtle);
}

.mw-filedrop--framed:hover:not(.mw-filedrop--disabled) {
  border-color: var(--text-tertiary);
  background-color: var(--fill-default);
}

.mw-filedrop:focus-visible {
  outline: var(--focus-width) solid var(--focus-color);
  outline-offset: var(--focus-offset);
}

.mw-filedrop--over,
.mw-filedrop--framed.mw-filedrop--over:hover {
  border-color: var(--accent);
  background-color: var(--accent-subtle);
  color: var(--text-primary);
}

/* 无框档没有 border 可换色，over 用内收虚线 outline 亮起（outline 不参与布局）。 */
.mw-filedrop--bare.mw-filedrop--over,
.mw-filedrop--plain.mw-filedrop--over {
  outline: var(--border-width) dashed var(--accent);
  outline-offset: calc(-1 * var(--space-1));
}

.mw-filedrop--disabled {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
}

.mw-filedrop__input {
  display: none;
}

@media (prefers-reduced-motion: reduce) {
  .mw-filedrop {
    transition: none;
  }
}
</style>
