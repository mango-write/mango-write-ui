<script setup lang="ts">
import { ref } from "vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import { useTokenValues } from "../../kit/tokens";
import { t } from "../../i18n";

const steps = [
  { token: "display-lg", use: { zh: "营销站主标题", en: "Marketing hero titles" }, w: "bold" },
  { token: "display", use: { zh: "营销站区块标题", en: "Marketing section titles" }, w: "bold" },
  { token: "headline", use: { zh: "大标题（空态、引导）", en: "Display headlines (empty states, onboarding)" }, w: "semibold" },
  { token: "title-lg", use: { zh: "页面标题", en: "Page titles" }, w: "semibold" },
  { token: "title", use: { zh: "卡片 / 对话框标题", en: "Card and dialog titles" }, w: "semibold" },
  { token: "title-sm", use: { zh: "分组标题", en: "Group titles" }, w: "semibold" },
  { token: "body-lg", use: { zh: "长文阅读", en: "Long-form reading" }, w: "regular" },
  { token: "body", use: { zh: "对话框正文、说明段落", en: "Dialog body, explanatory paragraphs" }, w: "regular" },
  { token: "body-sm", use: { zh: "界面默认：控件、菜单、表格", en: "Interface default: controls, menus, tables" }, w: "regular" },
  { token: "caption", use: { zh: "辅助说明、元信息", en: "Hints, metadata" }, w: "regular" },
  { token: "micro", use: { zh: "徽标、极小标注", en: "Badges, tiny annotations" }, w: "medium" },
] as const;

const host = ref<HTMLElement | null>(null);
const { values } = useTokenValues(host, () =>
  steps.flatMap(({ token }) => [`--type-${token}-size`, `--type-${token}-line`]),
);

function px(v: string | undefined) {
  if (!v) return "";
  const n = Number.parseFloat(v);
  return v.endsWith("rem") ? `${n * 16}px` : v;
}

const s = {
  scaleTitle: { zh: "字号阶", en: "Type scale" },
  scaleDesc: {
    zh: "界面默认是 body-sm；数据密集的工作台不出现 headline 以上。",
    en: "body-sm is the interface default; data-dense workbenches never go above headline.",
  },
  sample: { zh: "AI，你的科研伙伴 Research partner 2026", en: "AI, your research partner 2026" },
  weightsTitle: { zh: "字重", en: "Weights" },
  weightsDesc: { zh: "只用四档。", en: "Four weights, nothing else." },
  weight: { zh: "字重", en: "weight" },
  weightRule1: {
    zh: "<strong>regular</strong> 正文；<strong>medium</strong> 控件文字、字段名、选中项；<strong>semibold</strong> 标题；<strong>bold</strong> 仅营销展示。",
    en: "<strong>regular</strong> body text; <strong>medium</strong> control labels, field names, selected items; <strong>semibold</strong> titles; <strong>bold</strong> marketing display only.",
  },
  weightRule2: {
    zh: "不给正文加粗当强调；强调用 <span class=\"doc-code\">--text-primary</span> 对比 <span class=\"doc-code\">--text-secondary</span>。",
    en: "Don't fake emphasis by bolding body text; use the <span class=\"doc-code\">--text-primary</span> vs <span class=\"doc-code\">--text-secondary</span> contrast instead.",
  },
  familyTitle: { zh: "字族", en: "Font families" },
  familyDesc: {
    zh: "系统字体优先：macOS → 苹方 + SF，Windows → 微软雅黑 + Segoe。不自托管字体，跨平台字形差异是已知代价。",
    en: "System fonts first: macOS → PingFang + SF, Windows → Microsoft YaHei + Segoe. No self-hosted fonts; cross-platform glyph differences are a known tradeoff.",
  },
  familySans: { zh: "界面与正文 Interface & body 0123456789", en: "Interface & body 界面与正文 0123456789" },
  familySerif: { zh: "论文排版预览 Manuscript preview 0123456789", en: "Manuscript preview 论文排版预览 0123456789" },
  proseTitle: { zh: "长文", en: "Long-form" },
  proseDesc: {
    zh: "body-lg + 行宽 --container-prose（约 40 个汉字）。",
    en: "body-lg plus the --container-prose measure (about 40 CJK characters).",
  },
  proseHeading: { zh: "研究方法", en: "Research methods" },
  proseBody: {
    zh: "本研究采用混合方法设计，先通过半结构化访谈收集 24 位研究者的文献管理习惯，再以问卷验证访谈中提炼出的三类典型路径。所有引用都保留来源锚点，便于在写作阶段回到原文核对。Mixed methods let us triangulate qualitative insight with quantitative evidence.",
    en: "This study uses a mixed-methods design: we first collected the reference-management habits of 24 researchers through semi-structured interviews, then validated the three typical pathways distilled from them with a questionnaire. All citations keep their source anchors so the writing stage can return to the original text. Mixed methods let us triangulate qualitative insight with quantitative evidence.",
  },
  proseMeta: { zh: "更新于 2026-11-04 · 字数 1,284 · 引用 12", en: "Updated 2026-11-04 · 1,284 words · 12 citations" },
  numTitle: { zh: "数字", en: "Numbers" },
  numRule: {
    zh: "年份、页码、引用数、时间、版本号等数据列加 <span class=\"doc-code\">.mw-tabular</span>（等宽数字），刷新时宽度不跳。",
    en: "Data columns like years, page numbers, citation counts, times, and version numbers get <span class=\"doc-code\">.mw-tabular</span> (tabular figures) so widths never jump on refresh.",
  },
  proportional: { zh: "比例数字", en: "Proportional" },
  tabular: { zh: "等宽数字", en: "Tabular" },
} as const;
</script>

<template>
  <DocPage>
    <DocSection :title="s.scaleTitle" :desc="s.scaleDesc">
      <div ref="host" class="type-scale">
        <div v-for="step in steps" :key="step.token" class="type-step">
          <div class="type-step__meta">
            <code>{{ step.token }}</code>
            <span>{{ px(values[`--type-${step.token}-size`]) }} / {{ px(values[`--type-${step.token}-line`]) }}</span>
            <span>{{ t(step.use) }}</span>
          </div>
          <div
            class="type-step__sample"
            :style="{
              fontSize: `var(--type-${step.token}-size)`,
              lineHeight: `var(--type-${step.token}-line)`,
              fontWeight: `var(--weight-${step.w})`,
              letterSpacing: step.token.startsWith('display') ? 'var(--tracking-display)' : step.token.startsWith('title') || step.token === 'headline' ? 'var(--tracking-title)' : undefined,
            }"
          >
            {{ t(s.sample) }}
          </div>
        </div>
      </div>
    </DocSection>

    <DocSection :title="s.weightsTitle" :desc="s.weightsDesc">
      <div class="doc-row" style="gap: var(--space-8)">
        <span v-for="w in ['regular', 'medium', 'semibold', 'bold']" :key="w" :style="{ fontWeight: `var(--weight-${w})`, fontSize: 'var(--type-title-lg-size)' }">
          {{ w }} {{ t(s.weight) }}
        </span>
      </div>
      <ul class="doc-rules">
        <li v-html="t(s.weightRule1)" />
        <li data-kind="dont" v-html="t(s.weightRule2)" />
      </ul>
    </DocSection>

    <DocSection :title="s.familyTitle" :desc="s.familyDesc">
      <div class="doc-stack">
        <div class="family"><code>--font-sans</code><span style="font-family: var(--font-sans)">{{ t(s.familySans) }}</span></div>
        <div class="family"><code>--font-serif</code><span style="font-family: var(--font-serif)">{{ t(s.familySerif) }}</span></div>
        <div class="family"><code>--font-mono</code><span style="font-family: var(--font-mono)">doi:10.1038/s41586 · ⌘K · 0123456789</span></div>
      </div>
    </DocSection>

    <DocSection :title="s.proseTitle" :desc="s.proseDesc">
      <div class="prose">
        <h3>{{ t(s.proseHeading) }}</h3>
        <p>{{ t(s.proseBody) }}</p>
        <p class="prose__meta">{{ t(s.proseMeta) }}</p>
      </div>
    </DocSection>

    <DocSection :title="s.numTitle">
      <ul class="doc-rules">
        <li v-html="t(s.numRule)" />
      </ul>
      <div class="doc-row" style="margin-top: var(--space-3); gap: var(--space-10)">
        <div class="doc-stack" style="gap: 0"><span>1,111</span><span>8,888</span><span class="doc-note">{{ t(s.proportional) }}</span></div>
        <div class="doc-stack mw-tabular" style="gap: 0"><span>1,111</span><span>8,888</span><span class="doc-note">{{ t(s.tabular) }}</span></div>
      </div>
    </DocSection>
  </DocPage>
</template>

<style scoped>
.type-scale {
  display: grid;
}

.type-step {
  display: grid;
  grid-template-columns: 200px 1fr;
  align-items: baseline;
  gap: var(--space-6);
  padding: var(--space-3) 0;
  border-bottom: var(--border-width) solid var(--border-subtle);
}

.type-step__meta {
  display: grid;
  gap: var(--space-0-5);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
  color: var(--text-tertiary);
}

.type-step__meta code {
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-weight: var(--weight-medium);
}

.type-step__sample {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.family {
  display: grid;
  grid-template-columns: 120px 1fr;
  align-items: baseline;
  gap: var(--space-4);
  font-size: var(--type-title-size);
}

.family code {
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: var(--type-caption-size);
}

.prose {
  max-width: var(--container-prose);
  font-size: var(--type-body-lg-size);
  line-height: var(--type-body-lg-line);
}

.prose h3 {
  margin: 0 0 var(--space-2);
  font-size: var(--type-title-lg-size);
  line-height: var(--type-title-lg-line);
  font-weight: var(--weight-semibold);
}

.prose p {
  margin: 0 0 var(--space-3);
}

.prose__meta {
  color: var(--text-tertiary);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
}
</style>
