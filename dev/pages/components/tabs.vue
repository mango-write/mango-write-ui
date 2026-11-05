<script setup lang="ts">
import { ref } from "vue";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "../../../src";
import { api } from "../../api/entries/tabs";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/tabs";

const activeTab = ref("outline");
const frostTab = ref("notes");

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  do1: {
    zh: "切换并列的内容子视图（如「大纲 / 批注 / 引用」），且各页签结构独立。",
    en: "Switching between parallel sub-views (e.g. “outline / notes / references”) where each tab is structurally independent.",
  },
  do2: {
    zh: "页签数控制在 2–6 个，标签简洁（2–6 字）。",
    en: "Keep the tab count between 2 and 6, with short labels (2–6 characters).",
  },
  dont1: {
    zh: "只切同一列表的筛选条件或视图密度时用 <code>SelectButton</code>。",
    en: "Use a <code>SelectButton</code> when only toggling filters or view density of the same list.",
  },
  dont2: {
    zh: "不要嵌套两层水平 <code>Tabs</code>；二级分区改用侧栏或分段控件。",
    en: "Don't nest two levels of horizontal <code>Tabs</code>; use a sidebar or segmented control for the second level.",
  },
  surfaceTitle: { zh: "底面", en: "Surface" },
  surfaceDesc: {
    zh: "纸面与霜面并排。页签底边使用 --border-subtle，激活指示条使用 --accent。",
    en: "Paper and frost side by side. The tab underline sits on --border-subtle; the active indicator uses --accent.",
  },
  tabOutline: { zh: "章节大纲", en: "Outline" },
  tabNotes: { zh: "阅读批注", en: "Notes" },
  tabRefs: { zh: "参考文献", en: "References" },
  tabHistory: { zh: "历史版本", en: "History" },
  panelOutline: {
    zh: "1. 引言 · 2. 相关工作 · 3. 实验设计与语料评估",
    en: "1. Introduction · 2. Related work · 3. Experimental setup and corpus evaluation",
  },
  panelNotes: {
    zh: "共 12 条高亮批注，3 条待合并至正文草稿。",
    en: "12 highlight notes in total, 3 pending merge into the draft.",
  },
  panelRefs: {
    zh: "已引用 28 篇文献（GB/T 7714 格式校验通过）。",
    en: "28 references cited (GB/T 7714 format check passed).",
  },
  themeTitle: { zh: "深浅主题对照", en: "Light and dark comparison" },
  themeDesc: {
    zh: "支持键盘 Home / End / 左右方向键切换与禁用项跳过；当容器窄于标签总宽时，标签条在溢出出口自动呈现 12px 边缘渐隐。",
    en: "Supports Home / End / arrow keys with disabled tabs skipped; when the container is narrower than the labels, the strip fades out over 12px at the overflow edge.",
  },
  tabNotesList: { zh: "批注列表", en: "Notes" },
  tabFigures: { zh: "图表索引", en: "Figures" },
  tabCitations: { zh: "引文核校", en: "Citation checks" },
  tabExperiments: { zh: "消融实验", en: "Ablations" },
  tabAppendix: { zh: "补充材料", en: "Supplementary" },
  tabLocked: { zh: "审阅意见（只读）", en: "Review comments (read-only)" },
  panelNotesList: {
    zh: "第 4 页锚点：模型在小样本条件下表现显著优于基线。",
    en: "Page 4 anchor: the model significantly outperforms the baseline in few-shot conditions.",
  },
  panelFigures: {
    zh: "图 1 架构总览 · 图 2 消融实验对比 · 表 1 数据集统计",
    en: "Figure 1 architecture overview · Figure 2 ablation comparison · Table 1 dataset statistics",
  },
  panelCitations: {
    zh: "共 28 处正文引用，全部与题录库双向锚定。",
    en: "28 in-text citations, all bidirectionally anchored to the reference library.",
  },
  panelExperiments: {
    zh: "3 组超参数网格与显著性检验结果已同步。",
    en: "3 hyperparameter grids and significance-test results synced.",
  },
  panelAppendix: {
    zh: "附表 A1–A4 与原始评估脚本清单。",
    en: "Appendix tables A1–A4 and the list of original evaluation scripts.",
  },
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
        <li data-kind="do" v-html="t(s.do1)" />
        <li data-kind="do" v-html="t(s.do2)" />
        <li data-kind="dont" v-html="t(s.dont1)" />
        <li data-kind="dont" v-html="t(s.dont2)" />
      </ul>
    </DocSection>

    <DocSection :title="s.surfaceTitle" :desc="s.surfaceDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <Tabs v-model:value="activeTab">
          <TabList>
            <Tab value="outline">{{ t(s.tabOutline) }}</Tab>
            <Tab value="notes">{{ t(s.tabNotes) }}</Tab>
            <Tab value="refs">{{ t(s.tabRefs) }}</Tab>
            <Tab value="history" disabled>{{ t(s.tabHistory) }}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="outline">
              <p class="doc-note">{{ t(s.panelOutline) }}</p>
            </TabPanel>
            <TabPanel value="notes">
              <p class="doc-note">{{ t(s.panelNotes) }}</p>
            </TabPanel>
            <TabPanel value="refs">
              <p class="doc-note">{{ t(s.panelRefs) }}</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Specimen>
    </DocSection>

    <DocSection :title="s.themeTitle" :desc="s.themeDesc">
      <Specimen themes="both" layout="stack">
        <Tabs v-model:value="frostTab">
          <TabList>
            <Tab value="notes">{{ t(s.tabNotesList) }}</Tab>
            <Tab value="figures">{{ t(s.tabFigures) }}</Tab>
            <Tab value="citations">{{ t(s.tabCitations) }}</Tab>
            <Tab value="experiments">{{ t(s.tabExperiments) }}</Tab>
            <Tab value="appendix">{{ t(s.tabAppendix) }}</Tab>
            <Tab value="locked" disabled>{{ t(s.tabLocked) }}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="notes">
              <p class="doc-note">{{ t(s.panelNotesList) }}</p>
            </TabPanel>
            <TabPanel value="figures">
              <p class="doc-note">{{ t(s.panelFigures) }}</p>
            </TabPanel>
            <TabPanel value="citations">
              <p class="doc-note">{{ t(s.panelCitations) }}</p>
            </TabPanel>
            <TabPanel value="experiments">
              <p class="doc-note">{{ t(s.panelExperiments) }}</p>
            </TabPanel>
            <TabPanel value="appendix">
              <p class="doc-note">{{ t(s.panelAppendix) }}</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
