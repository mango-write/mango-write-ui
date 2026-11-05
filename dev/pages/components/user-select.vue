<script setup lang="ts">
import { computed, ref } from "vue";
import { UserSelect, type UserSelectOption } from "../../../src";
import { api } from "../../api/entries/user-select";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/user-select";

/* UserSelect 直读字符串字段,假成员按当前语言整体重建 */
const members = computed<UserSelectOption[]>(() => [
  { id: "u-lin", name: t({ zh: "林知夏", en: "Lin Zhixia" }), email: "zhixia.lin@lab.edu.cn" },
  { id: "u-chen", name: t({ zh: "陈序", en: "Chen Xu" }), email: "xu.chen@lab.edu.cn" },
  { id: "u-zhou", name: t({ zh: "周予安", en: "Zhou Yu'an" }), email: "yuan.zhou@lab.edu.cn" },
  { id: "u-su", name: t({ zh: "苏航", en: "Su Hang" }), email: "hang.su@institute.org" },
  { id: "u-wang", name: t({ zh: "王书言", en: "Wang Shuyan" }), email: "shuyan.wang@institute.org" },
]);

const reviewers = ref<string[]>(["u-lin", "u-chen"]);
const emptyUsers = ref<string[]>([]);
const allPicked = ref<string[]>(["u-lin", "u-chen", "u-zhou", "u-su"]);

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "在团队空间、草稿协作者、批注指派中选择一或多名成员。",
    en: "Picking one or more members for team spaces, draft collaborators, or annotation assignments.",
  },
  rule2: {
    zh: "窄宽度下自动将放不下的成员胶囊折叠为 <code>+N</code>，保持单行高度稳定。",
    en: "At narrow widths, overflowing member pills fold into <code>+N</code> while the single-line height stays stable.",
  },
  rule3: {
    zh: "仅仅只读展示负责人或作者列表时，直接用 <code>UserChip</code>。",
    en: "For a read-only lead or author list, use <code>UserChip</code> directly.",
  },
  baseTitle: { zh: "底面", en: "Surfaces" },
  baseDesc: {
    zh: "纸面与霜面并排。内部复用 UserChip（关闭悬浮名片避免与下拉交互冲突），支持输入姓名或邮箱前缀直接筛选。",
    en: "Paper and frost side by side. Internally reuses UserChip (hover card off to avoid clashing with the dropdown) and filters by name or email prefix as you type.",
  },
  reviewerPh: {
    zh: "输入姓名或邮箱添加审稿协作者…",
    en: "Type a name or email to add reviewers…",
  },
  narrowTitle: { zh: "窄宽折叠", en: "Narrow-width folding" },
  narrowDesc: {
    zh: "在对话框侧栏或紧凑过滤条中，超出可用宽度的成员胶囊自动归并计数。",
    en: "In dialog sidebars or compact filter bars, member pills that overflow fold into a count.",
  },
  narrowNote: { zh: "窄容器 240px", en: "Narrow container 240px" },
  wideNote: { zh: "宽容器自适应", en: "Wide container" },
  states: { zh: "状态", en: "States" },
  statesDesc: {
    zh: "支持键盘上下选择、回车切换选中、Backspace 删除末尾成员。",
    en: "Move with the arrow keys, toggle with Enter, remove the last member with Backspace.",
  },
  colEmpty: { zh: "空态占位", en: "Empty" },
  colSelected: { zh: "已选成员", en: "Selected" },
  colNarrow: { zh: "窄宽折叠", en: "Folded" },
  colDisabled: { zh: "禁用", en: "Disabled" },
  defaultRow: { zh: "默认", en: "Default" },
  collabPh: { zh: "选择协作者…", en: "Pick collaborators…" },
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
      </ul>
    </DocSection>

    <DocSection :title="s.baseTitle" :desc="s.baseDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <UserSelect
          v-model="reviewers"
          :users="members"
          :placeholder="t(s.reviewerPh)"
        />
      </Specimen>
    </DocSection>

    <DocSection :title="s.narrowTitle" :desc="s.narrowDesc">
      <Specimen themes="single" layout="stack">
        <div class="doc-row">
          <span class="doc-note" style="width: 88px">{{ t(s.narrowNote) }}</span>
          <div style="width: 240px">
            <UserSelect v-model="allPicked" :users="members" />
          </div>
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 88px">{{ t(s.wideNote) }}</span>
          <div style="flex: 1; min-width: 280px">
            <UserSelect v-model="allPicked" :users="members" />
          </div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.states" :desc="s.statesDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colEmpty, s.colSelected, s.colNarrow, s.colDisabled]" label-width="48px">
          <StateRow :label="s.defaultRow">
            <div style="width: 200px">
              <UserSelect v-model="emptyUsers" :users="members" :placeholder="t(s.collabPh)" />
            </div>
            <div style="width: 240px">
              <UserSelect v-model="reviewers" :users="members" />
            </div>
            <div style="width: 180px">
              <UserSelect v-model="allPicked" :users="members" />
            </div>
            <div style="width: 220px">
              <UserSelect v-model="reviewers" :users="members" disabled />
            </div>
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
