<script setup lang="ts">
import { ref } from "vue";
import { Button } from "../../src";

const props = defineProps<{ code: string; title?: string }>();

const copied = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

async function copy() {
  try {
    await navigator.clipboard.writeText(props.code);
  } catch {
    return; // 非安全上下文等剪贴板不可用场景,静默失败
  }
  copied.value = true;
  clearTimeout(timer);
  timer = setTimeout(() => (copied.value = false), 1600);
}
</script>

<template>
  <figure class="doc-snippet">
    <figcaption class="doc-snippet__head">
      <span class="doc-snippet__title">{{ title ?? "示例" }}</span>
      <Button
        variant="text"
        severity="secondary"
        size="sm"
        :label="copied ? '已复制' : '复制'"
        @click="copy"
      />
    </figcaption>
    <pre class="doc-snippet__pre"><code>{{ code }}</code></pre>
  </figure>
</template>
