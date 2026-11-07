<script setup lang="ts">
import { ref } from "vue";
import { Calendar, DatePicker } from "../../../src";
import { api } from "../../api/entries/calendar";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/calendar";

const now = new Date();
const y = now.getFullYear();
const m = String(now.getMonth() + 1).padStart(2, "0");

const sharedDate = ref<Date | null>(new Date(y, now.getMonth(), 12));
const rangeDates = ref<Array<Date | null>>([
  new Date(y, now.getMonth(), 6),
  new Date(y, now.getMonth(), 14),
]);
const journalDay = ref<string | null>(`${y}-${m}-18`);
const journalDays: Record<string, number> = {
  [`${y}-${m}-03`]: 1,
  [`${y}-${m}-07`]: 3,
  [`${y}-${m}-11`]: 1,
  [`${y}-${m}-12`]: 2,
  [`${y}-${m}-18`]: 4,
  [`${y}-${m}-22`]: 1,
  [`${y}-${m}-25`]: 2,
};

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；点击左上角年月标题可展开霜面 12 月快选面板，切换到其他月份会出现「回到今天」。",
    en: "Tweak options for a live preview; click the year-month title to open the frost 12-month quick switcher, and navigate to another month to reveal “Back to today”.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "侧栏或工作台常驻月历：如手记（Notebook）右栏按日热力筛选、实验排期总览。",
    en: "Persistent sidebar or workbench calendars, such as the research log right-rail activity filter or experiment schedule overview.",
  },
  rule2: {
    zh: "与 <code>DatePicker</code> 相辅相成：表单字段内收起输入用 <code>DatePicker</code>（其弹出层内部即 <code>Calendar variant=\"plain\"</code>），常驻展开浏览用 <code>Calendar</code>。",
    en: "Complements <code>DatePicker</code>: use <code>DatePicker</code> for collapsed form inputs (whose popover embeds <code>Calendar variant=\"plain\"</code>), and <code>Calendar</code> for always-visible month browsing.",
  },
  rule3: {
    zh: "需要呈现每日记录密度时传入 <code>days</code>（<code>Record&lt;YYYY-MM-DD, number&gt;</code>），配合 <code>onlySelectableWithDays</code> 只允许点选有记录的日期。",
    en: "Pass <code>days</code> (<code>Record&lt;YYYY-MM-DD, number&gt;</code>) to visualize daily entry density, and pair with <code>onlySelectableWithDays</code> when only days with entries should be clickable.",
  },
  baseTitle: { zh: "底面与手记热力模式", en: "Surfaces and activity heat" },
  baseDesc: {
    zh: "左侧为标准单日选择面板，右侧为手记（Research Log）热力筛选面板（1 条记录浅橙着色、≥2 条实心品牌色、选中日加深强调）。",
    en: "Standard single-date panel on the left, and the Research Log activity heat panel on the right (1 entry in subtle tint, ≥2 entries in solid brand fill, selected day in pressed accent).",
  },
  stdAria: { zh: "标准日期面板", en: "Standard calendar panel" },
  heatAria: { zh: "手记热力日期面板", en: "Activity heat calendar panel" },
  pairTitle: { zh: "与 DatePicker 联动", en: "Paired with DatePicker" },
  pairDesc: {
    zh: "DatePicker 与 Calendar 共享同一份日期模型与紧凑网格几何：在上方输入框键入或下拉点选，下方常驻面板同步响应。",
    en: "DatePicker and Calendar share the same date model and compact grid geometry: type or pick in the input above and the inline panel stays in sync.",
  },
  pairPickerAria: { zh: "联动日期选择框", en: "Synced date picker" },
  pairCalendarAria: { zh: "联动常驻日期面板", en: "Synced inline calendar" },
  rangeAria: { zh: "区间日期面板", en: "Range calendar panel" },
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
        <li data-kind="do" v-html="t(s.rule3)" />
      </ul>
    </DocSection>

    <DocSection :title="s.baseTitle" :desc="s.baseDesc">
      <Specimen :surfaces="['paper', 'canvas']" layout="row">
        <Calendar v-model="sharedDate" :aria-label="t(s.stdAria)" />
        <Calendar
          v-model:selected="journalDay"
          :days="journalDays"
          only-selectable-with-days
          :aria-label="t(s.heatAria)"
        />
      </Specimen>
    </DocSection>

    <DocSection :title="s.pairTitle" :desc="s.pairDesc">
      <Specimen themes="single" layout="row">
        <div class="doc-stack">
          <DatePicker
            v-model="sharedDate"
            show-icon
            show-clear
            show-button-bar
            :aria-label="t(s.pairPickerAria)"
          />
          <Calendar v-model="sharedDate" :aria-label="t(s.pairCalendarAria)" />
        </div>
        <Calendar
          v-model="rangeDates"
          selection-mode="range"
          :aria-label="t(s.rangeAria)"
        />
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
