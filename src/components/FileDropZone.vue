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
    /** solid = 实底（页面/普通对话框）；inlay = 玻璃浮层内嵌材质（mw-inlay）。 */
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
      'tw:flex tw:cursor-pointer tw:rounded-lg tw:text-center tw:transition-colors',
      bare
        ? 'tw:flex-row tw:items-center tw:gap-1.5 tw:text-left'
        : framed
          ? 'tw:flex-col tw:items-center tw:border-2 tw:border-dashed'
          : 'tw:flex-col tw:items-center',
      framed
        ? surface === 'inlay'
          ? 'mw-inlay'
          : isOver
            ? 'tw:bg-primary-50'
            : 'tw:bg-surface'
        : '',
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
      class="tw:hidden"
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
  border-color: var(--color-border-subtle);
}
.mw-filedrop--over {
  border-color: var(--color-brand-500);
}
.mw-filedrop--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
/* 无框档（bare/plain）没有 border 可换色，over 用 outline + 底色亮起（outline 不参与布局）。 */
.mw-filedrop--over.bare,
.mw-filedrop--over.plain {
  background: var(--color-brand-50);
  outline: 1.5px dashed var(--color-brand-500);
  outline-offset: -3px;
}
/* mw-inlay 的 1px 实线 border 简写是未分层规则，会盖过 tw: 工具类，虚线厚度在这钉回。 */
.mw-filedrop.mw-inlay {
  border-style: dashed;
  border-width: 2px;
}
</style>
