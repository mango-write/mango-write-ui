<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { SelectButton } from "@mango-write/ui-vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import CodeBlock from "../../kit/CodeBlock.vue";
import { installSteps, libraryIntro, reactInstallSteps, reactLibraryIntro } from "../../content";
import { FRAMEWORK_OPTIONS, desktopFramework, setDesktopFramework, type DesktopFramework } from "../../framework";
import { t } from "../../i18n";

const activeIntro = computed(() =>
  desktopFramework.value === "react" ? reactLibraryIntro : libraryIntro,
);
const activeSteps = computed(() =>
  desktopFramework.value === "react" ? reactInstallSteps : installSteps,
);
const frameworkOptions = FRAMEWORK_OPTIONS.map((item) => ({ ...item }));

function onFrameworkChange(next: unknown) {
  if (next === "vue" || next === "react") {
    setDesktopFramework(next as DesktopFramework);
  }
}

const s = {
  frameworkLabel: { zh: "目标框架", en: "Target framework" },
  frameworkHint: {
    zh: "切换后全站桌面组件预览、受控属性提示与复制代码同步联动。",
    en: "Switching syncs live previews, controlled prop hints, and copied snippets across all desktop component pages.",
  },
  next: { zh: "下一步", en: "Next steps" },
  overview: { zh: "设计原则", en: "Principles" },
  overviewHint: { zh: "— 先读懂纸与霜的取舍,再动手。", en: "— Read the Paper & Frost tradeoffs before building." },
  button: { zh: "按钮", en: "Button" },
  buttonHint: {
    zh: "— 50+ 组件从它开始,每页附完整用法与状态矩阵。",
    en: "— The first of 50+ components; every page pairs usage with a full state matrix.",
  },
  llmsHint: {
    zh: "— 整库文档单文件,可直接投喂 AI 编码助手。",
    en: "— The whole library as one file, ready to feed an AI coding assistant.",
  },
} as const;
</script>

<template>
  <DocPage :lead="activeIntro">
    <div class="install-fw mw-group-card">
      <div class="install-fw__copy">
        <span class="install-fw__title">{{ t(s.frameworkLabel) }}</span>
        <span class="install-fw__hint">{{ t(s.frameworkHint) }}</span>
      </div>
      <SelectButton
        size="sm"
        :model-value="desktopFramework"
        :options="frameworkOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        :aria-label="t(s.frameworkLabel)"
        @update:model-value="onFrameworkChange"
      />
    </div>

    <DocSection
      v-for="step in activeSteps"
      :key="`${desktopFramework}-${step.title.zh}`"
      :title="step.title"
      :desc="step.desc"
    >
      <CodeBlock :code="step.code" />
    </DocSection>

    <DocSection :title="s.next">
      <ul class="doc-links">
        <li>
          <RouterLink to="/foundations/overview">{{ t(s.overview) }}</RouterLink>
          <span>{{ t(s.overviewHint) }}</span>
        </li>
        <li>
          <RouterLink to="/components/button">{{ t(s.button) }} Button</RouterLink>
          <span>{{ t(s.buttonHint) }}</span>
        </li>
        <li>
          <a href="/llms-full.txt">llms-full.txt</a>
          <span>{{ t(s.llmsHint) }}</span>
        </li>
      </ul>
    </DocSection>
  </DocPage>
</template>

<style scoped>
.install-fw {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
}

.install-fw__copy {
  display: flex;
  flex-direction: column;
  gap: var(--space-0-5);
  min-width: 0;
}

.install-fw__title {
  color: var(--text-primary);
  font-size: var(--type-body-sm-size);
  font-weight: var(--weight-semibold);
}

.install-fw__hint {
  color: var(--text-secondary);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
}
</style>
