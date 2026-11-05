<script setup lang="ts">
import { computed, ref } from "vue";
import { Button } from "../../src";
import { t, type Bi } from "../i18n";

const props = defineProps<{ code: string | Bi; title?: string | Bi }>();

// 双语示例里只翻注释与演示文案,代码本体两边一致;复制当前语言的版本。
const text = computed(() => t(props.code));

const s = {
  example: { zh: "示例", en: "Example" },
  copy: { zh: "复制", en: "Copy" },
  copied: { zh: "已复制", en: "Copied" },
} as const;

const copied = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

async function copy() {
  try {
    await navigator.clipboard.writeText(text.value);
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
      <span class="doc-snippet__title">{{ t(title ?? s.example) }}</span>
      <Button
        variant="text"
        severity="secondary"
        size="sm"
        :label="copied ? t(s.copied) : t(s.copy)"
        @click="copy"
      />
    </figcaption>
    <pre v-scroll-fade.sm class="doc-snippet__pre mw-scroll"><code>{{ text }}</code></pre>
  </figure>
</template>
