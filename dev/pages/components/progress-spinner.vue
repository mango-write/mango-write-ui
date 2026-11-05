<script setup lang="ts">
import { ProgressSpinner } from "../../../src";
import { api } from "../../api/entries/progress-spinner";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/progress-spinner";

const sizes = [
  { label: { zh: "行内 16px", en: "Inline 16px" }, size: "16px", stroke: "5" },
  { label: { zh: "紧凑 24px", en: "Compact 24px" }, size: "24px", stroke: "4" },
  { label: { zh: "默认 40px", en: "Default 40px" }, size: "40px", stroke: "4" },
  { label: { zh: "面板 56px", en: "Panel 56px" }, size: "56px", stroke: "3" },
] as const;

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "异步拉取局部数据（如检索候选列表、加载预览面板）且无法预估具体百分比时。",
    en: "Async partial fetches (search candidates, preview panels) with no estimable percentage.",
  },
  rule2: {
    zh: "通过 CSS 变量 <code>--mw-progress-spinner-size</code> 调整外框尺寸，并按比例微调 <code>strokeWidth</code>。",
    en: "Resize via the CSS variable <code>--mw-progress-spinner-size</code> and fine-tune <code>strokeWidth</code> proportionally.",
  },
  rule3: {
    zh: "首次渲染已知版式结构的列表或卡片时，优先用 <code>Skeleton</code> 骨架占位以减少布局跳动。",
    en: "For first renders of lists or cards with a known layout, prefer <code>Skeleton</code> placeholders to reduce layout shift.",
  },
  rule4: {
    zh: "不要在同一视口内同时旋转多个大号加载环；整块异步区域可直接交给 <code>AsyncSlot</code> 管理。",
    en: "Don't spin multiple large rings in one viewport; hand a whole async region to <code>AsyncSlot</code>.",
  },
  baseTitle: { zh: "底面", en: "Surfaces" },
  baseDesc: {
    zh: "纸面与霜面并排。默认描边取 --accent，也可通过设置 color 让其跟随次级文本色。",
    en: "Paper and frost side by side. The stroke defaults to --accent; set color to follow the secondary text color instead.",
  },
  detailsAria: { zh: "正在加载文献详情", en: "Loading work details" },
  syncingAria: { zh: "同步中", en: "Syncing" },
  verifyNote: { zh: "正在校验引用锚点…", en: "Verifying citation anchors…" },
  sizesTitle: { zh: "尺寸与描边", en: "Size and stroke" },
  sizesDesc: {
    zh: "默认尺寸为 --space-10（40px）。小尺寸建议加粗 strokeWidth（如 5），大尺寸建议减细（如 3）以保持视觉描边均衡。",
    en: "Default size is --space-10 (40px). Bump strokeWidth (e.g. 5) at small sizes and thin it (e.g. 3) at large ones to keep the visual weight balanced.",
  },
  statesTitle: { zh: "状态", en: "States" },
  statesDesc: {
    zh: "不同描边粗细、动画周期与色彩继承在浅色、深色主题下的表现。",
    en: "Stroke widths, animation durations, and color inheritance across light and dark themes.",
  },
  colDefault: { zh: "默认 (stroke 4)", en: "Default (stroke 4)" },
  colThin: { zh: "细描边 (stroke 2.5)", en: "Thin (stroke 2.5)" },
  colThick: { zh: "粗描边 (stroke 6)", en: "Thick (stroke 6)" },
  colSecondary: { zh: "次要色继承", en: "Secondary color" },
  colSlow: { zh: "慢速周期 (3.5s)", en: "Slow (3.5s)" },
  row40: { zh: "40px", en: "40px" },
  row24: { zh: "24px", en: "24px" },
  defaultAria: { zh: "默认加载", en: "Default loading" },
  thinAria: { zh: "细描边加载", en: "Thin stroke loading" },
  thickAria: { zh: "粗描边加载", en: "Thick stroke loading" },
  secondaryAria: { zh: "次要色加载", en: "Secondary color loading" },
  slowAria: { zh: "慢速加载", en: "Slow loading" },
  defaultSmAria: { zh: "默认小号", en: "Default small" },
  thinSmAria: { zh: "细描边小号", en: "Thin stroke small" },
  thickSmAria: { zh: "粗描边小号", en: "Thick stroke small" },
  secondarySmAria: { zh: "次要色小号", en: "Secondary color small" },
  slowSmAria: { zh: "慢速小号", en: "Slow small" },
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
      <Specimen :surfaces="['paper', 'frost']">
        <ProgressSpinner :aria-label="t(s.detailsAria)" />
        <div class="doc-row" style="gap: 8px">
          <ProgressSpinner style="--mw-progress-spinner-size: 20px; color: var(--text-secondary)" stroke-width="4" :aria-label="t(s.syncingAria)" />
          <span class="doc-note">{{ t(s.verifyNote) }}</span>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.sizesTitle" :desc="s.sizesDesc">
      <Specimen themes="single">
        <div v-for="sz in sizes" :key="sz.size" class="doc-row" style="gap: 10px; margin-right: 16px">
          <ProgressSpinner
            :style="{ '--mw-progress-spinner-size': sz.size }"
            :stroke-width="sz.stroke"
            :aria-label="t(sz.label)"
          />
          <span class="doc-note">{{ t(sz.label) }}</span>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.statesTitle" :desc="s.statesDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colDefault, s.colThin, s.colThick, s.colSecondary, s.colSlow]" label-width="72px">
          <StateRow :label="s.row40">
            <ProgressSpinner :aria-label="t(s.defaultAria)" />
            <ProgressSpinner stroke-width="2.5" :aria-label="t(s.thinAria)" />
            <ProgressSpinner stroke-width="6" :aria-label="t(s.thickAria)" />
            <ProgressSpinner style="color: var(--text-secondary)" :aria-label="t(s.secondaryAria)" />
            <ProgressSpinner animation-duration="3.5s" :aria-label="t(s.slowAria)" />
          </StateRow>
          <StateRow :label="s.row24">
            <ProgressSpinner style="--mw-progress-spinner-size: 24px" :aria-label="t(s.defaultSmAria)" />
            <ProgressSpinner style="--mw-progress-spinner-size: 24px" stroke-width="2.5" :aria-label="t(s.thinSmAria)" />
            <ProgressSpinner style="--mw-progress-spinner-size: 24px" stroke-width="6" :aria-label="t(s.thickSmAria)" />
            <ProgressSpinner style="--mw-progress-spinner-size: 24px; color: var(--text-secondary)" :aria-label="t(s.secondarySmAria)" />
            <ProgressSpinner style="--mw-progress-spinner-size: 24px" animation-duration="3.5s" :aria-label="t(s.slowSmAria)" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
