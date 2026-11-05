<script setup lang="ts">
import { ref } from "vue";
import { Slider } from "../../../src";
import { api } from "../../api/entries/slider";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/slider";

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "调节即时预览的相对量或区间：字号缩放、发表年份范围、检索相似度阈值。",
    en: "Relative amounts or ranges with instant preview: font size, publication year range, similarity threshold.",
  },
  rule2: {
    zh: "需要双端闭区间筛选时开启 <code>range</code>，<code>v-model</code> 绑定二元数组 <code>[start, end]</code>。",
    en: "For closed range filters enable <code>range</code> and bind <code>v-model</code> to a pair <code>[start, end]</code>.",
  },
  rule3: {
    zh: "需要输入精确数值（如页码、经费金额）时用 <code>InputNumber</code>。",
    en: "Exact values (page numbers, grant amounts) use <code>InputNumber</code>.",
  },
  surfaces: { zh: "底面", en: "Surfaces" },
  surfacesDesc: {
    zh: "纸面与霜面并排。单值与双端区间（range）共享同一套轨道与手柄几何。",
    en: "Paper and frost side by side. Single value and range share one track and thumb geometry.",
  },
  readingSize: { zh: "阅读字号", en: "Reading size" },
  yearRangeLabel: { zh: "发表年份区间", en: "Publication year range" },
  steps: { zh: "连续、步长与刻度", en: "Continuous, steps & ticks" },
  stepsDesc: {
    zh: "缺省无级连续拖动（值为连续浮点）；显式传入 step 后拖动按刻度吸附，方向键按 step 增减，PageUp/PageDown 按 10 倍步长移动。showTicks 在轨道上渲染每个刻度的小节点（需显式 step），刻度数量 = 范围 / step + 1，max 端点必含——注意短轨道上的刻度密度。",
    en: "Drags continuously by default (value is a float); pass step to snap to ticks, arrow keys step by step, and PageUp/PageDown move 10 steps. showTicks renders a node per tick on the track (needs an explicit step); tick count = range / step + 1, always including max—mind tick density on short tracks.",
  },
  continuous: { zh: "连续（缺省无 step，当前 ", en: "Continuous (no step, now " },
  step5: { zh: "步长 step=5（当前 ", en: "Step size step=5 (now " },
  ticks25: { zh: "刻度标记 step=25 + showTicks（当前 ", en: "Ticks step=25 + showTicks (now " },
  vertical: { zh: "垂直 step=25 + showTicks（", en: "Vertical step=25 + showTicks (" },
  paren: { zh: "）", en: ")" },
  continuousMode: { zh: "连续模式", en: "Continuous mode" },
  similarity: { zh: "相似度阈值", en: "Similarity threshold" },
  tickMarks: { zh: "刻度标记", en: "Tick marks" },
  verticalZoom: { zh: "垂直缩放", en: "Vertical zoom" },
  states: { zh: "状态", en: "States" },
  statesDesc: {
    zh: "聚焦时手柄呈现品牌色外环；禁用态降低整体不透明度并禁止拖拽。",
    en: "Focus shows a brand-color ring on the thumb; disabled lowers opacity and blocks dragging.",
  },
  colSingle: { zh: "单值默认", en: "Single value" },
  colRange: { zh: "双端区间", en: "Range" },
  colReadonly: { zh: "只读", en: "Readonly" },
  colDisabled: { zh: "禁用", en: "Disabled" },
  colInvalid: { zh: "错误", en: "Invalid" },
  horizontal: { zh: "水平", en: "Horizontal" },
  api: { zh: "接口", en: "API" },
} as const;

const fontSize = ref(16);
const yearRange = ref<[number, number]>([2019, 2026]);
const continuousValue = ref(50);
const similarity = ref(75);
const ticked = ref(50);
const zoomLevel = ref(100);
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
      </ul>
    </DocSection>

    <DocSection :title="s.surfaces" :desc="s.surfacesDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <div class="doc-stack" style="gap: var(--space-1)">
          <div class="doc-row" style="justify-content: space-between">
            <span class="doc-note">{{ t(s.readingSize) }}</span>
            <span class="doc-note">{{ fontSize }} px</span>
          </div>
          <Slider v-model="fontSize" :min="12" :max="24" :step="1" :aria-label="t(s.readingSize)" />
        </div>
        <div class="doc-stack" style="gap: var(--space-1)">
          <div class="doc-row" style="justify-content: space-between">
            <span class="doc-note">{{ t(s.yearRangeLabel) }}</span>
            <span class="doc-note">{{ yearRange[0] }} – {{ yearRange[1] }}</span>
          </div>
          <Slider v-model="yearRange" range :min="2010" :max="2026" :step="1" :aria-label="t(s.yearRangeLabel)" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.steps" :desc="s.stepsDesc">
      <Specimen themes="single" layout="stack">
        <div class="doc-row" style="align-items: stretch; gap: var(--space-5)">
          <div style="flex: 1; min-width: 200px" class="doc-stack">
            <span class="doc-note">{{ t(s.continuous) }}{{ continuousValue.toFixed(1) }}{{ t(s.paren) }}</span>
            <Slider v-model="continuousValue" :min="0" :max="100" :aria-label="t(s.continuousMode)" />
          </div>
          <div style="flex: 1; min-width: 200px" class="doc-stack">
            <span class="doc-note">{{ t(s.step5) }}{{ similarity }}%{{ t(s.paren) }}</span>
            <Slider v-model="similarity" :min="0" :max="100" :step="5" :aria-label="t(s.similarity)" />
          </div>
        </div>
        <div style="flex: 1; min-width: 200px" class="doc-stack">
          <span class="doc-note">{{ t(s.ticks25) }}{{ ticked }}{{ t(s.paren) }}</span>
          <Slider v-model="ticked" :min="0" :max="100" :step="25" show-ticks :aria-label="t(s.tickMarks)" />
        </div>
        <div class="doc-row" style="gap: var(--space-3); padding-block: var(--space-2); padding-inline: var(--space-4)">
          <Slider v-model="zoomLevel" orientation="vertical" :min="50" :max="150" :step="25" show-ticks :aria-label="t(s.verticalZoom)" />
          <span class="doc-note">{{ t(s.vertical) }}{{ zoomLevel }}%{{ t(s.paren) }}</span>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.states" :desc="s.statesDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colSingle, s.colRange, s.colReadonly, s.colDisabled, s.colInvalid]" label-width="56px">
          <StateRow :label="s.horizontal">
            <div style="width: 120px"><Slider :model-value="45" :aria-label="t(s.colSingle)" /></div>
            <div style="width: 120px"><Slider :model-value="[20, 80]" range :aria-label="t(s.colRange)" /></div>
            <div style="width: 120px"><Slider :model-value="60" readonly :aria-label="t(s.colReadonly)" /></div>
            <div style="width: 120px"><Slider :model-value="45" disabled :aria-label="t(s.colDisabled)" /></div>
            <div style="width: 120px"><Slider :model-value="30" invalid :aria-label="t(s.colInvalid)" /></div>
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
