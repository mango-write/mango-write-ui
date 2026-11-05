<script setup lang="ts">
import { AppLogo } from "../../../src";
import { api } from "../../api/entries/app-logo";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
</script>

<template>
  <DocPage lead="品牌标志：内联 SVG 渲染的 MangoWrite 标志，支持完整横版（字标 + 图形）与紧凑方形标（markOnly），随主题自动切换色彩。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">顶栏、登录壳、营销站导航与页脚统一使用 <code>AppLogo</code>，禁止走静态 <code>&lt;img&gt;</code>。</li>
        <li data-kind="do">窄屏或折叠侧栏传入 <code>markOnly</code> 切换为紧凑方形 viewBox。</li>
        <li data-kind="dont">不要在业务代码里硬编码 SVG 路径或覆写品牌色。</li>
      </ul>
    </DocSection>

    <DocSection title="底面" desc="纸面与霜面并排。主体填色绑定 --accent，内部高光绑定 --bg-raised，深色下不会产生刺眼白斑。">
      <Specimen :surfaces="['paper', 'frost']" layout="row">
        <AppLogo />
        <AppLogo mark-only />
      </Specimen>
    </DocSection>

    <DocSection title="形态对比" desc="完整版（367×90 viewBox）与仅图形版（120×90 viewBox）。">
      <Specimen themes="both">
        <StateGrid :columns="['完整标志 (markOnly=false)', '仅图形标 (markOnly=true)']" label-width="64px">
          <StateRow label="默认">
            <AppLogo />
            <AppLogo mark-only />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
