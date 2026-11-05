<script setup lang="ts">
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import Swatch from "../../kit/Swatch.vue";
import { t, type Bi } from "../../i18n";

interface SwatchRow {
  token: string;
  name: Bi;
  desc?: Bi;
}

const surfaces: SwatchRow[] = [
  { token: "--bg-canvas", name: { zh: "画布", en: "Canvas" }, desc: { zh: "壳底，浮岛之间露出的那层", en: "The shell base, showing between floating islands" } },
  { token: "--bg-surface", name: { zh: "纸面", en: "Paper" }, desc: { zh: "页面与工作区的默认底", en: "The default base for pages and workspaces" } },
  { token: "--bg-raised", name: { zh: "抬起面", en: "Raised" }, desc: { zh: "卡片、分组卡、表格", en: "Cards, grouped cards, tables" } },
  { token: "--bg-sunken", name: { zh: "凹陷面", en: "Sunken" }, desc: { zh: "代码块、只读井", en: "Code blocks, read-only wells" } },
  { token: "--bg-inverse", name: { zh: "反色", en: "Inverse" }, desc: { zh: "极少数强对比块", en: "Rare strong-contrast blocks" } },
];
const texts: SwatchRow[] = [
  { token: "--text-primary", name: { zh: "主要", en: "Primary" } },
  { token: "--text-secondary", name: { zh: "次要", en: "Secondary" } },
  { token: "--text-tertiary", name: { zh: "三级", en: "Tertiary" } },
  { token: "--text-disabled", name: { zh: "禁用（豁免）", en: "Disabled (exempt)" } },
  { token: "--text-accent", name: { zh: "强调 / 链接", en: "Accent / link" } },
];
const fills: SwatchRow[] = [
  { token: "--fill-subtle", name: { zh: "静息底", en: "Resting" } },
  { token: "--fill-default", name: { zh: "hover", en: "hover" } },
  { token: "--fill-strong", name: { zh: "按下", en: "Pressed" } },
  { token: "--fill-selected", name: { zh: "选中", en: "Selected" } },
];
const borders: SwatchRow[] = [
  { token: "--border-subtle", name: { zh: "分隔线", en: "Separator" } },
  { token: "--border-default", name: { zh: "控件边", en: "Control border" } },
  { token: "--border-strong", name: { zh: "hover / 强调", en: "hover / emphasis" } },
];
const status = ["accent", "danger", "success", "warning", "info"] as const;
const statusName: Record<(typeof status)[number], Bi> = {
  accent: { zh: "强调", en: "Accent" },
  danger: { zh: "危险", en: "Danger" },
  success: { zh: "成功", en: "Success" },
  warning: { zh: "警告", en: "Warning" },
  info: { zh: "信息", en: "Info" },
};
const mango = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const paper = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
const carbon = [50, 100, 200, 300, 700, 750, 800, 850, 900, 950];

function rowLabel(row: SwatchRow): Bi {
  return row.desc ? { zh: `${row.name.zh} · ${row.desc.zh}`, en: `${row.name.en} · ${row.desc.en}` } : row.name;
}

const s = {
  surfacesTitle: { zh: "面", en: "Surfaces" },
  surfacesDesc: {
    zh: "从低到高。深色下层级靠亮度递增表达，阴影只负责分离。",
    en: "Low to high. In the dark theme, layers climb via brightness; shadows only separate.",
  },
  textsTitle: { zh: "文字", en: "Text" },
  textsDesc: {
    zh: "比值为在纸面上的实测对比度；primary / secondary / tertiary / accent 均 ≥ 4.5:1（单测锁死）。",
    en: "Ratios are measured contrast on paper; primary / secondary / tertiary / accent all reach ≥ 4.5:1 (locked by unit tests).",
  },
  fillsTitle: { zh: "填充与边框", en: "Fills & borders" },
  fillsDesc: {
    zh: "全部是墨色的半透明叠层：纸面与霜面上读感一致，霜面不会被打断。",
    en: "All are translucent overlays of ink: they read the same on paper and frost, so the frost is never interrupted.",
  },
  statusTitle: { zh: "强调与状态", en: "Accent & status" },
  statusDesc: {
    zh: "每种语义四件套：实色（只给图标、圆点、实心按钮）、subtle 底、border 边、text 文字。状态色永远配图标或文字。",
    en: "Each semantic color ships four pieces: a solid (icons, dots, and solid buttons only), a subtle fill, a border, and a text color. Status colors always pair with an icon or text.",
  },
  paletteTitle: { zh: "色板", en: "Palette" },
  paletteDesc: {
    zh: "原料层，组件不直接使用。芒果橙是唯一品牌色；纸与炭是浅深两套暖中性。",
    en: "The raw layer; components never use it directly. Mango orange is the only brand color; paper and carbon are warm neutrals for light and dark.",
  },
} as const;
</script>

<template>
  <DocPage>
    <DocSection :title="s.surfacesTitle" :desc="s.surfacesDesc">
      <Specimen layout="stack">
        <Swatch v-for="row in surfaces" :key="row.token" :token="row.token" :label="rowLabel(row)" />
      </Specimen>
    </DocSection>

    <DocSection :title="s.textsTitle" :desc="s.textsDesc">
      <Specimen layout="stack">
        <Swatch v-for="row in texts" :key="row.token" :token="row.token" :label="row.name" text />
      </Specimen>
    </DocSection>

    <DocSection :title="s.fillsTitle" :desc="s.fillsDesc">
      <Specimen :surfaces="['paper', 'frost']">
        <div class="tint-row">
          <div v-for="row in fills" :key="row.token" class="tint" :style="{ background: `var(${row.token})` }">
            <b>{{ t(row.name) }}</b><code>{{ row.token }}</code>
          </div>
          <div v-for="row in borders" :key="row.token" class="tint" :style="{ boxShadow: `inset 0 0 0 1px var(${row.token})` }">
            <b>{{ t(row.name) }}</b><code>{{ row.token }}</code>
          </div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.statusTitle" :desc="s.statusDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <div v-for="st in status" :key="st" class="status-row">
          <span class="status-row__name">{{ t(statusName[st]) }}</span>
          <span class="status-dot" :style="{ background: `var(--${st})` }" />
          <span
            class="status-pill"
            :style="{
              background: `var(--${st}-subtle)`,
              boxShadow: `inset 0 0 0 1px var(--${st}-border)`,
              color: st === 'accent' ? 'var(--text-accent)' : `var(--${st}-text)`,
            }"
          >subtle · border · text</span>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.paletteTitle" :desc="s.paletteDesc">
      <div class="palette">
        <div class="palette__row">
          <span class="palette__name">mango</span>
          <span v-for="n in mango" :key="n" class="palette__chip" :style="{ background: `var(--palette-mango-${n})` }" :title="`--palette-mango-${n}`">{{ n }}</span>
        </div>
        <div class="palette__row">
          <span class="palette__name">paper</span>
          <span v-for="n in paper" :key="n" class="palette__chip" :style="{ background: `var(--palette-paper-${n})` }" :title="`--palette-paper-${n}`">{{ n }}</span>
        </div>
        <div class="palette__row">
          <span class="palette__name">carbon</span>
          <span v-for="n in carbon" :key="n" class="palette__chip" :style="{ background: `var(--palette-carbon-${n})` }" :title="`--palette-carbon-${n}`">{{ n }}</span>
        </div>
      </div>
    </DocSection>
  </DocPage>
</template>

<style scoped>
.tint-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
  gap: var(--space-2);
  width: 100%;
}

.tint {
  display: grid;
  gap: var(--space-0-5);
  padding: var(--space-2-5);
  border-radius: var(--radius-md);
}

.tint b {
  font-size: var(--type-caption-size);
  font-weight: var(--weight-medium);
}

.tint code {
  color: var(--text-tertiary);
  font-size: var(--type-micro-size);
  font-family: var(--font-mono);
}

.status-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.status-row__name {
  width: 40px;
  color: var(--text-secondary);
  font-size: var(--type-caption-size);
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
}

.status-pill {
  padding: var(--space-0-5) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--type-caption-size);
  font-weight: var(--weight-medium);
}

.palette {
  display: grid;
  gap: var(--space-2);
}

.palette__row {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.palette__name {
  width: 64px;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: var(--type-caption-size);
}

.palette__chip {
  flex: 1;
  display: grid;
  place-items: end start;
  height: 48px;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  box-shadow: inset 0 0 0 1px var(--border-subtle);
  font-family: var(--font-mono);
  font-size: var(--type-micro-size);
  color: var(--text-secondary);
  mix-blend-mode: normal;
}
</style>
