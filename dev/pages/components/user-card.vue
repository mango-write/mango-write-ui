<script setup lang="ts">
import { Copy, Mail, ShieldCheck } from "lucide-vue-next";
import { Button, UserCard, type UserProfile } from "../../../src";
import { api } from "../../api/entries/user-card";
import ApiTable from "../../kit/ApiTable.vue";
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

const fullUser: UserProfile = {
  id: "usr_01HXYZ",
  handle: "@linzhiyuan",
  name: "林知远",
  avatar: portraitSvg,
  badge: "团队管理员",
  role: "计算语言学实验室 · 博士研究生",
  email: "zhiyuan.lin@example.edu.cn",
  description: "负责论文方法论与实验分析章节，维护团队共享文献库。",
};

const minimalUser: UserProfile = {
  id: "usr_02ABCD",
  name: "沈墨",
  badge: "协作者",
};
</script>

<template>
  <DocPage lead="用户名片（UserCard）：结构化呈现用户的头像、姓名、角色徽标、账号句柄、邮箱与简介，既可嵌入浮层，也可用于账户设置页头部。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">作为 <code>UserChip</code> 悬停浮层或独立弹出面板的内容主体（默认 <code>size="medium"</code>）。</li>
        <li data-kind="do">在个人资料页、账号管理弹窗顶部展示大号身份头部（<code>size="large"</code>）。</li>
        <li data-kind="dont">不在密集列表的每一行直接平铺完整 <code>UserCard</code>，列表行内请用 <code>UserChip</code>。</li>
        <li data-kind="dont">字段缺失（如无邮箱、无简介）时组件会自动省略对应行，无需传入占位符字符串。</li>
      </ul>
    </DocSection>

    <DocSection title="底面" desc="纸面与霜面并排。名片本身不强行包裹外框，自然融入所在浮层（霜面）或卡片（纸面）底色。">
      <Specimen :surfaces="['paper', 'frost']">
        <div style="max-width: 300px">
          <UserCard :user="fullUser" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="尺寸" desc="medium（用于悬浮卡与弹出层，头像 lg）与 large（用于设置页头部，头像 xlarge）。">
      <Specimen themes="single" layout="stack">
        <div class="doc-row" style="align-items: flex-start; gap: 32px">
          <div style="width: 280px">
            <div class="doc-note" style="margin-bottom: 8px">medium（默认）</div>
            <UserCard :user="fullUser" size="medium" />
          </div>
          <div style="width: 320px">
            <div class="doc-note" style="margin-bottom: 8px">large</div>
            <UserCard :user="fullUser" size="large" />
          </div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="状态" desc="完整资料、精简资料（首字母回退）与插槽扩展在两种尺寸下的表现。">
      <Specimen themes="both">
        <StateGrid :columns="['完整资料', '精简资料 (首字母)', '带操作插槽']" label-width="72px">
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
                  <Button size="xs" variant="text" severity="secondary" :icon="ShieldCheck" aria-label="已认证" />
                </template>
                <template #id-actions>
                  <Button size="xs" variant="text" severity="secondary" :icon="Copy" aria-label="复制 ID" />
                </template>
                <template #card>
                  <div class="doc-row" style="margin-top: 10px">
                    <Button size="xs" variant="tinted" :icon="Mail" label="发送邀请" />
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
                  <Button size="xs" variant="text" severity="secondary" :icon="Copy" aria-label="复制 ID" />
                </template>
              </UserCard>
            </div>
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
