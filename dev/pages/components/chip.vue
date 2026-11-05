<script setup lang="ts">
import { ref } from "vue";
import { Bookmark, FileText, Link2 } from "lucide-vue-next";
import { Button, Chip } from "../../../src";
import { api } from "../../api/entries/chip";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const avatarSvg =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" fill="#e07a2f"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="22" font-weight="600">林</text></svg>',
  );

const resetKey = ref(0);
const sizes = ["xs", "sm", "md", "lg"] as const;
</script>

<template>
  <DocPage lead="纸片（Chip）：紧凑的胶囊形实体标签，用于展示筛选条件、关键词词条或协作者，支持一键移除。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">展示用户添加的关键词、筛选器或附件条件，并允许通过 <code>removable</code> 移除。</li>
        <li data-kind="do">前置头像（<code>image</code>）或图标（<code>icon</code>）以标识具体实体。</li>
        <li data-kind="dont">表达系统状态或语义等级时请用 <code>Tag</code>；展示带悬浮资料卡的用户提及请用 <code>UserChip</code>。</li>
        <li data-kind="dont">不在单个纸片内塞入长句；保持词条简短且单行显示。</li>
      </ul>
    </DocSection>

    <DocSection title="底面" desc="纸面与霜面并排。纸片使用中性控件填充底色，移除按钮在悬停时加深反馈。">
      <Specimen :surfaces="['paper', 'frost']">
        <Chip label="计算语言学" />
        <Chip label="DOI: 10.1038" :icon="Link2" />
        <Chip label="林知远" :image="avatarSvg" />
        <Chip :key="`frost-rm-${resetKey}`" label="仅看近三年" removable />
      </Specimen>
    </DocSection>

    <DocSection title="尺寸" desc="跟随容器的 .mw-size-* 密度上下文自动缩放高度、内边距、头像与移除按钮尺寸。">
      <Specimen themes="single" layout="stack">
        <div v-for="s in sizes" :key="s" class="doc-row" :class="`mw-size-${s}`">
          <span class="doc-note" style="width: 24px">{{ s }}</span>
          <Chip label="大语言模型" />
          <Chip label="已附原文" :icon="FileText" />
          <Chip label="林知远" :image="avatarSvg" removable />
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="状态" desc="点击移除按钮（或聚焦后按 Enter / Backspace / Space）会隐藏纸片并触发 remove 事件。">
      <Specimen themes="both" layout="stack">
        <StateGrid :columns="['纯文本', '带图标', '带图像', '可移除']" label-width="72px">
          <StateRow :key="`row-${resetKey}`" label="默认">
            <Chip label="实证研究" />
            <Chip label="文献笔记" :icon="Bookmark" />
            <Chip label="林知远" :image="avatarSvg" />
            <Chip label="2024–2026" removable />
          </StateRow>
        </StateGrid>
        <div class="doc-row">
          <Button size="xs" variant="text" severity="secondary" label="重置已移除的纸片" @click="resetKey++" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
