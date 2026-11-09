<script setup lang="ts">
import { computed, ref } from "vue";
import { Maximize, RotateCcw, RotateCw, X, ZoomIn, ZoomOut } from "lucide-vue-next";
import { Button, ImageLightbox } from "@mango-write/ui-vue";
import { api } from "../../api/entries/image-lightbox";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/image-lightbox";

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  do1: {
    zh: "正文插图、文献详情抽取图表（Figure）或科研日志实验照片的全屏放大检视。",
    en: "Full-screen inspection of body figures, figures extracted into reference details, or experiment photos from research logs.",
  },
  do2: {
    zh: "传入 <code>caption</code> 在底部居中展示图题与来源说明，保持图表与正文语境关联。",
    en: "Pass <code>caption</code> to center the figure title and source note at the bottom, keeping the figure tied to its context in the text.",
  },
  dont1: {
    zh: "不是通用模态对话框，不承载表单控件或业务确认按钮（用 <code>Dialog</code>）。",
    en: "Not a general modal — no form controls or business confirm buttons (use a <code>Dialog</code>).",
  },
  dont2: {
    zh: "灯箱舞台固定使用暗场 token（<code>--lightbox-scrim</code> / <code>--lightbox-toolbar</code>），以保证科研图表对比度恒定。",
    en: "The lightbox stage always uses dark-scene tokens (<code>--lightbox-scrim</code> / <code>--lightbox-toolbar</code>) so scientific figures keep constant contrast.",
  },
  stageTitle: { zh: "底面与固定暗场舞台", en: "Surface and fixed dark stage" },
  stageDesc: {
    zh: "点击缩略图或按钮可打开全屏灯箱；下方内联给出固定暗场工具栏与舞台的静态结构对照。",
    en: "Click a thumbnail or button to open the fullscreen lightbox; the static structure of the fixed dark toolbar and stage is inlined below.",
  },
  viewArchBtn: { zh: "检视架构插图 (带图注)", en: "Inspect architecture figure (with caption)" },
  viewSpecBtn: { zh: "检视实验谱图 (无图注)", en: "Inspect spectrum figure (no caption)" },
  fig1Alt: { zh: "Figure 1 架构图", en: "Figure 1 architecture" },
  fig1Caption: {
    zh: "图 1：素材 → 理解 → 沉淀 → 写作闭环中的锚点坐标空间与提案写回链路。",
    en: "Figure 1: anchor coordinate spaces and the proposal write-back path in the material → understanding → notes → writing loop.",
  },
  fig2Alt: { zh: "Figure 2 功率谱对比", en: "Figure 2 power spectrum comparison" },
  fig2AltShort: { zh: "Figure 2 功率谱", en: "Figure 2 spectrum" },
  previewAlt: { zh: "Figure 1 预览", en: "Figure 1 preview" },
  previewCaption: {
    zh: "图 1：素材 → 理解 → 沉淀 → 写作闭环中的锚点坐标空间与提案写回链路（点击图片全屏检视）。",
    en: "Figure 1: anchor coordinate spaces and the proposal write-back path in the material → understanding → notes → writing loop (click the image to inspect fullscreen).",
  },
  statesTitle: { zh: "状态与交互方式", en: "States and interactions" },
  statesDesc: {
    zh: "打开后自动锁定背景滚动并将初始焦点移至关闭按钮；支持 Tab 焦点环捕获、滚轮缩放、指针拖拽平移与键盘快捷键。",
    en: "On open, background scroll locks and initial focus moves to the close button; supports Tab focus trap, wheel zoom, pointer drag pan, and keyboard shortcuts.",
  },
  colCaption: { zh: "带图注 (caption)", en: "With caption" },
  colNoCaption: { zh: "纯图片 (caption=null)", en: "Image only (caption=null)" },
  colKeys: { zh: "快捷键 + / - / Esc", en: "Shortcuts + / - / Esc" },
  rowClick: { zh: "点击体验", en: "Click to try" },
  viewCaptionBtn: { zh: "带图注检视", en: "Inspect with caption" },
  viewPlainBtn: { zh: "无图注检视", en: "Inspect without caption" },
  fig1CaptionShort: {
    zh: "图 1：检索增强科研写作闭环数据流。",
    en: "Figure 1: data flow of the retrieval-augmented research writing loop.",
  },
  hintZoom: {
    zh: "打开后可用滚轮或 <code>+</code> / <code>-</code> 缩放，按住图片拖拽平移",
    en: "Once open, zoom with the wheel or <code>+</code> / <code>-</code>, and drag the image to pan",
  },
  api: { zh: "接口", en: "API" },
} as const;

/* SVG 里的图题/节点名按当前语言重建 data URI */
const figureArchitectureSvg = computed(
  () => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 400" fill="none">
  <rect width="720" height="400" rx="16" fill="#18181B"/>
  <rect x="32" y="32" width="656" height="336" rx="12" stroke="#3F3F46" stroke-width="1.5" stroke-dasharray="6 6"/>
  <rect x="72" y="140" width="148" height="120" rx="10" fill="#27272A" stroke="#F59E0B" stroke-width="2"/>
  <text x="146" y="192" fill="#FAFAFA" font-family="sans-serif" font-size="15" font-weight="600" text-anchor="middle">${t({ zh: "文献语料库", en: "Reference corpus" })}</text>
  <text x="146" y="218" fill="#A1A1AA" font-family="monospace" font-size="12" text-anchor="middle">MinerU → CoreDoc</text>
  <path d="M220 200H284" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
  <rect x="284" y="140" width="152" height="120" rx="10" fill="#27272A" stroke="#38BDF8" stroke-width="2"/>
  <text x="360" y="192" fill="#FAFAFA" font-family="sans-serif" font-size="15" font-weight="600" text-anchor="middle">${t({ zh: "锚点空间对齐", en: "Anchor-space alignment" })}</text>
  <text x="360" y="218" fill="#A1A1AA" font-family="monospace" font-size="12" text-anchor="middle">FlatBlock.anchorText</text>
  <path d="M436 200H500" stroke="#38BDF8" stroke-width="2" stroke-linecap="round"/>
  <rect x="500" y="140" width="148" height="120" rx="10" fill="#27272A" stroke="#34D399" stroke-width="2"/>
  <text x="574" y="192" fill="#FAFAFA" font-family="sans-serif" font-size="15" font-weight="600" text-anchor="middle">${t({ zh: "协同写作提案", en: "Collab writing proposals" })}</text>
  <text x="574" y="218" fill="#A1A1AA" font-family="monospace" font-size="12" text-anchor="middle">EditProposal → Yjs</text>
  <text x="360" y="84" fill="#E4E4E7" font-family="sans-serif" font-size="16" font-weight="600" text-anchor="middle">${t({ zh: "Figure 1 · 检索增强科研写作闭环数据流", en: "Figure 1 · Data flow of the retrieval-augmented research writing loop" })}</text>
</svg>
`)}`,
);

const figureSpectrumSvg = computed(
  () => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 400" fill="none">
  <rect width="720" height="400" rx="16" fill="#0F172A"/>
  <path d="M80 320 L640 320 M80 80 L80 320" stroke="#475569" stroke-width="2"/>
  <path d="M96 290 C160 280, 210 120, 280 140 C350 160, 410 260, 490 110 C540 40, 590 190, 630 170" stroke="#F59E0B" stroke-width="3.5" fill="none"/>
  <path d="M96 300 C170 295, 230 200, 300 210 C370 220, 430 280, 500 180 C550 120, 595 230, 630 220" stroke="#38BDF8" stroke-width="2.5" stroke-dasharray="6 4" fill="none"/>
  <text x="360" y="52" fill="#F8FAFC" font-family="sans-serif" font-size="16" font-weight="600" text-anchor="middle">${t({ zh: "Figure 2 · 对流参数化方案降水日变化功率谱对比", en: "Figure 2 · Diurnal precipitation power spectrum across convective parameterizations" })}</text>
  <text x="360" y="362" fill="#94A3B8" font-family="monospace" font-size="12" text-anchor="middle">Frequency (cycles / day) — Solid: CTRL · Dashed: EXP-MANGO</text>
</svg>
`)}`,
);

const visible = ref(false);
const activeSrc = ref(figureArchitectureSvg.value);
const activeAlt = ref("");
const activeCaption = ref<string | null>(null);

function openFigure(src: string, alt: string, caption: string | null) {
  activeSrc.value = src;
  activeAlt.value = alt;
  activeCaption.value = caption;
  visible.value = true;
}
</script>

<template>
  <DocPage>
    <DocSection :title="s.demo" :desc="s.demoDesc">
      <UsagePlayground :entry="usage" />
    </DocSection>
    <DocSection :title="s.whenToUse">
      <ul class="doc-rules">
        <li data-kind="do" v-html="t(s.do1)" />
        <li data-kind="do" v-html="t(s.do2)" />
        <li data-kind="dont" v-html="t(s.dont1)" />
        <li data-kind="dont" v-html="t(s.dont2)" />
      </ul>
    </DocSection>

    <DocSection :title="s.stageTitle" :desc="s.stageDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <div class="doc-row">
          <Button
            size="sm"
            :label="t(s.viewArchBtn)"
            @click="openFigure(figureArchitectureSvg, t(s.fig1Alt), t(s.fig1Caption))"
          />
          <Button
            size="sm"
            severity="secondary"
            :label="t(s.viewSpecBtn)"
            @click="openFigure(figureSpectrumSvg, t(s.fig2Alt), null)"
          />
        </div>

        <div class="lightbox-preview">
          <div class="lightbox-preview__toolbar" aria-hidden="true">
            <span><ZoomIn :size="15" /></span>
            <span><ZoomOut :size="15" /></span>
            <span><RotateCcw :size="15" /></span>
            <span><RotateCw :size="15" /></span>
            <span><Maximize :size="15" /></span>
            <i class="lightbox-preview__div" />
            <span><X :size="15" /></span>
          </div>
          <img
            :src="figureArchitectureSvg"
            :alt="t(s.previewAlt)"
            class="lightbox-preview__img"
            @click="openFigure(figureArchitectureSvg, t(s.fig1Alt), t(s.fig1Caption))"
          />
          <div class="lightbox-preview__caption">{{ t(s.previewCaption) }}</div>
        </div>
      </Specimen>

      <ImageLightbox
        v-model:visible="visible"
        :src="activeSrc"
        :alt="activeAlt"
        :caption="activeCaption"
      />
    </DocSection>

    <DocSection :title="s.statesTitle" :desc="s.statesDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colCaption, s.colNoCaption, s.colKeys]" label-width="84px">
          <StateRow :label="s.rowClick">
            <Button
              size="sm"
              :label="t(s.viewCaptionBtn)"
              @click="openFigure(figureArchitectureSvg, t(s.fig1Alt), t(s.fig1CaptionShort))"
            />
            <Button
              size="sm"
              severity="secondary"
              :label="t(s.viewPlainBtn)"
              @click="openFigure(figureSpectrumSvg, t(s.fig2AltShort), null)"
            />
            <span class="doc-note" v-html="t(s.hintZoom)" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>

<style scoped>
.lightbox-preview {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2-5);
  padding: var(--space-10) var(--space-4) var(--space-3);
  border-radius: var(--radius-card);
  background: var(--lightbox-scrim);
}

.lightbox-preview__toolbar {
  position: absolute;
  top: var(--space-2-5);
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  border: var(--border-width) solid var(--lightbox-divider);
  background: var(--lightbox-toolbar);
  color: var(--lightbox-text);
}

.lightbox-preview__toolbar span {
  display: inline-flex;
  padding: var(--space-1);
}

.lightbox-preview__div {
  width: var(--border-width);
  height: 14px;
  background: var(--lightbox-divider);
}

.lightbox-preview__img {
  max-width: 100%;
  max-height: 150px;
  border-radius: var(--radius-sm);
  cursor: zoom-in;
}

.lightbox-preview__caption {
  color: var(--lightbox-text-muted);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
  text-align: center;
}
</style>
