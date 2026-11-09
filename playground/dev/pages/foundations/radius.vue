<script setup lang="ts">
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import { t } from "../../i18n";

const scale = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl", "full"];
const semantic = [
  { token: "--radius-item", use: { zh: "菜单项、列表行", en: "Menu items, list rows" } },
  { token: "--radius-card", use: { zh: "卡片、分组卡", en: "Cards, grouped cards" } },
  { token: "--radius-float", use: { zh: "菜单、弹出层、Toast", en: "Menus, popovers, toasts" } },
  { token: "--radius-dialog", use: { zh: "对话框", en: "Dialogs" } },
  { token: "--radius-sheet", use: { zh: "工作台浮岛", en: "Workbench islands" } },
  { token: "--control-radius", use: { zh: "控件（随尺寸档）", en: "Controls (follows the size tier)" } },
];

const s = {
  scaleTitle: { zh: "刻度", en: "Scale" },
  semanticTitle: { zh: "语义圆角", en: "Semantic radii" },
  semanticDesc: { zh: "组件写语义名，不写刻度。", en: "Components write semantic names, never scale values." },
  concentricTitle: { zh: "同心规则", en: "Concentric rule" },
  concentricDesc: {
    zh: "容器套容器时，内圆角 = 外圆角 − 内边距。否则内外两条弧不平行，角上会「鼓」或「瘪」。",
    en: "When containers nest, inner radius = outer radius − padding. Otherwise the two arcs aren't parallel and corners bulge or pinch.",
  },
  open: { zh: "打开", en: "Open" },
  openInNewTab: { zh: "在新标签页打开", en: "Open in new tab" },
  wrongNote: { zh: "✗ 内外同圆角：内弧比外弧更圆，角部发胖", en: "✗ Same radius inside and out: the inner arc is rounder than the outer one, so corners fatten" },
} as const;
</script>

<template>
  <DocPage>
    <DocSection :title="s.scaleTitle">
      <div class="radius-row">
        <div v-for="r in scale" :key="r" class="radius-box" :style="{ borderRadius: `var(--radius-${r})` }">
          <code>{{ r }}</code>
        </div>
      </div>
    </DocSection>

    <DocSection :title="s.semanticTitle" :desc="s.semanticDesc">
      <div class="radius-row">
        <div v-for="row in semantic" :key="row.token" class="radius-box radius-box--wide" :style="{ borderRadius: `var(${row.token})` }">
          <code>{{ row.token }}</code>
          <span>{{ t(row.use) }}</span>
        </div>
      </div>
    </DocSection>

    <DocSection :title="s.concentricTitle" :desc="s.concentricDesc">
      <Specimen :surfaces="['frost']" themes="single">
        <div class="concentric">
          <div class="concentric__panel">
            <div class="concentric__item concentric__item--on">{{ t(s.open) }}</div>
            <div class="concentric__item">{{ t(s.openInNewTab) }}</div>
          </div>
          <p class="doc-note">✓ --radius-float − --float-padding = --radius-item</p>
        </div>
        <div class="concentric">
          <div class="concentric__panel">
            <div class="concentric__item concentric__item--on concentric__item--wrong">{{ t(s.open) }}</div>
            <div class="concentric__item">{{ t(s.openInNewTab) }}</div>
          </div>
          <p class="doc-note">{{ t(s.wrongNote) }}</p>
        </div>
      </Specimen>
    </DocSection>
  </DocPage>
</template>

<style scoped>
.radius-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.radius-box {
  display: grid;
  place-content: center;
  gap: var(--space-0-5);
  width: 88px;
  height: 88px;
  border: var(--border-width) solid var(--border-default);
  background: var(--fill-subtle);
  text-align: center;
}

.radius-box--wide {
  width: 156px;
}

.radius-box code {
  font-family: var(--font-mono);
  font-size: var(--type-caption-size);
}

.radius-box span {
  color: var(--text-tertiary);
  font-size: var(--type-micro-size);
}

.concentric {
  display: grid;
  gap: var(--space-2);
}

.concentric__panel {
  width: 200px;
  padding: var(--float-padding);
  border-radius: var(--radius-float);
  border: var(--border-width) solid var(--border-default);
}

.concentric__item {
  height: var(--size-sm-h);
  display: flex;
  align-items: center;
  padding: 0 var(--space-2);
  border-radius: var(--radius-item);
  font-size: var(--type-body-sm-size);
}

.concentric__item--on {
  background: var(--fill-selected);
}

.concentric__item--wrong {
  border-radius: var(--radius-float);
}
</style>
