<script setup lang="ts">
import { computed } from "vue";
import { BookOpen, CheckCircle2, Clock, Sparkles, Tag as TagIcon, TriangleAlert } from "lucide-vue-next";
import { Tag } from "@mango-write/ui-vue";
import { api } from "../../api/entries/tag";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/tag";

const severities = [
  { label: { zh: "主色", en: "Primary" }, value: "primary", text: { zh: "期刊论文", en: "Journal article" } },
  { label: { zh: "次要", en: "Secondary" }, value: "secondary", text: { zh: "预印本", en: "Preprint" } },
  { label: { zh: "成功", en: "Success" }, value: "success", text: { zh: "已核验", en: "Verified" } },
  { label: { zh: "信息", en: "Info" }, value: "info", text: { zh: "同步中", en: "Syncing" } },
  { label: { zh: "警告", en: "Warning" }, value: "warning", text: { zh: "待补全", en: "Incomplete" } },
  { label: { zh: "危险", en: "Danger" }, value: "danger", text: { zh: "引用缺失", en: "Citation missing" } },
  { label: { zh: "反色", en: "Contrast" }, value: "contrast", text: { zh: "置顶", en: "Pinned" } },
] as const;

/* Tag 直读字符串字段,演示行按当前语言重建 */
const severityRows = computed(() => severities.map((sv) => ({ ...sv, text: t(sv.text) })));

const sizes = ["xs", "sm", "md", "lg"] as const;

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "标记条目的分类、阶段或状态：「已核验」「预印本」「DOI 已解析」。",
    en: "Mark an entry's category, stage, or state: “Verified”, “Preprint”, “DOI resolved”.",
  },
  rule2: {
    zh: "需要圆润胶囊外观时开启 <code>rounded</code>；可搭配图标增强辨识度。",
    en: "Turn on <code>rounded</code> for the capsule look; pair with an icon for faster recognition.",
  },
  rule3: {
    zh: "纯数字角标或未读圆点请用 <code>Badge</code>；需要用户交互删除的筛选项请用 <code>Chip</code>。",
    en: "For numeric badges or unread dots use <code>Badge</code>; for filter terms the user removes, use <code>Chip</code>.",
  },
  rule4: {
    zh: "不要把 <code>Tag</code> 当作主按钮使用；它默认是静态或轻度可点击的元信息载体。",
    en: "Don't use <code>Tag</code> as a primary button; by default it is a static or lightly clickable metadata carrier.",
  },
  baseTitle: { zh: "底面", en: "Surfaces" },
  baseDesc: {
    zh: "纸面与霜面并排。柔和着色底在两种底面上均保持充足的文字对比度。",
    en: "Paper and frost side by side; the tinted fill keeps ample text contrast on both surfaces.",
  },
  aiExtract: { zh: "AI 提炼", en: "AI extract" },
  anchored: { zh: "锚点已对齐", en: "Anchors aligned" },
  parsing: { zh: "后台解析", en: "Parsing" },
  metaPending: { zh: "元数据待确认", en: "Metadata pending" },
  sizesTitle: { zh: "尺寸", en: "Sizes" },
  sizesDesc: {
    zh: "自身不设独立 size 属性，直接跟随容器的 .mw-size-* 密度上下文缩放高度、字号与图标。",
    en: "No size prop of its own; height, font size, and icon follow the container's .mw-size-* density context.",
  },
  reading: { zh: "文献精读", en: "Close reading" },
  archived: { zh: "已归档", en: "Archived" },
  statesTitle: { zh: "状态", en: "States" },
  statesDesc: {
    zh: "各语义色在标准圆角、胶囊圆角（rounded）、带图标与胶囊图标下的表现。",
    en: "Each tone in standard radius, capsule (rounded), with icon, and capsule with icon.",
  },
  colStandard: { zh: "标准圆角", en: "Standard" },
  colRounded: { zh: "胶囊 rounded", en: "Rounded" },
  colIcon: { zh: "带图标", en: "With icon" },
  colCapsuleIcon: { zh: "胶囊 + 图标", en: "Rounded + icon" },
  api: { zh: "接口", en: "API" },
} as const;
</script>

<template>
  <DocPage>
    <DocSection :title="s.demo" :desc="s.demoDesc">
      <UsagePlayground :entry="usage" />
    </DocSection>
    <DocSection :title="s.whenToUse">
      <ul class="doc-rules">
        <li data-kind="do" v-html="t(s.rule1)" />
        <li data-kind="do" v-html="t(s.rule2)" />
        <li data-kind="dont" v-html="t(s.rule3)" />
        <li data-kind="dont" v-html="t(s.rule4)" />
      </ul>
    </DocSection>

    <DocSection :title="s.baseTitle" :desc="s.baseDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <div class="doc-row">
          <Tag v-for="sv in severityRows" :key="sv.value" :severity="sv.value" :value="sv.text" />
        </div>
        <div class="doc-row">
          <Tag severity="primary" rounded :icon="Sparkles" :value="t(s.aiExtract)" />
          <Tag severity="success" rounded :icon="CheckCircle2" :value="t(s.anchored)" />
          <Tag severity="info" rounded :icon="Clock" :value="t(s.parsing)" />
          <Tag severity="warning" rounded :icon="TriangleAlert" :value="t(s.metaPending)" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.sizesTitle" :desc="s.sizesDesc">
      <Specimen themes="single" layout="stack">
        <div v-for="sz in sizes" :key="sz" class="doc-row" :class="`mw-size-${sz}`">
          <span class="doc-note" style="width: 24px">{{ sz }}</span>
          <Tag severity="primary" :icon="BookOpen" :value="t(s.reading)" />
          <Tag severity="secondary" value="2026" />
          <Tag severity="success" rounded :value="t(s.archived)" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.statesTitle" :desc="s.statesDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colStandard, s.colRounded, s.colIcon, s.colCapsuleIcon]" label-width="88px">
          <StateRow v-for="sv in severityRows" :key="sv.value" :label="sv.label">
            <Tag :severity="sv.value" :value="sv.text" />
            <Tag :severity="sv.value" rounded :value="sv.text" />
            <Tag :severity="sv.value" :icon="TagIcon" :value="sv.text" />
            <Tag :severity="sv.value" rounded :icon="BookOpen" :value="sv.text" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
