<script setup lang="ts">
import { ref } from "vue";
import { ToggleSwitch } from "../../../src";
import { api } from "../../api/entries/toggle-switch";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/toggle-switch";

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "切换立即生效的偏好或模式：「开启修订留痕」「实时校对引用」「深色模式」。",
    en: "Preferences or modes that apply immediately: “track changes”, “live citation check”, “dark mode”.",
  },
  rule2: {
    zh: "常置于设置行右侧，左侧配清晰的标题与一行辅助说明。",
    en: "Often placed on the right of a settings row, with a clear title and a one-line helper on the left.",
  },
  rule3: {
    zh: "需要点击底部「保存 / 提交」按钮才生效的表单字段用 <code>Checkbox</code>。",
    en: "Form fields that apply only after “Save / Submit” use <code>Checkbox</code>.",
  },
  rule4: {
    zh: "不在开关文案中写否定句（如「关闭自动同步」），避免开闭语义反转。",
    en: "Don't phrase switch labels as negations (e.g. “disable auto-sync”); it inverts on/off semantics.",
  },
  surfaces: { zh: "底面", en: "Surfaces" },
  surfacesDesc: {
    zh: "纸面与霜面并排。滑块（Thumb）恒用 --text-on-accent 实体底与 --shadow-raised，不随霜面或深色主题变暗。",
    en: "Paper and frost side by side. The thumb always uses a solid --text-on-accent fill with --shadow-raised and never dims on frost or in dark themes.",
  },
  autoCiteLabel: { zh: "粘贴 DOI 时自动解析题录", en: "Parse metadata when a DOI is pasted" },
  reviewModeLabel: { zh: "审阅模式（记录所有正文增删）", en: "Review mode (logs all body edits)" },
  reviewMode: { zh: "审阅模式", en: "Review mode" },
  composition: { zh: "变体与组合", en: "Variants & composition" },
  compositionDesc: {
    zh: "典型设置卡片行：左侧标题与说明，右侧开关对齐。",
    en: "A typical settings card row: title and description on the left, switch aligned on the right.",
  },
  autoApply: { zh: "AI 提案自动落盘", en: "Auto-apply AI proposals" },
  autoApplyHint: {
    zh: "允许助手在生成恢复点后直接写入草稿正文",
    en: "Lets the assistant write draft body text directly after creating a recovery point",
  },
  states: { zh: "状态", en: "States" },
  statesDesc: {
    zh: "支持空格与回车切换；只读与禁用态在捕获阶段拦截指针与键盘事件。",
    en: "Toggle with space or enter; readonly and disabled intercept pointer and keyboard events at the capture phase.",
  },
  colOff: { zh: "关闭", en: "Off" },
  colOn: { zh: "开启", en: "On" },
  colReadonly: { zh: "只读", en: "Readonly" },
  colOffDisabled: { zh: "关闭禁用", en: "Off, disabled" },
  colOnDisabled: { zh: "开启禁用", en: "On, disabled" },
  colInvalid: { zh: "错误", en: "Invalid" },
  stateDefault: { zh: "默认", en: "Default" },
  api: { zh: "接口", en: "API" },
} as const;

const autoCite = ref(true);
const trackChanges = ref(false);
const fullAccess = ref(true);
</script>

<template>
  <DocPage>
    <DocSection :title="s.demo" :desc="s.demoDesc">
      <UsagePlayground :entry="usage" />
    </DocSection>
    <DocSection :title="s.whenToUse">
      <ul class="doc-rules">
        <li data-kind="do" v-html="t(s.rule1)" />
        <li data-kind="do" v-html="t(s.rule2)" />
        <li data-kind="dont" v-html="t(s.rule3)" />
        <li data-kind="dont" v-html="t(s.rule4)" />
      </ul>
    </DocSection>

    <DocSection :title="s.surfaces" :desc="s.surfacesDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <label class="doc-row" style="justify-content: space-between; cursor: pointer">
          <span>{{ t(s.autoCiteLabel) }}</span>
          <ToggleSwitch v-model="autoCite" :aria-label="t(s.autoCiteLabel)" />
        </label>
        <label class="doc-row" style="justify-content: space-between; cursor: pointer">
          <span>{{ t(s.reviewModeLabel) }}</span>
          <ToggleSwitch v-model="trackChanges" :aria-label="t(s.reviewMode)" />
        </label>
      </Specimen>
    </DocSection>

    <DocSection :title="s.composition" :desc="s.compositionDesc">
      <Specimen :surfaces="['raised']" themes="single" layout="stack">
        <div class="doc-row" style="justify-content: space-between">
          <div>
            <div style="font-weight: var(--weight-medium)">{{ t(s.autoApply) }}</div>
            <div class="doc-note">{{ t(s.autoApplyHint) }}</div>
          </div>
          <ToggleSwitch v-model="fullAccess" :aria-label="t(s.autoApply)" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.states" :desc="s.statesDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colOff, s.colOn, s.colReadonly, s.colOffDisabled, s.colOnDisabled, s.colInvalid]" label-width="64px">
          <StateRow :label="s.stateDefault">
            <ToggleSwitch :model-value="false" :aria-label="t(s.colOff)" />
            <ToggleSwitch :model-value="true" :aria-label="t(s.colOn)" />
            <ToggleSwitch :model-value="true" readonly :aria-label="t(s.colReadonly)" />
            <ToggleSwitch :model-value="false" disabled :aria-label="t(s.colOffDisabled)" />
            <ToggleSwitch :model-value="true" disabled :aria-label="t(s.colOnDisabled)" />
            <ToggleSwitch :model-value="false" invalid :aria-label="t(s.colInvalid)" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
