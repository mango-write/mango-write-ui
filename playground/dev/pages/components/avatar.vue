<script setup lang="ts">
import { Bot, Building2, User, Users } from "lucide-vue-next";
import { Avatar } from "@mango-write/ui-vue";
import { api } from "../../api/entries/avatar";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/avatar";

const portraitSvg =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#d96b27"/><stop offset="100%" stop-color="#9e3d12"/></linearGradient></defs><rect width="96" height="96" fill="url(#g)"/><circle cx="48" cy="36" r="16" fill="#fff3eb"/><path d="M20 84c4-16 16-24 28-24s24 8 28 24" fill="#fff3eb"/></svg>',
  );

const sizes = [
  { label: "xs", value: "xs" },
  { label: "sm", value: "sm" },
  { label: "md", value: "md" },
  { label: "lg", value: "lg" },
  { label: "xlarge", value: "xlarge" },
] as const;

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "个人用户与协作者统一使用圆形（<code>shape=\"circle\"</code>）；团队空间、工作区或应用实体使用方形（<code>shape=\"square\"</code>）。",
    en: "Round (<code>shape=\"circle\"</code>) for people and collaborators; square (<code>shape=\"square\"</code>) for team spaces, workspaces, and app entities.",
  },
  rule2: {
    zh: "同时传入 <code>image</code> 与 <code>label</code>（或 <code>icon</code>），以便在图片地址失效时自动回退到首字母或图标。",
    en: "Pass both <code>image</code> and <code>label</code> (or <code>icon</code>) so a broken image falls back to initials or the icon.",
  },
  rule3: {
    zh: "需要行内提及并悬停展示用户资料卡时，不要手拼 <code>Avatar + 文本</code>，请直接用 <code>UserChip</code>。",
    en: "For inline mentions with a hover profile card, don't hand-assemble <code>Avatar + text</code> — use <code>UserChip</code>.",
  },
  rule4: {
    zh: "<code>label</code> 仅放 1–2 个字符（中文单字或英文首字母缩写），不放完整姓名。",
    en: "Keep <code>label</code> to 1–2 characters (a Chinese character or initials), never the full name.",
  },
  baseTitle: { zh: "底面", en: "Surfaces" },
  baseDesc: {
    zh: "纸面与霜面并排。无图像时使用 --fill-strong 填充底与次级文字色，在两类底面上都具备清晰边界。",
    en: "Paper and frost side by side. Without an image, the avatar uses a --fill-strong fill with secondary text color, keeping a clear edge on both surfaces.",
  },
  lin: { zh: "林", en: "L" },
  linAria: { zh: "林知远", en: "Lin Zhiyuan" },
  shen: { zh: "沈", en: "S" },
  shenAria: { zh: "沈墨", en: "Shen Mo" },
  reviewerAria: { zh: "匿名审稿人", en: "Anonymous reviewer" },
  nlpAria: { zh: "NLP 课题组", en: "NLP research group" },
  assistantAria: { zh: "科研助手", en: "Research assistant" },
  sizesTitle: { zh: "尺寸", en: "Sizes" },
  sizesDesc: {
    zh: "xs / sm / md / lg / xlarge 五档，默认跟随密度上下文。方形头像圆角随尺寸档位同心缩放。",
    en: "Five tiers, xs / sm / md / lg / xlarge, following the density context by default; square radii scale with the tier.",
  },
  group: { zh: "组", en: "G" },
  statesTitle: { zh: "状态", en: "States" },
  statesDesc: {
    zh: "方形（square）与圆形（circle）在图像、字符、图标及图像加载失败回退下的表现。",
    en: "Square and circle shapes across image, initials, icon, and broken-image fallback.",
  },
  colImage: { zh: "图像", en: "Image" },
  colInitials: { zh: "字符缩略", en: "Initials" },
  colUserIcon: { zh: "用户图标", en: "User icon" },
  colEntityIcon: { zh: "实体图标", en: "Entity icon" },
  colFallback: { zh: "图像失败回退", en: "Image fallback" },
  rowCircle: { zh: "圆形", en: "Circle" },
  rowSquare: { zh: "方形", en: "Square" },
  lab: { zh: "课题", en: "Lab" },
  fallback: { zh: "回", en: "A" },
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
        <Avatar :image="portraitSvg" :label="t(s.lin)" shape="circle" :aria-label="t(s.linAria)" />
        <Avatar :label="t(s.shen)" shape="circle" :aria-label="t(s.shenAria)" />
        <Avatar :icon="User" shape="circle" :aria-label="t(s.reviewerAria)" />
        <Avatar label="NLP" shape="square" :aria-label="t(s.nlpAria)" />
        <Avatar :icon="Bot" shape="square" :aria-label="t(s.assistantAria)" />
      </Specimen>
    </DocSection>

    <DocSection :title="s.sizesTitle" :desc="s.sizesDesc">
      <Specimen themes="single" layout="stack">
        <div v-for="sz in sizes" :key="sz.value" class="doc-row">
          <span class="doc-note" style="width: 48px">{{ sz.label }}</span>
          <Avatar :size="sz.value" shape="circle" :image="portraitSvg" :label="t(s.lin)" />
          <Avatar :size="sz.value" shape="circle" :label="t(s.lin)" />
          <Avatar :size="sz.value" shape="circle" :icon="User" />
          <Avatar :size="sz.value" shape="square" :label="t(s.group)" />
          <Avatar :size="sz.value" shape="square" :icon="Users" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.statesTitle" :desc="s.statesDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colImage, s.colInitials, s.colUserIcon, s.colEntityIcon, s.colFallback]" label-width="72px">
          <StateRow :label="s.rowCircle">
            <Avatar shape="circle" :image="portraitSvg" :label="t(s.lin)" />
            <Avatar shape="circle" :label="t(s.lin)" />
            <Avatar shape="circle" :icon="User" />
            <Avatar shape="circle" :icon="Bot" />
            <Avatar shape="circle" image="data:image/gif;base64,invalid" :label="t(s.fallback)" />
          </StateRow>
          <StateRow :label="s.rowSquare">
            <Avatar shape="square" :image="portraitSvg" :label="t(s.lab)" />
            <Avatar shape="square" :label="t(s.lab)" />
            <Avatar shape="square" :icon="Users" />
            <Avatar shape="square" :icon="Building2" />
            <Avatar shape="square" image="data:image/gif;base64,invalid" :icon="Bot" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
