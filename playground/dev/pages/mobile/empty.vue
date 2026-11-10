<script setup lang="ts">
import { computed } from "vue";
import { SelectButton, ToggleSwitch } from "@mango-write/ui-vue";
import MpDocPage from "../../kit/MpDocPage.vue";
import { mobileApi } from "../../mobile-demos/api";
import { mpSim } from "../../mobile-demos/state";
import { t } from "../../i18n";

const options = computed(() => [
  { label: t({ zh: "空数据 empty", en: "empty" }), value: "empty" },
  { label: t({ zh: "错误恢复 error", en: "error" }), value: "error" },
  { label: t({ zh: "加载中 loading", en: "loading" }), value: "loading" },
]);
const code = computed(() =>
  mpSim.empty.status === "loading"
    ? t({ zh: `<MpLoading label="正在整理研究记录…" />`, en: `<MpLoading label="Organizing research entries…" />` })
    : t({
        zh: `<MpEmpty status="${mpSim.empty.status}" title="当前空间暂无记录" hint="可以清除筛选，或写下第一条研究记录。">
  ${mpSim.empty.showAction ? '<template #action><MpButton size="sm" label="新建记录" /></template>' : "<!-- 无动作插槽 -->"}
</MpEmpty>`,
        en: `<MpEmpty status="${mpSim.empty.status}" title="No entries in this space" hint="Clear filters or capture your first research entry.">
  ${mpSim.empty.showAction ? '<template #action><MpButton size="sm" label="New entry" /></template>' : "<!-- No action slot -->"}
</MpEmpty>`,
      }),
);
</script>

<template>
  <MpDocPage slug="empty" :code="code" :api="mobileApi.empty" :guidelines="[
    { kind: 'do', zh: '<strong>明确下一步</strong>（MpEmpty）：空态与错误态都应通过 #action 插槽提供恢复或新建入口；短阔屏（Pura X）下自动收敛纵向留白。', en: '<strong>Clear next step</strong> (MpEmpty): empty and error states provide a recovery or creation CTA via #action; vertical padding compacts on wide-short viewports.' },
    { kind: 'do', zh: '<strong>独立加载态</strong>（MpLoading）：加载过程使用独立的旋转指示器与状态说明。', en: '<strong>Dedicated loading</strong> (MpLoading): use MpLoading for in-flight states.' },
    { kind: 'dont', zh: '不在空态中只写「暂无数据」而不给原因或下一步动作。', en: 'Never show a bare “No data” message without context or a next action.' },
  ]">
    <div class="mp-field">
      <div class="mp-field__head"><span class="mp-field__label">{{ t({ zh: "视图状态", en: "Status" }) }}</span><code class="mp-field__prop">status</code></div>
      <SelectButton size="sm" :model-value="mpSim.empty.status" :options="options" option-label="label" option-value="value" :allow-empty="false" @update:model-value="mpSim.empty.status = $event as typeof mpSim.empty.status" />
    </div>
    <div class="mp-field">
      <div class="mp-field__head"><span class="mp-field__label">{{ t({ zh: "底部操作按钮", en: "Action button" }) }}</span><code class="mp-field__prop">#action</code></div>
      <ToggleSwitch v-model="mpSim.empty.showAction" />
    </div>
  </MpDocPage>
</template>
