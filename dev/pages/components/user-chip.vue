<script setup lang="ts">
import { Copy } from "lucide-vue-next";
import { Button, UserChip, type UserProfile } from "../../../src";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const portraitSvg =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" fill="#d96b27"/><circle cx="48" cy="36" r="16" fill="#fff3eb"/><path d="M20 84c4-16 16-24 28-24s24 8 28 24" fill="#fff3eb"/></svg>',
  );

const authorWithAvatar: UserProfile = {
  id: "usr_01HXYZ",
  handle: "@linzhiyuan",
  name: "林知远",
  avatar: portraitSvg,
  badge: "通讯作者",
  role: "计算语言学实验室 · 博士研究生",
  email: "zhiyuan.lin@example.edu.cn",
  description: "研究方向：跨语言检索、科技文献结构化抽取与可验证引用生成。",
};

const reviewerInitials: UserProfile = {
  id: "usr_02ABCD",
  handle: "@shenmo",
  name: "沈墨",
  badge: "协作者",
  role: "系统架构组 · 共同第一作者",
  email: "mo.shen@example.edu.cn",
};

const variants = [
  { label: "文本 @提及 (text)", value: "text" },
  { label: "胶囊标签 (tag)", value: "tag" },
  { label: "头像与姓名 (person)", value: "person" },
  { label: "仅头像 (avatar)", value: "avatar" },
] as const;

const sizes = ["xs", "sm", "md", "lg"] as const;
</script>

<template>
  <DocPage lead="用户提及与身份药丸（UserChip）：在正文提及、批注署名、协作者列表中一致地渲染用户身份，默认悬停或聚焦时展开 UserCard 名片。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do"><strong>text</strong>：正文或批注流中的行内 <code>@姓名</code> 提及，与正文字号基线自然对齐。</li>
        <li data-kind="do"><strong>person</strong>：表格单元格、草稿元数据栏中的「头像 + 姓名」组合；<strong>tag</strong>：需要胶囊底色突出的提及；<strong>avatar</strong>：紧凑头像列。</li>
        <li data-kind="dont">不要在列表每行重复手写 <code>HoverCard + UserCard</code>，统一由 <code>UserChip</code> 承载。</li>
        <li data-kind="dont">纯展示且无需浮层名片的场景请显式传入 <code>:show-card="false"</code>。</li>
      </ul>
    </DocSection>

    <DocSection title="底面" desc="纸面与霜面并排。将指针悬停或用 Tab 聚焦在任意形态上，可预览浮出的 UserCard 资料卡。">
      <Specimen :surfaces="['paper', 'frost']">
        <UserChip :user="authorWithAvatar" variant="text" />
        <UserChip :user="authorWithAvatar" variant="person" />
        <UserChip :user="reviewerInitials" variant="tag" />
        <UserChip :user="authorWithAvatar" variant="avatar" />
      </Specimen>
    </DocSection>

    <DocSection title="尺寸" desc="xs / sm / md / lg 四档（对 tag / person / avatar 生效，text 变体始终继承所在段落字号）。">
      <Specimen themes="single" layout="stack">
        <div v-for="s in sizes" :key="s" class="doc-row">
          <span class="doc-note" style="width: 24px">{{ s }}</span>
          <UserChip :user="authorWithAvatar" variant="person" :size="s" />
          <UserChip :user="reviewerInitials" variant="tag" :size="s" />
          <UserChip :user="authorWithAvatar" variant="avatar" :size="s" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="状态" desc="四种变体在默认悬停名片、首字母回退、禁用名片与超链接形态下的对比。">
      <Specimen themes="both">
        <StateGrid :columns="['带头像 + 名片', '首字母 + 名片', '纯展示 (无名片)', '超链接 (href)']" label-width="116px">
          <StateRow v-for="v in variants" :key="v.value" :label="v.label.split(' ')[0]">
            <UserChip :user="authorWithAvatar" :variant="v.value" />
            <UserChip :user="reviewerInitials" :variant="v.value" />
            <UserChip :user="authorWithAvatar" :variant="v.value" :show-card="false" />
            <UserChip :user="reviewerInitials" :variant="v.value" href="#user-chip-link" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection title="名片扩展插槽" desc="通过 #id-actions 与 #card 插槽向悬浮名片内注入复制 ID 或快捷操作按钮。">
      <Specimen themes="single">
        <UserChip :user="authorWithAvatar" variant="tag">
          <template #id-actions>
            <Button size="xs" variant="text" severity="secondary" :icon="Copy" aria-label="复制账号标识" />
          </template>
          <template #card="{ user }">
            <div class="doc-row" style="margin-top: 10px">
              <Button size="xs" variant="tinted" label="查看其负责章节" />
              <span class="doc-note">{{ user.handle }}</span>
            </div>
          </template>
        </UserChip>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <table class="doc-table">
        <thead>
          <tr><th>属性 / 插槽</th><th>取值</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><code>user</code></td><td><code>UserProfile</code></td><td>必填，用户资料对象（含 <code>name</code>、<code>avatar</code>、<code>handle</code>、<code>badge</code>、<code>role</code>、<code>email</code>、<code>description</code>）</td></tr>
          <tr><td><code>variant</code></td><td><code>text · tag · avatar · person</code></td><td>展示形态；默认 <code>text</code></td></tr>
          <tr><td><code>size</code></td><td><code>xs · sm · md · lg · small · medium · large</code></td><td>尺寸档位；不传则跟随密度上下文（<code>text</code> 除外）</td></tr>
          <tr><td><code>showCard</code></td><td><code>boolean</code></td><td>悬停或聚焦时是否展示 <code>UserCard</code> 浮层；默认 <code>true</code></td></tr>
          <tr><td><code>href</code></td><td><code>string | null</code></td><td>传入时根节点渲染为 <code>&lt;a&gt;</code> 链接</td></tr>
          <tr><td><code>#id-actions</code> / <code>#card</code></td><td><code>{ user }</code></td><td>透传至内部 <code>UserCard</code> 的 ID 旁操作区与底部扩展区</td></tr>
        </tbody>
      </table>
    </DocSection>
  </DocPage>
</template>
