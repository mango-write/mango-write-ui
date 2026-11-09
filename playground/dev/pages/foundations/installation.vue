<script setup lang="ts">
import { RouterLink } from "vue-router";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import CodeBlock from "../../kit/CodeBlock.vue";
import { installSteps, libraryIntro } from "../../content";
import { t } from "../../i18n";

const s = {
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
  <DocPage :lead="libraryIntro">
    <DocSection
      v-for="step in installSteps"
      :key="step.title.zh"
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
