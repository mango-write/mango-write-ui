<script setup lang="ts">
import { ref } from "vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import { useTokenValues } from "../../kit/tokens";

const steps = [
  ["display-lg", "营销站主标题", "bold"],
  ["display", "营销站区块标题", "bold"],
  ["headline", "大标题（空态、引导）", "semibold"],
  ["title-lg", "页面标题", "semibold"],
  ["title", "卡片 / 对话框标题", "semibold"],
  ["title-sm", "分组标题", "semibold"],
  ["body-lg", "长文阅读", "regular"],
  ["body", "对话框正文、说明段落", "regular"],
  ["body-sm", "界面默认：控件、菜单、表格", "regular"],
  ["caption", "辅助说明、元信息", "regular"],
  ["micro", "徽标、极小标注", "medium"],
] as const;

const host = ref<HTMLElement | null>(null);
const { values } = useTokenValues(host, () =>
  steps.flatMap(([s]) => [`--type-${s}-size`, `--type-${s}-line`]),
);

function px(v: string | undefined) {
  if (!v) return "";
  const n = Number.parseFloat(v);
  return v.endsWith("rem") ? `${n * 16}px` : v;
}
</script>

<template>
  <DocPage lead="字号与行高成对出现，行高落在 4px 网格上。层级靠字重与颜色建立，不靠堆字号。">
    <DocSection title="字号阶" desc="界面默认是 body-sm；数据密集的工作台不出现 headline 以上。">
      <div ref="host" class="type-scale">
        <div v-for="[s, use, w] in steps" :key="s" class="type-step">
          <div class="type-step__meta">
            <code>{{ s }}</code>
            <span>{{ px(values[`--type-${s}-size`]) }} / {{ px(values[`--type-${s}-line`]) }}</span>
            <span>{{ use }}</span>
          </div>
          <div
            class="type-step__sample"
            :style="{
              fontSize: `var(--type-${s}-size)`,
              lineHeight: `var(--type-${s}-line)`,
              fontWeight: `var(--weight-${w})`,
              letterSpacing: s.startsWith('display') ? 'var(--tracking-display)' : s.startsWith('title') || s === 'headline' ? 'var(--tracking-title)' : undefined,
            }"
          >
            AI，你的科研伙伴 Research partner 2026
          </div>
        </div>
      </div>
    </DocSection>

    <DocSection title="字重" desc="只用四档。">
      <div class="doc-row" style="gap: var(--space-8)">
        <span v-for="w in ['regular', 'medium', 'semibold', 'bold']" :key="w" :style="{ fontWeight: `var(--weight-${w})`, fontSize: 'var(--type-title-lg-size)' }">
          {{ w }} 字重
        </span>
      </div>
      <ul class="doc-rules">
        <li><strong>regular</strong> 正文；<strong>medium</strong> 控件文字、字段名、选中项；<strong>semibold</strong> 标题；<strong>bold</strong> 仅营销展示。</li>
        <li data-kind="dont">不给正文加粗当强调；强调用 <span class="doc-code">--text-primary</span> 对比 <span class="doc-code">--text-secondary</span>。</li>
      </ul>
    </DocSection>

    <DocSection title="字族" desc="系统字体优先：macOS → 苹方 + SF，Windows → 微软雅黑 + Segoe。不自托管字体，跨平台字形差异是已知代价。">
      <div class="doc-stack">
        <div class="family"><code>--font-sans</code><span style="font-family: var(--font-sans)">界面与正文 Interface & body 0123456789</span></div>
        <div class="family"><code>--font-serif</code><span style="font-family: var(--font-serif)">论文排版预览 Manuscript preview 0123456789</span></div>
        <div class="family"><code>--font-mono</code><span style="font-family: var(--font-mono)">doi:10.1038/s41586 · ⌘K · 0123456789</span></div>
      </div>
    </DocSection>

    <DocSection title="长文" desc="body-lg + 行宽 --container-prose（约 40 个汉字）。">
      <div class="prose">
        <h3>研究方法</h3>
        <p>
          本研究采用混合方法设计，先通过半结构化访谈收集 24 位研究者的文献管理习惯，再以问卷验证访谈中提炼出的三类典型路径。
          所有引用都保留来源锚点，便于在写作阶段回到原文核对。Mixed methods let us triangulate qualitative insight with quantitative evidence.
        </p>
        <p class="prose__meta">更新于 2026-11-04 · 字数 1,284 · 引用 12</p>
      </div>
    </DocSection>

    <DocSection title="数字">
      <ul class="doc-rules">
        <li>年份、页码、引用数、时间、版本号等数据列加 <span class="doc-code">.mw-tabular</span>（等宽数字），刷新时宽度不跳。</li>
      </ul>
      <div class="doc-row" style="margin-top: var(--space-3); gap: var(--space-10)">
        <div class="doc-stack" style="gap: 0"><span>1,111</span><span>8,888</span><span class="doc-note">比例数字</span></div>
        <div class="doc-stack mw-tabular" style="gap: 0"><span>1,111</span><span>8,888</span><span class="doc-note">等宽数字</span></div>
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
