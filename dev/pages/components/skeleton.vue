<script setup lang="ts">
import { Skeleton } from "../../../src";
import { api } from "../../api/entries/skeleton";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/skeleton";

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "文献列表、卡片详情或用户名片首次加载时，按真实字高与间距组合矩形和圆形骨架。",
    en: "On first load of reference lists, card details, or user cards, combine rectangles and circles matching the real text heights and spacing.",
  },
  rule2: {
    zh: "骨架构件自动标记 <code>aria-hidden=\"true\"</code>，应在最外层容器上声明加载状态（如 <code>aria-busy=\"true\"</code>）。",
    en: "Skeleton pieces are automatically <code>aria-hidden=\"true\"</code>; declare the loading state on the outermost container (e.g. <code>aria-busy=\"true\"</code>).",
  },
  rule3: {
    zh: "极短操作（&lt; 200ms）不要闪现骨架屏；未知结构的弹窗提交等待请用按钮内置 <code>loading</code>。",
    en: "Don't flash a skeleton for very short operations (&lt; 200ms); for dialogs of unknown duration use the button's built-in <code>loading</code>.",
  },
  rule4: {
    zh: "不要把骨架画得比真实内容更密集，一般 2–3 行文本块足以传达结构。",
    en: "Don't draw the skeleton denser than the real content; 2–3 text blocks usually convey the structure.",
  },
  baseTitle: { zh: "底面", en: "Surfaces" },
  baseDesc: {
    zh: "纸面与霜面并排。骨架底色取 --fill-default，柔光扫掠（wave）叠加同系半透明高光，在深浅主题与霜面上均自然融合。",
    en: "Paper and frost side by side. The fill is --fill-default; the wave sweep adds a translucent highlight in the same family, blending into both themes and frost.",
  },
  shapesTitle: { zh: "形态与尺寸", en: "Shapes and sizes" },
  shapesDesc: {
    zh: "支持矩形（rectangle）与圆形（circle）；可通过 size 同时指定宽高，或分别传入 width / height / borderRadius。",
    en: "Rectangle and circle shapes; set width and height together with size, or pass width / height / borderRadius individually.",
  },
  statesTitle: { zh: "状态", en: "States" },
  statesDesc: {
    zh: "柔光扫掠动画（wave）与静态占位（none）在各几何形态下的对比。开启系统「减少动态效果」时自动停用扫掠动画。",
    en: "Wave sweep vs static (none) across shapes; the sweep disables automatically under the system's reduced-motion setting.",
  },
  colTextRow: { zh: "文本行", en: "Text lines" },
  colAvatar: { zh: "圆形头像", en: "Round avatar" },
  colPill: { zh: "胶囊标签", en: "Pill" },
  colThumb: { zh: "缩略图块", en: "Thumbnail" },
  rowWave: { zh: "流光 wave", en: "Wave" },
  rowNone: { zh: "静态 none", en: "Static" },
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
      <Specimen :surfaces="['paper', 'frost']">
        <div style="display: flex; align-items: flex-start; gap: 12px; width: 100%; max-width: 340px">
          <Skeleton shape="circle" size="40px" />
          <div style="flex: 1; display: grid; gap: 8px">
            <Skeleton width="45%" height="14px" />
            <Skeleton width="90%" height="12px" />
            <Skeleton width="70%" height="12px" />
          </div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.shapesTitle" :desc="s.shapesDesc">
      <Specimen themes="single" layout="stack">
        <div class="doc-row" style="gap: 16px">
          <Skeleton shape="circle" size="28px" />
          <Skeleton shape="circle" size="40px" />
          <Skeleton shape="rectangle" size="40px" border-radius="var(--radius-md)" />
          <Skeleton width="120px" height="28px" border-radius="var(--radius-full)" />
        </div>
        <div style="display: grid; gap: 8px; max-width: 480px">
          <Skeleton width="35%" height="18px" />
          <Skeleton width="100%" height="12px" />
          <Skeleton width="92%" height="12px" />
          <Skeleton width="64%" height="12px" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.statesTitle" :desc="s.statesDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colTextRow, s.colAvatar, s.colPill, s.colThumb]" label-width="88px">
          <StateRow :label="s.rowWave">
            <div style="width: 140px; display: grid; gap: 6px">
              <Skeleton width="100%" height="12px" animation="wave" />
              <Skeleton width="70%" height="12px" animation="wave" />
            </div>
            <Skeleton shape="circle" size="36px" animation="wave" />
            <Skeleton width="84px" height="24px" border-radius="var(--radius-full)" animation="wave" />
            <Skeleton width="96px" height="52px" border-radius="var(--radius-md)" animation="wave" />
          </StateRow>
          <StateRow :label="s.rowNone">
            <div style="width: 140px; display: grid; gap: 6px">
              <Skeleton width="100%" height="12px" animation="none" />
              <Skeleton width="70%" height="12px" animation="none" />
            </div>
            <Skeleton shape="circle" size="36px" animation="none" />
            <Skeleton width="84px" height="24px" border-radius="var(--radius-full)" animation="none" />
            <Skeleton width="96px" height="52px" border-radius="var(--radius-md)" animation="none" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
