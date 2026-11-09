<script setup lang="ts">
import { computed } from "vue";
import { Copy } from "lucide-vue-next";
import { Button, UserChip, type UserProfile } from "@mango-write/ui-vue";
import { api } from "../../api/entries/user-chip";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/user-chip";

const portraitSvg =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" fill="#d96b27"/><circle cx="48" cy="36" r="16" fill="#fff3eb"/><path d="M20 84c4-16 16-24 28-24s24 8 28 24" fill="#fff3eb"/></svg>',
  );

/* UserProfile 直读字符串字段,假资料按当前语言整体重建 */
const authorWithAvatar = computed<UserProfile>(() => ({
  id: "usr_01HXYZ",
  handle: "@linzhiyuan",
  name: t({ zh: "林知远", en: "Lin Zhiyuan" }),
  avatar: portraitSvg,
  badge: t({ zh: "通讯作者", en: "Corresponding author" }),
  role: t({ zh: "计算语言学实验室 · 博士研究生", en: "Computational linguistics lab · PhD candidate" }),
  email: "zhiyuan.lin@example.edu.cn",
  description: t({
    zh: "研究方向：跨语言检索、科技文献结构化抽取与可验证引用生成。",
    en: "Research: cross-lingual retrieval, structured extraction of scientific literature, and verifiable citation generation.",
  }),
}));

const reviewerInitials = computed<UserProfile>(() => ({
  id: "usr_02ABCD",
  handle: "@shenmo",
  name: t({ zh: "沈墨", en: "Shen Mo" }),
  badge: t({ zh: "协作者", en: "Collaborator" }),
  role: t({ zh: "系统架构组 · 共同第一作者", en: "Systems architecture group · Co-first author" }),
  email: "mo.shen@example.edu.cn",
}));

const variants = [
  { label: { zh: "文本", en: "Text" }, value: "text" },
  { label: { zh: "胶囊标签", en: "Tag" }, value: "tag" },
  { label: { zh: "头像与姓名", en: "Person" }, value: "person" },
  { label: { zh: "仅头像", en: "Avatar" }, value: "avatar" },
] as const;

const sizes = ["xs", "sm", "md", "lg"] as const;

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "<strong>text</strong>：正文或批注流中的行内 <code>@姓名</code> 提及，与正文字号基线自然对齐。",
    en: "<strong>Text</strong>: inline <code>@name</code> mentions in prose or comment threads, aligned to the paragraph baseline.",
  },
  rule2: {
    zh: "<strong>person</strong>：表格单元格、草稿元数据栏中的「头像 + 姓名」组合；<strong>tag</strong>：需要胶囊底色突出的提及；<strong>avatar</strong>：紧凑头像列。",
    en: "<strong>Person</strong>: the avatar + name pair in table cells and draft metadata bars; <strong>tag</strong>: mentions that need the capsule fill; <strong>avatar</strong>: compact avatar columns.",
  },
  rule3: {
    zh: "不要在列表每行重复手写 <code>HoverCard + UserCard</code>，统一由 <code>UserChip</code> 承载。",
    en: "Don't repeat <code>HoverCard + UserCard</code> by hand on every row; <code>UserChip</code> owns that.",
  },
  rule4: {
    zh: "纯展示且无需浮层名片的场景请显式传入 <code>:show-card=\"false\"</code>。",
    en: "For pure display without the floating card, pass <code>:show-card=\"false\"</code> explicitly.",
  },
  baseTitle: { zh: "底面", en: "Surfaces" },
  baseDesc: {
    zh: "纸面与霜面并排。将指针悬停或用 Tab 聚焦在任意形态上，可预览浮出的 UserCard 资料卡。",
    en: "Paper and frost side by side. Hover or Tab-focus any variant to preview the floating UserCard.",
  },
  sizesTitle: { zh: "尺寸", en: "Sizes" },
  sizesDesc: {
    zh: "xs / sm / md / lg 四档（对 tag / person / avatar 生效，text 变体始终继承所在段落字号）。",
    en: "Four tiers, xs / sm / md / lg (tag / person / avatar only; the text variant always inherits the paragraph font size).",
  },
  statesTitle: { zh: "状态", en: "States" },
  statesDesc: {
    zh: "四种变体在默认悬停名片、首字母回退、禁用名片与超链接形态下的对比。",
    en: "Four variants with the default hover card, initials fallback, card disabled, and hyperlink.",
  },
  colAvatarCard: { zh: "带头像 + 名片", en: "Avatar + card" },
  colInitialsCard: { zh: "首字母 + 名片", en: "Initials + card" },
  colNoCard: { zh: "纯展示 (无名片)", en: "Plain (no card)" },
  colHref: { zh: "超链接 (href)", en: "Link (href)" },
  cardTitle: { zh: "名片扩展插槽", en: "Card extension slots" },
  cardDesc: {
    zh: "通过 #id-actions 与 #card 插槽向悬浮名片内注入复制 ID 或快捷操作按钮。",
    en: "Inject a copy-ID action or quick actions into the floating card via the #id-actions and #card slots.",
  },
  copyIdAria: { zh: "复制账号标识", en: "Copy account ID" },
  viewSections: { zh: "查看其负责章节", en: "View their sections" },
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
        <UserChip :user="authorWithAvatar" variant="text" />
        <UserChip :user="authorWithAvatar" variant="person" />
        <UserChip :user="reviewerInitials" variant="tag" />
        <UserChip :user="authorWithAvatar" variant="avatar" />
      </Specimen>
    </DocSection>

    <DocSection :title="s.sizesTitle" :desc="s.sizesDesc">
      <Specimen themes="single" layout="stack">
        <div v-for="sz in sizes" :key="sz" class="doc-row">
          <span class="doc-note" style="width: 24px">{{ sz }}</span>
          <UserChip :user="authorWithAvatar" variant="person" :size="sz" />
          <UserChip :user="reviewerInitials" variant="tag" :size="sz" />
          <UserChip :user="authorWithAvatar" variant="avatar" :size="sz" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.statesTitle" :desc="s.statesDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colAvatarCard, s.colInitialsCard, s.colNoCard, s.colHref]" label-width="116px">
          <StateRow v-for="v in variants" :key="v.value" :label="v.label">
            <UserChip :user="authorWithAvatar" :variant="v.value" />
            <UserChip :user="reviewerInitials" :variant="v.value" />
            <UserChip :user="authorWithAvatar" :variant="v.value" :show-card="false" />
            <UserChip :user="reviewerInitials" :variant="v.value" href="#user-chip-link" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection :title="s.cardTitle" :desc="s.cardDesc">
      <Specimen themes="single">
        <UserChip :user="authorWithAvatar" variant="tag">
          <template #id-actions>
            <Button size="xs" variant="text" severity="secondary" :icon="Copy" :aria-label="t(s.copyIdAria)" />
          </template>
          <template #card="{ user }">
            <div class="doc-row" style="margin-top: 10px">
              <Button size="xs" variant="tinted" :label="t(s.viewSections)" />
              <span class="doc-note">{{ user.handle }}</span>
            </div>
          </template>
        </UserChip>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
