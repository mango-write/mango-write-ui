<script setup lang="ts">
import { RouterLink } from "vue-router";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import CodeBlock from "../../kit/CodeBlock.vue";
import { installSteps, libraryIntro } from "../../content";
</script>

<template>
  <DocPage :lead="libraryIntro">
    <DocSection
      v-for="step in installSteps"
      :key="step.title"
      :title="step.title"
      :desc="step.desc"
    >
      <CodeBlock :code="step.code" />
    </DocSection>

    <DocSection title="下一步">
      <ul class="doc-links">
        <li>
          <RouterLink to="/foundations/overview">设计原则</RouterLink>
          <span>— 先读懂纸与霜的取舍,再动手。</span>
        </li>
        <li>
          <RouterLink to="/components/button">按钮 Button</RouterLink>
          <span>— 50+ 组件从它开始,每页附可复制的示例代码。</span>
        </li>
        <li>
          <a href="/llms-full.txt">llms-full.txt</a>
          <span>— 整库文档单文件,可直接投喂 AI 编码助手。</span>
        </li>
      </ul>
    </DocSection>
  </DocPage>
</template>
