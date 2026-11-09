<script setup lang="ts">
import { computed } from "vue";
import { Copy, Mail, ShieldCheck } from "lucide-vue-next";
import { Button, UserCard, type UserProfile } from "@mango-write/ui-vue";
import { api } from "../../api/entries/user-card";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/user-card";

const portraitSvg =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" fill="#d96b27"/><circle cx="48" cy="36" r="16" fill="#fff3eb"/><path d="M20 84c4-16 16-24 28-24s24 8 28 24" fill="#fff3eb"/></svg>',
  );

/* UserProfile 直读字符串字段,假资料按当前语言整体重建 */
const fullUser = computed<UserProfile>(() => ({
  id: "usr_01HXYZ",
  handle: "@linzhiyuan",
  name: t({ zh: "林知远", en: "Lin Zhiyuan" }),
  avatar: portraitSvg,
  badge: t({ zh: "团队管理员", en: "Team admin" }),
  role: t({ zh: "计算语言学实验室 · 博士研究生", en: "Computational linguistics lab · PhD candidate" }),
  email: "zhiyuan.lin@example.edu.cn",
  description: t({
    zh: "负责论文方法论与实验分析章节，维护团队共享文献库。",
    en: "Owns the methodology and experiment-analysis chapters and maintains the team's shared library.",
  }),
}));

const minimalUser = computed<UserProfile>(() => ({
  id: "usr_02ABCD",
  name: t({ zh: "沈墨", en: "Shen Mo" }),
  badge: t({ zh: "协作者", en: "Collaborator" }),
}));

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "作为 <code>UserChip</code> 悬停浮层或独立弹出面板的内容主体（默认 <code>size=\"medium\"</code>）。",
    en: "As the body of a <code>UserChip</code> hover overlay or a standalone popover (default <code>size=\"medium\"</code>).",
  },
  rule2: {
    zh: "在个人资料页、账号管理弹窗顶部展示大号身份头部（<code>size=\"large\"</code>）。",
    en: "As a large identity header at the top of profile pages and account dialogs (<code>size=\"large\"</code>).",
  },
  rule3: {
    zh: "不在密集列表的每一行直接平铺完整 <code>UserCard</code>，列表行内请用 <code>UserChip</code>。",
    en: "Don't lay out a full <code>UserCard</code> in every dense list row; use <code>UserChip</code> there.",
  },
  rule4: {
    zh: "字段缺失（如无邮箱、无简介）时组件会自动省略对应行，无需传入占位符字符串。",
    en: "Missing fields (no email, no bio) collapse their rows automatically — no placeholder strings needed.",
  },
  baseTitle: { zh: "底面", en: "Surfaces" },
  baseDesc: {
    zh: "纸面与霜面并排。名片本身不强行包裹外框，自然融入所在浮层（霜面）或卡片（纸面）底色。",
    en: "Paper and frost side by side. The card adds no frame of its own, blending into the surrounding overlay (frost) or card (paper).",
  },
  sizesTitle: { zh: "尺寸", en: "Sizes" },
  sizesDesc: {
    zh: "medium（用于悬浮卡与弹出层，头像 lg）与 large（用于设置页头部，头像 xlarge）。",
    en: "medium (floating cards and popovers, avatar lg) and large (settings-page headers, avatar xlarge).",
  },
  mediumDefault: { zh: "medium（默认）", en: "medium (default)" },
  statesTitle: { zh: "状态", en: "States" },
  statesDesc: {
    zh: "完整资料、精简资料（首字母回退）与插槽扩展在两种尺寸下的表现。",
    en: "Full profile, minimal profile (initials fallback), and slot extensions at both sizes.",
  },
  colFull: { zh: "完整资料", en: "Full profile" },
  colMinimal: { zh: "精简资料 (首字母)", en: "Minimal (initials)" },
  colSlots: { zh: "带操作插槽", en: "With actions" },
  verifiedAria: { zh: "已认证", en: "Verified" },
  copyIdAria: { zh: "复制 ID", en: "Copy ID" },
  invite: { zh: "发送邀请", en: "Send invite" },
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
        <div style="max-width: 300px">
          <UserCard :user="fullUser" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.sizesTitle" :desc="s.sizesDesc">
      <Specimen themes="single" layout="stack">
        <div class="doc-row" style="align-items: flex-start; gap: 32px">
          <div style="width: 280px">
            <div class="doc-note" style="margin-bottom: 8px">{{ t(s.mediumDefault) }}</div>
            <UserCard :user="fullUser" size="medium" />
          </div>
          <div style="width: 320px">
            <div class="doc-note" style="margin-bottom: 8px">large</div>
            <UserCard :user="fullUser" size="large" />
          </div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.statesTitle" :desc="s.statesDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colFull, s.colMinimal, s.colSlots]" label-width="72px">
          <StateRow label="medium">
            <div style="width: 240px">
              <UserCard :user="fullUser" />
            </div>
            <div style="width: 200px">
              <UserCard :user="minimalUser" />
            </div>
            <div style="width: 250px">
              <UserCard :user="fullUser">
                <template #name-actions>
                  <Button size="xs" variant="text" severity="secondary" :icon="ShieldCheck" :aria-label="t(s.verifiedAria)" />
                </template>
                <template #id-actions>
                  <Button size="xs" variant="text" severity="secondary" :icon="Copy" :aria-label="t(s.copyIdAria)" />
                </template>
                <template #card>
                  <div class="doc-row" style="margin-top: 10px">
                    <Button size="xs" variant="tinted" :icon="Mail" :label="t(s.invite)" />
                  </div>
                </template>
              </UserCard>
            </div>
          </StateRow>
          <StateRow label="large">
            <div style="width: 240px">
              <UserCard :user="fullUser" size="large" />
            </div>
            <div style="width: 200px">
              <UserCard :user="minimalUser" size="large" />
            </div>
            <div style="width: 250px">
              <UserCard :user="fullUser" size="large">
                <template #id-actions>
                  <Button size="xs" variant="text" severity="secondary" :icon="Copy" :aria-label="t(s.copyIdAria)" />
                </template>
              </UserCard>
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
