<script setup lang="ts">
import { BookOpen, Plus, Upload } from "lucide-vue-next";
import { Button, PageHeader } from "../../../src";
import { api } from "../../api/entries/page-header";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
</script>

<template>
  <DocPage lead="主站页面头：首页一族（文库、草稿、团队、设置）工作岛顶部的统一标题栏，收纳可选图标、一级标题与右侧操作区。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">作为工作岛（<code>.mw-island</code>）顶部首行，放在滚动容器之外自然钉顶。</li>
        <li data-kind="do">右侧 <code>#actions</code> 放本页最高频的 1–2 个操作按钮。</li>
        <li data-kind="dont">不要在同一个工作岛内放两个 <code>PageHeader</code>。</li>
      </ul>
    </DocSection>

    <DocSection title="底面" desc="纸面与霜面并排。左侧图标块使用 --accent-subtle 半透明品牌底，右侧动作区自动推至末端。">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <PageHeader title="我的文库">
          <template #icon><BookOpen /></template>
          <template #actions>
            <Button size="sm" variant="outlined">
              <Upload />
              <span>导入 PDF</span>
            </Button>
            <Button size="sm">
              <Plus />
              <span>新建草稿</span>
            </Button>
          </template>
        </PageHeader>
      </Specimen>
    </DocSection>

    <DocSection title="纯标题变体" desc="不传 #icon 或 #actions 时保持同等高度与基线节奏。">
      <Specimen themes="both" layout="stack">
        <PageHeader title="账户与安全设置" />
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
