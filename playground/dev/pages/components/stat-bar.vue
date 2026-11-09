<script setup lang="ts">
import { computed } from "vue";
import { StatBar, StatCard } from "@mango-write/ui-vue";
import { api } from "../../api/entries/stat-bar";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/stat-bar";

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  do1: {
    zh: "在看板或列表页顶部并排展示 3–6 个核心运行指标时使用无边框的 <code>StatBar</code>。",
    en: "Use borderless <code>StatBar</code> to display 3–6 headline operational metrics atop a board or list.",
  },
  do2: {
    zh: "在详情页头部展示单实体的关键属性摘要并附带局部动作（如「充值明细」）时使用凹陷底的 <code>StatCard</code>。",
    en: "Use sunken <code>StatCard</code> blocks to summarize key entity attributes with optional inline actions.",
  },
  dont1: {
    zh: "单张卡片只承载一个核心数字或状态，不要在 <code>StatCard</code> 内塞入多行长表单。",
    en: "Keep one core metric per card; do not stuff multi-row forms inside <code>StatCard</code>.",
  },
  dont2: {
    zh: "正常健康指标使用默认色（<code>default</code>），仅在需要引导视线关注异常或主指标时使用语义色。",
    en: "Use <code>default</code> for normal metrics; reserve semantic tones for anomalies or primary highlights.",
  },
  barTitle: { zh: "紧凑指标条（StatBar）", en: "Compact metric strip (StatBar)" },
  barDesc: {
    zh: "无边框水平流式排列，数值固定采用等宽字体（tabular-nums），适合高密度大盘头部。",
    en: "Borderless horizontal layout with tabular-nums figures for high-density dashboard headers.",
  },
  cardTitle: { zh: "概览指标卡（StatCard）", en: "Summary metric card (StatCard)" },
  cardDesc: {
    zh: "采用凹陷面（--bg-sunken）与细边框，右上角可挂载轻量动作按钮。",
    en: "Built on the sunken surface (--bg-sunken) with a hairline border and an optional top-right action button.",
  },
  tonesTitle: { zh: "语义色调", en: "Semantic tones" },
  tonesDesc: {
    zh: "五种色调在 StatBar 与 StatCard 下的浅深主题对比。",
    en: "All five semantic tones across StatBar and StatCard in light and dark themes.",
  },
  colBar: { zh: "StatBar 指标项", en: "StatBar item" },
  colCard: { zh: "StatCard 指标卡", en: "StatCard" },
  api: { zh: "接口", en: "API" },
} as const;

const toneRows = [
  {
    tone: "default" as const,
    label: { zh: "默认", en: "Default" },
    metricLabel: { zh: "总用户数", en: "Total users" },
    value: "12,840",
    sub: { zh: "较上周 +4.2%", en: "+4.2% vs last wk" },
  },
  {
    tone: "accent" as const,
    label: { zh: "主色", en: "Accent" },
    metricLabel: { zh: "今日活跃", en: "Active today" },
    value: "1,429",
    sub: { zh: "峰值 14:00", en: "Peak 14:00" },
  },
  {
    tone: "success" as const,
    label: { zh: "成功", en: "Success" },
    metricLabel: { zh: "队列健康度", en: "Queue health" },
    value: "99.98%",
    sub: { zh: "0 积压", en: "0 backlog" },
  },
  {
    tone: "warning" as const,
    label: { zh: "警告", en: "Warning" },
    metricLabel: { zh: "限流告警", en: "Rate alerts" },
    value: "2",
    sub: { zh: "待核查", en: "Pending check" },
  },
  {
    tone: "danger" as const,
    label: { zh: "危险", en: "Danger" },
    metricLabel: { zh: "死信任务", en: "Dead letters" },
    value: "1",
    sub: { zh: "需人工重试", en: "Needs retry" },
  },
] as const;

const barItems = computed(() =>
  toneRows.map((r) => ({
    key: r.tone,
    label: t(r.metricLabel),
    value: r.value,
    sub: t(r.sub),
    tone: r.tone,
  })),
);
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

    <DocSection :title="s.barTitle" :desc="s.barDesc">
      <Specimen themes="both" layout="stack">
        <StatBar :items="barItems" />
      </Specimen>
    </DocSection>

    <DocSection :title="s.cardTitle" :desc="s.cardDesc">
      <Specimen themes="both" layout="stack">
        <div class="stat-card-grid">
          <StatCard
            :label="t(toneRows[0].metricLabel)"
            :value="toneRows[0].value"
            :sub="t(toneRows[0].sub)"
          />
          <StatCard
            :label="t(toneRows[1].metricLabel)"
            :value="toneRows[1].value"
            :sub="t(toneRows[1].sub)"
            tone="accent"
            :action-label="t({ zh: '明细', en: 'Details' })"
          />
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.tonesTitle" :desc="s.tonesDesc">
      <Specimen themes="both" layout="stack">
        <StateGrid :columns="[s.colBar, s.colCard]" label-width="56px">
          <StateRow v-for="r in toneRows" :key="r.tone" :label="r.label">
            <StatBar
              :items="[{ label: t(r.metricLabel), value: r.value, sub: t(r.sub), tone: r.tone }]"
              style="width: 112px"
            />
            <StatCard
              :label="t(r.metricLabel)"
              :value="r.value"
              :sub="t(r.sub)"
              :tone="r.tone"
              style="width: 156px"
            />
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
.stat-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-3);
  width: 100%;
}
</style>
