<script setup lang="ts">
import { Maximize, RotateCcw, RotateCw, X, ZoomIn, ZoomOut } from "lucide-vue-next";
import { ref } from "vue";
import { Button, ImageLightbox } from "../../../src";
import { api } from "../../api/entries/image-lightbox";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const figureArchitectureSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 400" fill="none">
  <rect width="720" height="400" rx="16" fill="#18181B"/>
  <rect x="32" y="32" width="656" height="336" rx="12" stroke="#3F3F46" stroke-width="1.5" stroke-dasharray="6 6"/>
  <rect x="72" y="140" width="148" height="120" rx="10" fill="#27272A" stroke="#F59E0B" stroke-width="2"/>
  <text x="146" y="192" fill="#FAFAFA" font-family="sans-serif" font-size="15" font-weight="600" text-anchor="middle">文献语料库</text>
  <text x="146" y="218" fill="#A1A1AA" font-family="monospace" font-size="12" text-anchor="middle">MinerU → CoreDoc</text>
  <path d="M220 200H284" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
  <rect x="284" y="140" width="152" height="120" rx="10" fill="#27272A" stroke="#38BDF8" stroke-width="2"/>
  <text x="360" y="192" fill="#FAFAFA" font-family="sans-serif" font-size="15" font-weight="600" text-anchor="middle">锚点空间对齐</text>
  <text x="360" y="218" fill="#A1A1AA" font-family="monospace" font-size="12" text-anchor="middle">FlatBlock.anchorText</text>
  <path d="M436 200H500" stroke="#38BDF8" stroke-width="2" stroke-linecap="round"/>
  <rect x="500" y="140" width="148" height="120" rx="10" fill="#27272A" stroke="#34D399" stroke-width="2"/>
  <text x="574" y="192" fill="#FAFAFA" font-family="sans-serif" font-size="15" font-weight="600" text-anchor="middle">协同写作提案</text>
  <text x="574" y="218" fill="#A1A1AA" font-family="monospace" font-size="12" text-anchor="middle">EditProposal → Yjs</text>
  <text x="360" y="84" fill="#E4E4E7" font-family="sans-serif" font-size="16" font-weight="600" text-anchor="middle">Figure 1 · 检索增强科研写作闭环数据流</text>
</svg>
`)}`;

const figureSpectrumSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 400" fill="none">
  <rect width="720" height="400" rx="16" fill="#0F172A"/>
  <path d="M80 320 L640 320 M80 80 L80 320" stroke="#475569" stroke-width="2"/>
  <path d="M96 290 C160 280, 210 120, 280 140 C350 160, 410 260, 490 110 C540 40, 590 190, 630 170" stroke="#F59E0B" stroke-width="3.5" fill="none"/>
  <path d="M96 300 C170 295, 230 200, 300 210 C370 220, 430 280, 500 180 C550 120, 595 230, 630 220" stroke="#38BDF8" stroke-width="2.5" stroke-dasharray="6 4" fill="none"/>
  <text x="360" y="52" fill="#F8FAFC" font-family="sans-serif" font-size="16" font-weight="600" text-anchor="middle">Figure 2 · 对流参数化方案降水日变化功率谱对比</text>
  <text x="360" y="362" fill="#94A3B8" font-family="monospace" font-size="12" text-anchor="middle">Frequency (cycles / day) — Solid: CTRL · Dashed: EXP-MANGO</text>
</svg>
`)}`;

const visible = ref(false);
const activeSrc = ref(figureArchitectureSvg);
const activeAlt = ref("Figure 1 架构图");
const activeCaption = ref<string | null>(
  "图 1：素材 → 理解 → 沉淀 → 写作闭环中的锚点坐标空间与提案写回链路。",
);

function openFigure(src: string, alt: string, caption: string | null) {
  activeSrc.value = src;
  activeAlt.value = alt;
  activeCaption.value = caption;
  visible.value = true;
}
</script>

<template>
  <DocPage
    lead="图片灯箱：全屏检视论文插图、实验谱图或扫描件，支持滚轮与按钮缩放（0.2×–8×）、90° 步进旋转、指针拖拽平移与图注展示。固定暗场舞台（--lightbox-*），不随浅色主题翻转。"
  >
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">正文插图、文献详情抽取图表（Figure）或科研日志实验照片的全屏放大检视。</li>
        <li data-kind="do">传入 <code>caption</code> 在底部居中展示图题与来源说明，保持图表与正文语境关联。</li>
        <li data-kind="dont">不是通用模态对话框，不承载表单控件或业务确认按钮（用 <code>Dialog</code>）。</li>
        <li data-kind="dont">灯箱舞台固定使用暗场 token（<code>--lightbox-scrim</code> / <code>--lightbox-toolbar</code>），以保证科研图表对比度恒定。</li>
      </ul>
    </DocSection>

    <DocSection
      title="底面与固定暗场舞台"
      desc="点击缩略图或按钮可打开全屏灯箱；下方内联给出固定暗场工具栏与舞台的静态结构对照。"
    >
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <div class="doc-row">
          <Button
            size="sm"
            label="检视架构插图 (带图注)"
            @click="
              openFigure(
                figureArchitectureSvg,
                'Figure 1 架构图',
                '图 1：素材 → 理解 → 沉淀 → 写作闭环中的锚点坐标空间与提案写回链路。',
              )
            "
          />
          <Button
            size="sm"
            severity="secondary"
            label="检视实验谱图 (无图注)"
            @click="openFigure(figureSpectrumSvg, 'Figure 2 功率谱对比', null)"
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
            alt="Figure 1 预览"
            class="lightbox-preview__img"
            @click="
              openFigure(
                figureArchitectureSvg,
                'Figure 1 架构图',
                '图 1：素材 → 理解 → 沉淀 → 写作闭环中的锚点坐标空间与提案写回链路。',
              )
            "
          />
          <div class="lightbox-preview__caption">
            图 1：素材 → 理解 → 沉淀 → 写作闭环中的锚点坐标空间与提案写回链路（点击图片全屏检视）。
          </div>
        </div>
      </Specimen>

      <ImageLightbox
        v-model:visible="visible"
        :src="activeSrc"
        :alt="activeAlt"
        :caption="activeCaption"
      />
    </DocSection>

    <DocSection title="状态与交互方式" desc="打开后自动锁定背景滚动并将初始焦点移至关闭按钮；支持 Tab 焦点环捕获、滚轮缩放、指针拖拽平移与键盘快捷键。">
      <Specimen themes="both">
        <StateGrid :columns="['带图注 (caption)', '纯图片 (caption=null)', '快捷键 + / - / Esc']" label-width="84px">
          <StateRow label="点击体验">
            <Button
              size="sm"
              label="带图注检视"
              @click="
                openFigure(
                  figureArchitectureSvg,
                  'Figure 1 架构图',
                  '图 1：检索增强科研写作闭环数据流。',
                )
              "
            />
            <Button
              size="sm"
              severity="secondary"
              label="无图注检视"
              @click="openFigure(figureSpectrumSvg, 'Figure 2 功率谱', null)"
            />
            <span class="doc-note">打开后可用滚轮或 <code>+</code> / <code>-</code> 缩放，按住图片拖拽平移</span>
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
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
