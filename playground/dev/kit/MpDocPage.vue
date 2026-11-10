<script setup lang="ts">
import DocPage from "./DocPage.vue";
import DocSection from "./DocSection.vue";
import MpConfigPanel from "./MpConfigPanel.vue";
import type { MpPageSlug } from "../mobile-demos/state";
import { t, type Bi } from "../i18n";

export interface MpApiRow {
  name: string;
  type: string;
  defaultValue?: string;
  description: Bi;
}

export interface MpGuidelineItem {
  kind?: "do" | "dont";
  zh: string;
  en: string;
}

defineProps<{
  slug: MpPageSlug;
  code: string;
  api: readonly MpApiRow[];
  guidelines: readonly MpGuidelineItem[];
}>();

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时联动右侧手机舞台预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options to update the phone preview in real time; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  api: { zh: "接口", en: "API" },
  name: { zh: "名称", en: "Name" },
  type: { zh: "取值", en: "Type" },
  defaultVal: { zh: "默认值", en: "Default" },
  desc: { zh: "说明", en: "Description" },
} as const;
</script>

<template>
  <DocPage>
    <DocSection v-if="$slots.default || $slots.actions" :title="s.demo" :desc="s.demoDesc">
      <MpConfigPanel :slug="slug" :code="code" :default-show-code="false">
        <slot />
        <template v-if="$slots.actions" #actions><slot name="actions" /></template>
      </MpConfigPanel>
    </DocSection>
    <slot name="sections" />
    <DocSection :title="s.whenToUse">
      <ul class="doc-rules">
        <li
          v-for="rule in guidelines"
          :key="rule.en"
          :data-kind="rule.kind ?? 'do'"
          v-html="t(rule)"
        />
      </ul>
    </DocSection>
    <DocSection :title="s.api">
      <table class="doc-table">
        <thead>
          <tr>
            <th>{{ t(s.name) }}</th>
            <th>{{ t(s.type) }}</th>
            <th>{{ t(s.defaultVal) }}</th>
            <th>{{ t(s.desc) }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in api" :key="row.name">
            <td><code>{{ row.name }}</code></td>
            <td><code>{{ row.type }}</code></td>
            <td><code>{{ row.defaultValue ?? "—" }}</code></td>
            <td>{{ t(row.description) }}</td>
          </tr>
        </tbody>
      </table>
    </DocSection>
  </DocPage>
</template>
