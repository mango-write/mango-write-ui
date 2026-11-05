<script setup lang="ts">
import { ref } from "vue";
import { Button, ProgressBar } from "../../../src";
import { api } from "../../api/entries/progress-bar";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/progress-bar";

const progress = ref(64);

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "<strong>定量模式</strong>（<code>determinate</code>）：已知总步数或字节进度（如 PDF 上传、语料批处理进度）。",
    en: "<strong>Determinate</strong>: the total steps or byte progress is known (PDF uploads, corpus batch jobs).",
  },
  rule2: {
    zh: "<strong>不定量模式</strong>（<code>indeterminate</code>）：后台任务正在进行但无法预估剩余百分比；轨道自动收窄为 6px 细条。",
    en: "<strong>Indeterminate</strong>: a background task is running but the remaining percentage is unknowable; the track narrows to a 6px strip automatically.",
  },
  rule3: {
    zh: "局部按钮或行内槽位的即时加载请用 <code>Button loading</code> 或 <code>ProgressSpinner</code>。",
    en: "For instant loading on a button or inline slot, use <code>Button loading</code> or <code>ProgressSpinner</code>.",
  },
  rule4: {
    zh: "当进度值较小时（如 &lt; 15%），若轨道内放不下长自定义文案，请设 <code>:show-value=\"false\"</code> 并在进度条上方独立排版标题与百分比。",
    en: "At low progress (e.g. &lt; 15%) a long custom label won't fit the track — set <code>:show-value=\"false\"</code> and lay out the title and percentage above the bar.",
  },
  baseTitle: { zh: "底面", en: "Surfaces" },
  baseDesc: {
    zh: "纸面与霜面并排。轨道使用中性填充底与细边框，指示器采用品牌强调色（--accent）。",
    en: "Paper and frost side by side. The track uses a neutral fill with a hairline border; the indicator uses the brand accent.",
  },
  parseAria: { zh: "PDF 解析进度", en: "PDF parsing progress" },
  indexAria: { zh: "正在生成引用索引", en: "Generating citation index" },
  modesTitle: { zh: "模式与数值", en: "Modes and values" },
  modesDesc: {
    zh: "支持隐藏内置百分比文本或通过默认作用域插槽自定义文案；数值自动钳制在 0–100 之间。",
    en: "Hide the built-in percentage or customize it via the default scoped slot; values clamp to 0–100.",
  },
  noteBuiltin: { zh: "默认百分比", en: "Built-in percentage" },
  noteSlot: { zh: "自定义插槽", en: "Custom slot" },
  noteHidden: { zh: "隐藏内置数值", en: "Hidden value" },
  builtinAria: { zh: "默认百分比", en: "Built-in percentage" },
  slotAria: { zh: "自定义插槽", en: "Custom slot" },
  hiddenAria: { zh: "隐藏内置数值", en: "Hidden value" },
  indeterminateAria: { zh: "不定量进度", en: "Indeterminate progress" },
  parsedPrefix: { zh: "已解析", en: "Parsed" },
  parsedSuffix: { zh: " 篇", en: "" },
  setFull: { zh: "设为 100%", en: "Set to 100%" },
  statesTitle: { zh: "状态", en: "States" },
  statesDesc: {
    zh: "不同进度阶段与模式在浅色、深色主题下的对比。开启系统「减少动态效果」时动画自动停用。",
    en: "Progress stages and modes across light and dark themes. Animation disables automatically under the system's reduced-motion setting.",
  },
  rowValue: { zh: "显示数值", en: "With value" },
  rowThin: { zh: "无文字细轨", en: "Thin track" },
  loadingAria: { zh: "加载中", en: "Loading" },
  api: { zh: "接口", en: "API" },
} as const;
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

    <DocSection :title="s.baseTitle" :desc="s.baseDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <div style="width: 100%">
          <ProgressBar :value="progress" :aria-label="t(s.parseAria)" />
        </div>
        <div style="width: 100%">
          <ProgressBar mode="indeterminate" :aria-label="t(s.indexAria)" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.modesTitle" :desc="s.modesDesc">
      <Specimen themes="single" layout="stack">
        <div class="doc-row">
          <span class="doc-note" style="width: 96px">{{ t(s.noteBuiltin) }}</span>
          <div style="flex: 1">
            <ProgressBar :value="progress" :aria-label="t(s.builtinAria)" />
          </div>
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 96px">{{ t(s.noteSlot) }}</span>
          <div style="flex: 1">
            <ProgressBar :value="progress" :aria-label="t(s.slotAria)">
              <template #default="{ value }">{{ t(s.parsedPrefix) }} {{ Math.round(value) }} / 100{{ t(s.parsedSuffix) }}</template>
            </ProgressBar>
          </div>
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 96px">{{ t(s.noteHidden) }}</span>
          <div style="flex: 1">
            <ProgressBar :value="progress" :show-value="false" :aria-label="t(s.hiddenAria)" />
          </div>
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 96px">indeterminate</span>
          <div style="flex: 1">
            <ProgressBar mode="indeterminate" :aria-label="t(s.indeterminateAria)" />
          </div>
        </div>
        <div class="doc-row">
          <Button size="xs" severity="secondary" label="-15%" @click="progress = Math.max(0, progress - 15)" />
          <Button size="xs" severity="secondary" label="+15%" @click="progress = Math.min(100, progress + 15)" />
          <Button size="xs" variant="text" severity="secondary" :label="t(s.setFull)" @click="progress = 100" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.statesTitle" :desc="s.statesDesc">
      <Specimen themes="both">
        <StateGrid :columns="['0%', '35%', '75%', '100%']" label-width="104px">
          <StateRow :label="s.rowValue">
            <div style="width: 140px"><ProgressBar :value="0" aria-label="0%" /></div>
            <div style="width: 140px"><ProgressBar :value="35" aria-label="35%" /></div>
            <div style="width: 140px"><ProgressBar :value="75" aria-label="75%" /></div>
            <div style="width: 140px"><ProgressBar :value="100" aria-label="100%" /></div>
          </StateRow>
          <StateRow :label="s.rowThin">
            <div style="width: 140px"><ProgressBar :value="0" :show-value="false" aria-label="0%" /></div>
            <div style="width: 140px"><ProgressBar :value="35" :show-value="false" aria-label="35%" /></div>
            <div style="width: 140px"><ProgressBar :value="75" :show-value="false" aria-label="75%" /></div>
            <div style="width: 140px"><ProgressBar mode="indeterminate" :aria-label="t(s.loadingAria)" /></div>
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
