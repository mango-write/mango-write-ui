<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import { Code2, Copy, RotateCcw, SlidersHorizontal } from "lucide-vue-next";
import { Button } from "@mango-write/ui-vue";
import { isMpPageChanged, type MpPageSlug, resetMpPageState } from "../mobile-demos/state";
import { t } from "../i18n";
import CodeBlock from "./CodeBlock.vue";

const props = withDefaults(
  defineProps<{
    slug: MpPageSlug;
    code: string;
    defaultShowConfig?: boolean;
    defaultShowCode?: boolean;
  }>(),
  {
    defaultShowConfig: true,
    defaultShowCode: false,
  },
);
const showConfig = ref(props.defaultShowConfig);
const showCode = ref(props.defaultShowCode);
const changed = computed(() => isMpPageChanged(props.slug));
const copied = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

async function copyCode(): Promise<void> {
  try {
    await navigator.clipboard.writeText(props.code);
  } catch {
    return;
  }
  copied.value = true;
  clearTimeout(timer);
  timer = setTimeout(() => {
    copied.value = false;
  }, 1600);
}
onBeforeUnmount(() => clearTimeout(timer));

const s = {
  hideConfig: { zh: "收起配置", en: "Hide options" },
  showConfig: { zh: "调整配置", en: "Customize" },
  reset: { zh: "重置", en: "Reset" },
  copy: { zh: "复制代码", en: "Copy code" },
  copied: { zh: "已复制", en: "Copied" },
  hideCode: { zh: "隐藏源码", en: "Hide code" },
  viewCode: { zh: "查看源码", en: "View code" },
  codeTitle: { zh: "生成的代码", en: "Generated code" },
} as const;
</script>

<template>
  <figure class="mp-cfg">
    <div v-if="$slots.default && showConfig" class="mp-cfg__grid">
      <slot />
    </div>
    <div class="mp-cfg__bar">
      <div class="mp-cfg__bar-group">
        <Button
          v-if="$slots.default"
          variant="text"
          severity="secondary"
          size="sm"
          :icon="SlidersHorizontal"
          :label="showConfig ? t(s.hideConfig) : t(s.showConfig)"
          @click="showConfig = !showConfig"
        />
        <Button
          v-if="$slots.default"
          variant="text"
          severity="secondary"
          size="sm"
          :icon="RotateCcw"
          :label="t(s.reset)"
          :disabled="!changed"
          @click="resetMpPageState(slug)"
        />
        <slot name="actions" />
      </div>
      <div class="mp-cfg__bar-group">
        <Button
          variant="text"
          severity="secondary"
          size="sm"
          :icon="Copy"
          :label="copied ? t(s.copied) : t(s.copy)"
          @click="copyCode"
        />
        <Button
          variant="text"
          severity="secondary"
          size="sm"
          :icon="Code2"
          :label="showCode ? t(s.hideCode) : t(s.viewCode)"
          @click="showCode = !showCode"
        />
      </div>
    </div>
    <div v-if="showCode" class="mp-cfg__code">
      <CodeBlock :code="code" :title="t(s.codeTitle)" />
    </div>
  </figure>
</template>

<style scoped>
.mp-cfg {
  margin: 0;
  border: var(--border-width) solid var(--border-subtle);
  border-radius: var(--radius-card);
  background: var(--bg-surface);
  overflow: hidden;
}

.mp-cfg__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 210px), 1fr));
  gap: var(--space-3) var(--space-4);
  padding: var(--space-4);
  background: var(--bg-sunken);
  border-bottom: var(--border-width) solid var(--border-subtle);
}

.mp-cfg__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
}

.mp-cfg__bar-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-1);
  min-width: 0;
}

.mp-cfg__code {
  padding: var(--space-2);
  border-top: var(--border-width) solid var(--border-subtle);
}
</style>
