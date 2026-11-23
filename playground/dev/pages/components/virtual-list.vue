<script setup lang="ts">
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import ApiTable from "../../kit/ApiTable.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { api } from "../../api/entries/virtual-list";
import { usage } from "../../usage/entries/virtual-list";

const s = {
  demo: { zh: "可变高度列表", en: "Variable-height list" },
  demoDesc: {
    zh: "列表有 1,000 条记录。用键盘或触控滚动，也可以直接跳到第 500 条。",
    en: "Browse 1,000 records with a keyboard or touch, or jump directly to record 500.",
  },
  usage: { zh: "使用约定", en: "Usage" },
  api: { zh: "接口", en: "API" },
  viewport: {
    zh: "给列表设置高度，或把它放入高度有限的 flex 区域。短列表可直接渲染，便于全文查找。",
    en: "Give the list a height or place it in a constrained flex area. Render short lists directly to keep all content available to find-in-page.",
  },
  items: {
    zh: "通过 items 传入数据，itemKey 提供稳定的唯一键，estimateSize 提供初始行高。内容展开、图片加载后会重新测量实际行高。",
    en: "Pass data through items, provide a stable unique itemKey and an initial estimateSize. Rows are measured again when content expands or images load.",
  },
  focus: {
    zh: "列表可通过 Tab 进入，并使用原生滚动键浏览。焦点所在条目保留在页面中，编辑或播放中的条目可通过 pinnedKeys 保留。",
    en: "Tab into the list and use native scrolling keys. The focused row stays mounted. Use pinnedKeys to retain rows during editing or playback.",
  },
  states: {
    zh: "加载、空列表和错误反馈由调用方提供。Vue 使用 empty / footer 插槽，React 使用同名属性，可放置空态、重试或加载更多入口。",
    en: "Callers provide loading, empty and error feedback. The empty and footer Vue slots or React props can display empty states, retry actions or pagination.",
  },
  methods: {
    zh: "通过组件引用调用 scrollToKey(key, align) 即时定位，或调用 scrollToStart() 回到顶部。",
    en: "Call scrollToKey(key, align) on the component ref to jump instantly, or scrollToStart() to return to the top.",
  },
};
</script>

<template>
  <DocPage>
    <DocSection :title="s.demo" :desc="s.demoDesc"><UsagePlayground :entry="usage" /></DocSection>
    <DocSection :title="s.usage">
      <ul class="doc-rules">
        <li>{{ t(s.viewport) }}</li>
        <li>{{ t(s.items) }}</li>
        <li>{{ t(s.focus) }}</li>
        <li>{{ t(s.states) }}</li>
        <li>{{ t(s.methods) }}</li>
      </ul>
    </DocSection>
    <DocSection :title="s.api"><ApiTable :api="api" /></DocSection>
  </DocPage>
</template>
