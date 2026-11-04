<script setup lang="ts">
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import Swatch from "../../kit/Swatch.vue";

const surfaces = [
  ["--bg-canvas", "画布", "壳底，浮岛之间露出的那层"],
  ["--bg-surface", "纸面", "页面与工作区的默认底"],
  ["--bg-raised", "抬起面", "卡片、分组卡、表格"],
  ["--bg-sunken", "凹陷面", "代码块、只读井"],
  ["--bg-inverse", "反色", "极少数强对比块"],
];
const texts = [
  ["--text-primary", "主要"],
  ["--text-secondary", "次要"],
  ["--text-tertiary", "三级"],
  ["--text-disabled", "禁用（豁免）"],
  ["--text-accent", "强调 / 链接"],
];
const fills = [
  ["--fill-subtle", "静息底"],
  ["--fill-default", "hover"],
  ["--fill-strong", "按下"],
  ["--fill-selected", "选中"],
];
const borders = [
  ["--border-subtle", "分隔线"],
  ["--border-default", "控件边"],
  ["--border-strong", "hover / 强调"],
];
const status = ["accent", "danger", "success", "warning", "info"] as const;
const statusName: Record<(typeof status)[number], string> = {
  accent: "强调",
  danger: "危险",
  success: "成功",
  warning: "警告",
  info: "信息",
};
const mango = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const paper = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
const carbon = [50, 100, 200, 300, 700, 750, 800, 850, 900, 950];
</script>

<template>
  <DocPage lead="颜色只有三类工作：分层（面）、阅读（文字）、指向（强调与状态）。除了实心动作面，组件里的一切颜色都是半透明叠层。">
    <DocSection title="面" desc="从低到高。深色下层级靠亮度递增表达，阴影只负责分离。">
      <Specimen layout="stack">
        <Swatch v-for="s in surfaces" :key="s[0]" :token="s[0]" :label="`${s[1]} · ${s[2]}`" />
      </Specimen>
    </DocSection>

    <DocSection title="文字" desc="比值为在纸面上的实测对比度；primary / secondary / tertiary / accent 均 ≥ 4.5:1（单测锁死）。">
      <Specimen layout="stack">
        <Swatch v-for="t in texts" :key="t[0]" :token="t[0]" :label="t[1]" text />
      </Specimen>
    </DocSection>

    <DocSection title="填充与边框" desc="全部是墨色的半透明叠层：纸面与霜面上读感一致，霜面不会被打断。">
      <Specimen :surfaces="['paper', 'frost']">
        <div class="tint-row">
          <div v-for="f in fills" :key="f[0]" class="tint" :style="{ background: `var(${f[0]})` }">
            <b>{{ f[1] }}</b><code>{{ f[0] }}</code>
          </div>
          <div v-for="b in borders" :key="b[0]" class="tint" :style="{ boxShadow: `inset 0 0 0 1px var(${b[0]})` }">
            <b>{{ b[1] }}</b><code>{{ b[0] }}</code>
          </div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection
      title="强调与状态"
      desc="每种语义四件套：实色（只给图标、圆点、实心按钮）、subtle 底、border 边、text 文字。状态色永远配图标或文字。"
    >
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <div v-for="s in status" :key="s" class="status-row">
          <span class="status-row__name">{{ statusName[s] }}</span>
          <span class="status-dot" :style="{ background: `var(--${s})` }" />
          <span
            class="status-pill"
            :style="{
              background: `var(--${s}-subtle)`,
              boxShadow: `inset 0 0 0 1px var(--${s}-border)`,
              color: s === 'accent' ? 'var(--text-accent)' : `var(--${s}-text)`,
            }"
          >subtle · border · text</span>
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="色板" desc="原料层，组件不直接使用。芒果橙是唯一品牌色；纸与炭是浅深两套暖中性。">
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
