<script setup lang="ts">
import { ProgressSpinner } from "../../../src";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const sizes = [
  { label: "行内 16px", size: "16px", stroke: "5" },
  { label: "紧凑 24px", size: "24px", stroke: "4" },
  { label: "默认 40px", size: "40px", stroke: "4" },
  { label: "面板 56px", size: "56px", stroke: "3" },
] as const;
</script>

<template>
  <DocPage lead="环形加载指示器（ProgressSpinner）：用于局部容器、异步面板或行内状态的轻量等待指示，圆弧描边默认跟随品牌色或继承文本颜色。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">异步拉取局部数据（如检索候选列表、加载预览面板）且无法预估具体百分比时。</li>
        <li data-kind="do">通过 CSS 变量 <code>--mw-progress-spinner-size</code> 调整外框尺寸，并按比例微调 <code>strokeWidth</code>。</li>
        <li data-kind="dont">首次渲染已知版式结构的列表或卡片时，优先用 <code>Skeleton</code> 骨架占位以减少布局跳动。</li>
        <li data-kind="dont">不要在同一视口内同时旋转多个大号加载环；整块异步区域可直接交给 <code>AsyncSlot</code> 管理。</li>
      </ul>
    </DocSection>

    <DocSection title="底面" desc="纸面与霜面并排。默认描边取 --accent，也可通过设置 color 让其跟随次级文本色。">
      <Specimen :surfaces="['paper', 'frost']">
        <ProgressSpinner aria-label="正在加载文献详情" />
        <div class="doc-row" style="gap: 8px">
          <ProgressSpinner style="--mw-progress-spinner-size: 20px; color: var(--text-secondary)" stroke-width="4" aria-label="同步中" />
          <span class="doc-note">正在校验引用锚点…</span>
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="尺寸与描边" desc="默认尺寸为 --space-10（40px）。小尺寸建议加粗 strokeWidth（如 5），大尺寸建议减细（如 3）以保持视觉描边均衡。">
      <Specimen themes="single">
        <div v-for="s in sizes" :key="s.label" class="doc-row" style="gap: 10px; margin-right: 16px">
          <ProgressSpinner
            :style="{ '--mw-progress-spinner-size': s.size }"
            :stroke-width="s.stroke"
            :aria-label="s.label"
          />
          <span class="doc-note">{{ s.label }}</span>
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="状态" desc="不同描边粗细、动画周期与色彩继承在浅色、深色主题下的表现。">
      <Specimen themes="both">
        <StateGrid :columns="['默认 (stroke 4)', '细描边 (stroke 2.5)', '粗描边 (stroke 6)', '次要色继承', '慢速周期 (3.5s)']" label-width="72px">
          <StateRow label="40px">
            <ProgressSpinner aria-label="默认加载" />
            <ProgressSpinner stroke-width="2.5" aria-label="细描边加载" />
            <ProgressSpinner stroke-width="6" aria-label="粗描边加载" />
            <ProgressSpinner style="color: var(--text-secondary)" aria-label="次要色加载" />
            <ProgressSpinner animation-duration="3.5s" aria-label="慢速加载" />
          </StateRow>
          <StateRow label="24px">
            <ProgressSpinner style="--mw-progress-spinner-size: 24px" aria-label="默认小号" />
            <ProgressSpinner style="--mw-progress-spinner-size: 24px" stroke-width="2.5" aria-label="细描边小号" />
            <ProgressSpinner style="--mw-progress-spinner-size: 24px" stroke-width="6" aria-label="粗描边小号" />
            <ProgressSpinner style="--mw-progress-spinner-size: 24px; color: var(--text-secondary)" aria-label="次要色小号" />
            <ProgressSpinner style="--mw-progress-spinner-size: 24px" animation-duration="3.5s" aria-label="慢速小号" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <table class="doc-table">
        <thead>
          <tr><th>属性 / CSS 变量</th><th>取值</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><code>strokeWidth</code></td><td><code>string | number</code></td><td>SVG 圆环描边宽度（基于 50×50 viewBox）；默认 <code>"4"</code></td></tr>
          <tr><td><code>fill</code></td><td><code>string</code></td><td>圆环内部填充色；默认 <code>"none"</code></td></tr>
          <tr><td><code>animationDuration</code></td><td><code>string</code></td><td>外层旋转周期；默认 <code>"2s"</code></td></tr>
          <tr><td><code>ariaLabel</code></td><td><code>string</code></td><td>无障碍 <code>progressbar</code> 标签说明</td></tr>
          <tr><td><code>--mw-progress-spinner-size</code></td><td><code>&lt;length&gt;</code></td><td>控制宽高尺寸的 CSS 变量；默认 <code>var(--space-10)</code></td></tr>
        </tbody>
      </table>
    </DocSection>
  </DocPage>
</template>
