<script setup lang="ts">
import { AtSign, Loader2, Search, X } from "lucide-vue-next";
import { IconField, InputIcon, InputText } from "@mango-write/ui-vue";
import { api } from "../../api/entries/icon-field";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/icon-field";

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "图标说明输入的性质（搜索、@ 提及），或表达异步状态（检索中）。",
    en: "The icon states what the input is for (search, @ mentions) or an async state (searching).",
  },
  rule2: {
    zh: "左右各放一个：左侧说明，右侧状态。",
    en: "One on each side: the left explains, the right shows status.",
  },
  rule3: {
    zh: "图标本身不可点击（<code>pointer-events: none</code>）；需要可点的清除 / 提交按钮时用 <code>InputGroup</code> 拼按钮。",
    en: "Icons aren't clickable (<code>pointer-events: none</code>); use <code>InputGroup</code> for clickable clear / submit buttons.",
  },
  rule4: {
    zh: "不要用图标代替文字标签。",
    en: "Don't replace a text label with an icon.",
  },
  surfaces: { zh: "底面", en: "Surfaces" },
  surfacesDesc: {
    zh: "纸面与霜面并排；检索框常放在弹出层顶部。",
    en: "Paper and frost side by side; search fields often sit at the top of popups.",
  },
  searchLibrary: { zh: "搜索文献库：标题、作者、DOI", en: "Search the library: title, author, DOI" },
  mentionMember: { zh: "提及团队成员", en: "Mention a team member" },
  density: { zh: "密度", en: "Density" },
  densityDesc: {
    zh: "IconField 读容器的 --control-*：把 .mw-size-* 挂在 IconField 或它的容器上，图标与内距一起换档（不要只给内部 InputText 传 size）。",
    en: "IconField reads the container's --control-*: put .mw-size-* on the IconField or its container and icon and padding switch tiers together (don't pass size only to the inner InputText).",
  },
  searchDrafts: { zh: "检索草稿", en: "Search drafts" },
  states: { zh: "状态", en: "States" },
  colEmpty: { zh: "空", en: "Empty" },
  colFilled: { zh: "有值", en: "Filled" },
  colDisabled: { zh: "禁用", en: "Disabled" },
  colReadonly: { zh: "只读", en: "Readonly" },
  colInvalid: { zh: "错误", en: "Invalid" },
  leadingIcon: { zh: "左图标", en: "Leading icon" },
  trailingIcon: { zh: "右图标", en: "Trailing icon" },
  search: { zh: "搜索", en: "Search" },
  member: { zh: "成员", en: "Member" },
  memberName: { zh: "李明", en: "Li Ming" },
  unknownMember: { zh: "未知成员", en: "Unknown member" },
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

    <DocSection :title="s.surfaces" :desc="s.surfacesDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <IconField>
          <InputIcon><Search /></InputIcon>
          <InputText :placeholder="t(s.searchLibrary)" fluid />
        </IconField>
        <IconField>
          <InputIcon><AtSign /></InputIcon>
          <InputText :placeholder="t(s.mentionMember)" fluid />
          <InputIcon><Loader2 class="doc-spin" /></InputIcon>
        </IconField>
      </Specimen>
    </DocSection>

    <DocSection :title="s.density" :desc="s.densityDesc">
      <Specimen themes="single" layout="stack">
        <div v-for="size in (['xs', 'sm', 'md', 'lg'] as const)" :key="size" class="doc-row">
          <span class="doc-note" style="width: 24px">{{ size }}</span>
          <IconField :class="`mw-size-${size}`" style="width: 280px">
            <InputIcon><Search /></InputIcon>
            <InputText :placeholder="t(s.searchDrafts)" fluid />
          </IconField>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.states">
      <Specimen themes="both">
        <StateGrid :columns="[s.colEmpty, s.colFilled, s.colDisabled, s.colReadonly, s.colInvalid]" label-width="48px">
          <StateRow :label="s.leadingIcon">
            <IconField style="width: 168px"><InputIcon><Search /></InputIcon><InputText :placeholder="t(s.search)" fluid /></IconField>
            <IconField style="width: 168px"><InputIcon><Search /></InputIcon><InputText model-value="transformer" fluid /></IconField>
            <IconField style="width: 168px"><InputIcon><Search /></InputIcon><InputText model-value="transformer" disabled fluid /></IconField>
            <IconField style="width: 168px"><InputIcon><Search /></InputIcon><InputText model-value="transformer" readonly fluid /></IconField>
            <IconField style="width: 168px"><InputIcon><Search /></InputIcon><InputText model-value="??" invalid fluid /></IconField>
          </StateRow>
          <StateRow :label="s.trailingIcon">
            <IconField style="width: 168px"><InputText :placeholder="t(s.member)" fluid /><InputIcon><X /></InputIcon></IconField>
            <IconField style="width: 168px"><InputText :model-value="t(s.memberName)" fluid /><InputIcon><X /></InputIcon></IconField>
            <IconField style="width: 168px"><InputText :model-value="t(s.memberName)" disabled fluid /><InputIcon><X /></InputIcon></IconField>
            <IconField style="width: 168px"><InputText :model-value="t(s.memberName)" readonly fluid /><InputIcon><X /></InputIcon></IconField>
            <IconField style="width: 168px"><InputText :model-value="t(s.unknownMember)" invalid fluid /><InputIcon><X /></InputIcon></IconField>
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
.doc-spin {
  animation: doc-spin 1s linear infinite;
}

@keyframes doc-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
