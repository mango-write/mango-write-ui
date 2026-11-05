<script setup lang="ts">
import { BookOpen, ExternalLink } from "lucide-vue-next";
import { Button, HoverCard, Tag, UserCard, UserChip, type UserProfile } from "../../../src";
import { api } from "../../api/entries/hover-card";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const authorProfile: UserProfile = {
  id: "u-lin-2026",
  handle: "@lin_wei",
  name: "林蔚",
  badge: "通讯作者",
  role: "地球系统模式实验室 · 研究员",
  email: "linwei@example.edu.cn",
  description: "主要从事海气耦合模式、极端降水归因与科学智能辅助写作研究。",
};
</script>

<template>
  <DocPage
    lead="悬停富卡片：指针悬停或键盘聚焦锚点 150ms 后展开厚霜卡片，用于在不离开阅读流的前提下预览引用文献、成员名片或术语释义。不带箭头，靠紧凑间距表达锚定关系。"
  >
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">正文内联锚点的上下文预览：引用角标 <code>[1]</code>、协作者 <code>UserChip</code>、双链笔记标题。</li>
        <li data-kind="do">面板内含链接或操作按钮时保持默认 <code>interactive: true</code>，用户可将指针移入卡片或按 Tab 键进入。</li>
        <li data-kind="dont">单行纯文本提示（如工具栏图标说明）用 <code>v-tooltip</code> 指令。</li>
        <li data-kind="dont">锚点本身已是可聚焦控件（<code>Button</code> / <code>a</code>）时，务必传 <code>:focusable="false"</code> 避免双重 Tab 停靠。</li>
      </ul>
    </DocSection>

    <DocSection
      title="底面与阅读流预览"
      desc="将指针悬停或 Tab 聚焦至引用角标与成员纸片体验延迟展开；下方同时给出静态卡片样式供对照。"
    >
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <p style="margin: 0; font-size: var(--type-body-size); line-height: var(--type-body-line)">
          对流参数化方案的不确定性仍是区域气候预估的主要误差来源
          <HoverCard placement="top" label="引用文献详情">
            <span class="cite-anchor">[1]</span>
            <template #content>
              <div class="cite-card">
                <div class="cite-card__meta">
                  <Tag severity="primary" rounded>Nature · 2024</Tag>
                  <span class="doc-note">被引 142 次</span>
                </div>
                <strong class="cite-card__title">
                  Convective parameterization uncertainty in high-resolution climate projections
                </strong>
                <span class="cite-card__authors">Lin, W., Zhang, H., &amp; Vance, E.</span>
                <div class="doc-row" style="justify-content: space-between; margin-top: var(--space-1)">
                  <span class="doc-note">10.1038/s41586-024-07123-x</span>
                  <Button size="xs" variant="text" :icon="ExternalLink" label="定位文库" />
                </div>
              </div>
            </template>
          </HoverCard>
          ，本节由
          <HoverCard placement="bottom" label="成员名片">
            <UserChip :user="authorProfile" :show-card="false" />
            <template #content>
              <UserCard :user="authorProfile" />
            </template>
          </HoverCard>
          负责补充模拟对比实验。
        </p>

        <div class="hovercard-static mw-frost mw-frost--thick">
          <div class="cite-card">
            <div class="cite-card__meta">
              <Tag severity="info" rounded>静态解剖预览</Tag>
              <span class="doc-note">.mw-hovercard__panel--card</span>
            </div>
            <strong class="cite-card__title">Attention Is All You Need</strong>
            <span class="cite-card__authors">Vaswani, A., Shazeer, N., Parmar, N., et al. · NeurIPS 2017</span>
          </div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection
      title="弹出方向"
      desc="支持 top（默认）/ right / bottom / left 四向；当首选方向放不下且对侧空间更充裕时自动翻转，并在滚动期间实时跟随锚点。"
    >
      <Specimen themes="single">
        <HoverCard
          v-for="p in (['top', 'right', 'bottom', 'left'] as const)"
          :key="p"
          :placement="p"
          :focusable="false"
          label="方向预览"
        >
          <Button size="sm" severity="secondary" :label="`placement=${p}`" />
          <template #content>
            <div class="cite-card" style="max-width: 220px">
              <strong class="cite-card__title">方向：{{ p }}</strong>
              <span class="cite-card__authors">视口系 fixed 定位，内部容器滚动时紧跟锚点不漂移。</span>
            </div>
          </template>
        </HoverCard>
      </Specimen>
    </DocSection>

    <DocSection title="状态与交互模式" desc="区分可交互卡片（role='dialog'）与纯展示提示（interactive=false, role='tooltip'）。">
      <Specimen themes="both">
        <StateGrid
          :columns="['可交互 (默认)', '纯提示 (interactive=false)', '包裹按钮 (focusable=false)', '块级盒 (block)', '禁用 (disabled)']"
          label-width="76px"
        >
          <StateRow label="悬停体验">
            <HoverCard label="可交互卡片">
              <span class="cite-anchor">[可移入点击]</span>
              <template #content>
                <div class="cite-card" style="max-width: 220px">
                  <strong class="cite-card__title">支持指针停留与 Tab 进入</strong>
                  <Button size="xs" variant="tinted" :icon="BookOpen" label="打开原文" />
                </div>
              </template>
            </HoverCard>

            <HoverCard :interactive="false">
              <span class="cite-anchor">[纯提示模式]</span>
              <template #content>
                <div class="cite-card" style="max-width: 220px">
                  <span class="cite-card__authors">pointer-events: none，指针移出锚点即收起。</span>
                </div>
              </template>
            </HoverCard>

            <HoverCard :focusable="false" label="按钮悬浮说明">
              <Button size="sm" severity="secondary" label="无双重 Tab" />
              <template #content>
                <span class="doc-note">触发器本身可聚焦，设 focusable=false。</span>
              </template>
            </HoverCard>

            <HoverCard block label="整行悬停">
              <div class="block-anchor">整行块级锚点</div>
              <template #content>
                <span class="doc-note">block=true 时外层 wrapper 为 display: block。</span>
              </template>
            </HoverCard>

            <HoverCard disabled>
              <span class="cite-anchor" style="opacity: var(--opacity-disabled)">[已禁用]</span>
              <template #content>
                <span>不会弹出</span>
              </template>
            </HoverCard>
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
.cite-anchor {
  display: inline-flex;
  align-items: center;
  padding: 0 var(--space-1-5);
  border-radius: var(--radius-xs);
  background: var(--accent-subtle);
  color: var(--text-accent);
  font-family: var(--font-mono);
  font-size: var(--type-caption-size);
  font-weight: var(--weight-medium);
  cursor: pointer;
}

.cite-card {
  display: grid;
  gap: var(--space-1-5);
  max-width: 280px;
}

.cite-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.cite-card__title {
  color: var(--text-primary);
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
  font-weight: var(--weight-semibold);
}

.cite-card__authors {
  color: var(--text-secondary);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
}

.hovercard-static {
  max-width: 300px;
  padding: var(--space-3);
  border-radius: var(--radius-float);
}

.block-anchor {
  padding: var(--space-1) var(--space-2-5);
  border-radius: var(--radius-sm);
  background: var(--fill-default);
  font-size: var(--type-caption-size);
}
</style>
