<script setup lang="ts">
import { computed, ref } from "vue";
import { AsyncSlot, Button, SelectButton } from "../../../src";
import { api } from "../../api/entries/async-slot";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/async-slot";

type Status = "loading" | "empty" | "error" | "ready";
const status = ref<Status>("ready");

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  do1: {
    zh: "所有依赖接口数据的列表、卡片组与详情区一律包裹 <code>AsyncSlot</code>。",
    en: "Wrap every list, card group, and detail area that depends on API data in <code>AsyncSlot</code>.",
  },
  do2: {
    zh: "空态必须给 <code>emptyTitle</code> 或 <code>#empty</code>，引导用户完成下一步动作。",
    en: "An empty state must provide <code>emptyTitle</code> or <code>#empty</code> to guide the user to the next action.",
  },
  dont1: {
    zh: "不要在业务页面手写 <code>v-if=\"loading\" ... v-else-if=\"error\"</code> 裸切。",
    en: "Don't hand-roll <code>v-if=\"loading\" ... v-else-if=\"error\"</code> switches in business pages.",
  },
  switchTitle: { zh: "交互切换与底面", en: "Interactive switching and surfaces" },
  switchDesc: {
    zh: "点击分段控件切换四态，观察 180ms 区域级交叉淡入与纸/霜双面表现。",
    en: "Switch the four states with the segmented control and watch the 180ms region-level cross-fade on paper and frost.",
  },
  switchAria: { zh: "切换异步状态", en: "Switch async state" },
  statusReady: { zh: "就绪 (ready)", en: "Ready (ready)" },
  statusLoading: { zh: "加载中 (loading)", en: "Loading (loading)" },
  statusEmpty: { zh: "空态 (empty)", en: "Empty (empty)" },
  statusError: { zh: "错误 (error)", en: "Error (error)" },
  emptyTitleText: { zh: "尚无文库条目", en: "No library entries yet" },
  emptyHintText: {
    zh: "拖入 PDF 或从浏览器插件一键采集文献。",
    en: "Drag in PDFs or collect references in one click from the browser extension.",
  },
  loadSampleBtn: { zh: "载入示例文献", en: "Load sample references" },
  demoCard1Note: {
    zh: "Vaswani et al. · NeurIPS 2017 · 已解析全文锚点",
    en: "Vaswani et al. · NeurIPS 2017 · full-text anchors parsed",
  },
  demoCard2Note: {
    zh: "He et al. · CVPR 2016 · 14 条阅读批注",
    en: "He et al. · CVPR 2016 · 14 reading notes",
  },
  skeletonTitle: { zh: "骨架形态（list / card / text）", en: "Skeleton shapes (list / card / text)" },
  skeletonDesc: {
    zh: "加载态骨架形状应与真实内容保持一致。",
    en: "Loading skeletons should mirror the shape of the real content.",
  },
  api: { zh: "接口", en: "API" },
} as const;

/* SelectButton 直读字符串 label,状态选项按当前语言重建 */
const statusOptions = computed(() => [
  { label: t(s.statusReady), value: "ready" },
  { label: t(s.statusLoading), value: "loading" },
  { label: t(s.statusEmpty), value: "empty" },
  { label: t(s.statusError), value: "error" },
]);
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
      </ul>
    </DocSection>

    <DocSection :title="s.switchTitle" :desc="s.switchDesc">
      <div class="doc-row" style="margin-bottom: var(--space-3)">
        <SelectButton
          v-model="status"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          :allow-empty="false"
          size="sm"
          :aria-label="t(s.switchAria)"
        />
      </div>
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <AsyncSlot
          :status="status"
          skeleton="list"
          empty-title="common.async.empty"
          @retry="status = 'ready'"
        >
          <template #empty>
            <div style="text-align: center; padding: var(--space-3)">
              <p style="margin: 0 0 var(--space-2); font-weight: var(--weight-semibold)">{{ t(s.emptyTitleText) }}</p>
              <p class="doc-note" style="margin: 0 0 var(--space-3)">{{ t(s.emptyHintText) }}</p>
              <Button size="sm" @click="status = 'ready'">{{ t(s.loadSampleBtn) }}</Button>
            </div>
          </template>
          <div style="display: flex; flex-direction: column; gap: var(--space-2)">
            <div style="padding: var(--space-2-5); border-radius: var(--radius-md); background: var(--fill-subtle)">
              <strong>Attention Is All You Need</strong>
              <p class="doc-note" style="margin: var(--space-1) 0 0">{{ t(s.demoCard1Note) }}</p>
            </div>
            <div style="padding: var(--space-2-5); border-radius: var(--radius-md); background: var(--fill-subtle)">
              <strong>Deep Residual Learning for Image Recognition</strong>
              <p class="doc-note" style="margin: var(--space-1) 0 0">{{ t(s.demoCard2Note) }}</p>
            </div>
          </div>
        </AsyncSlot>
      </Specimen>
    </DocSection>

    <DocSection :title="s.skeletonTitle" :desc="s.skeletonDesc">
      <Specimen themes="both" layout="stack">
        <AsyncSlot status="loading" skeleton="card" />
        <AsyncSlot status="loading" skeleton="text" />
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
