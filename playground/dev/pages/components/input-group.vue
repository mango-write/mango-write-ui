<script setup lang="ts">
import { Copy, Link } from "lucide-vue-next";
import { Button, InputGroup, InputGroupAddon, InputNumber, InputText } from "@mango-write/ui-vue";
import { api } from "../../api/entries/input-group";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/input-group";

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "固定前后缀帮助理解输入：<code>https://doi.org/</code>、<code>字</code>、<code>%</code>。",
    en: "Fixed prefix/suffix clarifies the input: <code>https://doi.org/</code>, <code>words</code>, <code>%</code>.",
  },
  rule2: {
    zh: "与输入强相关的单个动作贴在末尾：复制、生成、检索。",
    en: "A single action tightly bound to the input sits at the end: copy, generate, search.",
  },
  rule3: {
    zh: "不要拼超过一个按钮；多个动作放到字段外。",
    en: "Never stack more than one button; move extra actions outside the field.",
  },
  rule4: {
    zh: "纯装饰图标用 <code>IconField</code>，不要占一整个附加段。",
    en: "Purely decorative icons use <code>IconField</code>, not a whole addon segment.",
  },
  composition: { zh: "组合", en: "Composition" },
  compositionDesc: {
    zh: "纸面与霜面并排；附加段是半透明填充，霜面上不出现实色块。",
    en: "Paper and frost side by side; addons are translucent fills—no solid blocks on frost.",
  },
  copy: { zh: "复制", en: "Copy" },
  wordsUnit: { zh: "字", en: "words" },
  density: { zh: "密度", en: "Density" },
  densityDesc: {
    zh: "InputGroup 读容器的 --control-*：把 .mw-size-* 挂在组上，附加段、输入框与按钮一起换档。",
    en: "InputGroup reads the container's --control-*: put .mw-size-* on the group and addon, input, and button switch tiers together.",
  },
  memberEmail: { zh: "团队成员邮箱", en: "Team member email" },
  invite: { zh: "邀请", en: "Invite" },
  states: { zh: "状态", en: "States" },
  statesDesc: {
    zh: "聚焦或错误时，输入段抬到最上层，焦点晕与红色边框不会被相邻段遮住。",
    en: "On focus or error the input segment rises to the top so the focus halo and red border aren't covered by adjacent segments.",
  },
  colDefault: { zh: "默认", en: "Default" },
  colDisabled: { zh: "禁用", en: "Disabled" },
  colReadonly: { zh: "只读", en: "Readonly" },
  colInvalid: { zh: "错误", en: "Invalid" },
  prefixRow: { zh: "前缀", en: "Prefix" },
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

    <DocSection :title="s.composition" :desc="s.compositionDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <InputGroup>
          <InputGroupAddon>https://doi.org/</InputGroupAddon>
          <InputText placeholder="10.1038/s41586-024-07000-0" />
        </InputGroup>
        <InputGroup>
          <InputGroupAddon><Link /></InputGroupAddon>
          <InputText model-value="https://mangowrite.com/s/a8f2c" readonly />
          <Button severity="secondary" :label="t(s.copy)" :icon="Copy" />
        </InputGroup>
        <InputGroup style="width: 220px">
          <InputNumber :model-value="3000" :use-grouping="false" />
          <InputGroupAddon>{{ t(s.wordsUnit) }}</InputGroupAddon>
        </InputGroup>
      </Specimen>
    </DocSection>

    <DocSection :title="s.density" :desc="s.densityDesc">
      <Specimen themes="single" layout="stack">
        <div v-for="size in (['xs', 'sm', 'md', 'lg'] as const)" :key="size" class="doc-row">
          <span class="doc-note" style="width: 24px">{{ size }}</span>
          <InputGroup :class="`mw-size-${size}`" style="width: 360px">
            <InputGroupAddon>@</InputGroupAddon>
            <InputText :placeholder="t(s.memberEmail)" />
            <Button severity="secondary" :label="t(s.invite)" />
          </InputGroup>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.states" :desc="s.statesDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colDefault, s.colDisabled, s.colReadonly, s.colInvalid]" label-width="48px">
          <StateRow :label="s.prefixRow">
            <InputGroup style="width: 200px"><InputGroupAddon>DOI</InputGroupAddon><InputText placeholder="10.xxxx/…" /></InputGroup>
            <InputGroup style="width: 200px"><InputGroupAddon>DOI</InputGroupAddon><InputText model-value="10.1000/182" disabled /></InputGroup>
            <InputGroup style="width: 200px"><InputGroupAddon>DOI</InputGroupAddon><InputText model-value="10.1000/182" readonly /></InputGroup>
            <InputGroup style="width: 200px"><InputGroupAddon>DOI</InputGroupAddon><InputText model-value="10.1000" invalid /></InputGroup>
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
