<script setup lang="ts">
import { computed } from "vue";
import { t, type Bi } from "../i18n";

type Surface = "paper" | "canvas" | "raised" | "frost";

const props = withDefaults(
  defineProps<{
    /** 展示底：纸面 / 画布 / 抬起面 / 霜（霜底下垫一层有色内容，检验可读性与整体性）。 */
    surfaces?: Surface[];
    /** both = 浅深并排；single = 跟随全局主题。 */
    themes?: "both" | "single";
    /** stack = 内容纵向排列；row = 横向换行排列。 */
    layout?: "row" | "stack";
    /** 单元格最小高度（浮层类演示需要空间）。 */
    minHeight?: string;
  }>(),
  { surfaces: () => ["paper"], themes: "both", layout: "row", minHeight: undefined },
);

const surfaceLabel: Record<Surface, Bi> = {
  paper: { zh: "纸面", en: "Paper" },
  canvas: { zh: "画布", en: "Canvas" },
  raised: { zh: "抬起面", en: "Raised" },
  frost: { zh: "霜面", en: "Frost" },
};

const s = {
  light: { zh: "浅色", en: "Light" },
  dark: { zh: "深色", en: "Dark" },
  currentTheme: { zh: "当前主题", en: "Current theme" },
  frostCopy: {
    zh: "霜面之下是真实内容：正文、图片、高亮与代码块。霜必须让上层文字保持可读，同时让人感到「底下还有东西」。",
    en: "Real content sits beneath the frost: body text, images, highlights, and code. The frost must keep upper-layer text legible while hinting there is more below.",
  },
  frostMark: { zh: "被荧光笔标记的一段原文", en: "A passage marked by the highlighter" },
  frostCite: {
    zh: "引用 [1] 指向文献库中的条目；锚点与来源永不丢失。AI 建议，用户确认。数据跨环节零摩擦流转。",
    en: "Citation [1] points to an entry in the library; anchors and sources are never lost. AI suggests, the user confirms. Data flows across the pipeline without friction.",
  },
} as const;

const themeList = computed(() =>
  props.themes === "both" ? (["light", "dark"] as const) : ([undefined] as const),
);

function themeLabel(theme: "light" | "dark" | undefined): string {
  return theme === "light" ? t(s.light) : theme === "dark" ? t(s.dark) : t(s.currentTheme);
}
</script>

<template>
  <div class="specimen" :style="{ '--specimen-cols': themeList.length }">
    <template v-for="surface in surfaces" :key="surface">
      <div
        v-for="theme in themeList"
        :key="`${surface}-${theme}`"
        class="specimen__cell"
        :class="`specimen__cell--${surface}`"
        :data-theme="theme"
        :style="minHeight ? { minHeight } : undefined"
      >
        <span class="specimen__label">
          {{ themeLabel(theme) }} · {{ t(surfaceLabel[surface]) }}
        </span>
        <div v-if="surface === 'frost'" class="specimen__backdrop" aria-hidden="true">
          <span class="specimen__blob specimen__blob--a" />
          <span class="specimen__blob specimen__blob--b" />
          <p>{{ t(s.frostCopy) }}</p>
          <p class="specimen__mark">{{ t(s.frostMark) }}</p>
          <p>{{ t(s.frostCite) }}</p>
        </div>
        <div class="specimen__stage" :class="[`specimen__stage--${layout}`, { 'mw-frost': surface === 'frost' }]">
          <slot />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.specimen {
  display: grid;
  grid-template-columns: repeat(var(--specimen-cols), minmax(0, 1fr));
  gap: var(--space-2);
}

.specimen__cell {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 120px;
  padding: var(--space-8) var(--space-5) var(--space-5);
  border-radius: var(--radius-card);
  border: var(--border-width) solid var(--border-subtle);
  color: var(--text-primary);
  overflow: hidden;
  isolation: isolate;
}

.specimen__cell--paper {
  background: var(--bg-surface);
}

.specimen__cell--canvas {
  background: var(--bg-canvas);
}

.specimen__cell--raised {
  background: var(--bg-raised);
}

.specimen__cell--frost {
  background: var(--bg-surface);
}

.specimen__label {
  position: absolute;
  top: var(--space-2-5);
  left: var(--space-3);
  z-index: 2;
  color: var(--text-tertiary);
  font-size: var(--type-micro-size);
  line-height: var(--type-micro-line);
  font-weight: var(--weight-medium);
}

.specimen__stage {
  position: relative;
  z-index: 1;
}

.specimen__stage--row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
}

.specimen__stage--stack {
  display: grid;
  gap: var(--space-3);
}

.specimen__stage.mw-frost {
  margin: var(--space-6) var(--space-4) 0;
  padding: var(--space-4);
  border-radius: var(--radius-float);
}

.specimen__backdrop {
  position: absolute;
  inset: 0;
  padding: var(--space-8) var(--space-5);
  color: var(--text-primary);
  font-size: var(--type-body-size);
  line-height: var(--type-body-line);
}

.specimen__backdrop p {
  margin: 0 0 var(--space-2);
}

.specimen__mark {
  display: inline-block;
  background: var(--color-mark-yellow-surface);
  padding: 0 var(--space-1);
}

.specimen__blob {
  position: absolute;
  border-radius: var(--radius-full);
  z-index: -1;
}

.specimen__blob--a {
  width: 180px;
  height: 180px;
  right: 8%;
  top: 18%;
  background: var(--accent);
}

.specimen__blob--b {
  width: 140px;
  height: 140px;
  left: 12%;
  bottom: -20px;
  background: var(--info);
}
</style>
