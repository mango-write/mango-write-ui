<script setup lang="ts">
import { ref } from "vue";
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from "../../../src";
import { api } from "../../api/entries/accordion";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";

const singleOpen = ref<string | null>("meta");
const multiOpen = ref<string[]>(["abstract", "cite"]);
</script>

<template>
  <DocPage lead="手风琴折叠面板：将次要或分组信息收纳在可展开节中，保持主视口整洁。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">检查器侧栏的分节属性（题录元数据、导出参数、审校规则）、FAQ 列表。</li>
        <li data-kind="do">需要同时对照多节内容时开启 <code>multiple</code>。</li>
        <li data-kind="dont">核心必填表单项不要藏进默认收起的手风琴。</li>
        <li data-kind="dont">不要把手风琴当作主导航使用。</li>
      </ul>
    </DocSection>

    <DocSection title="底面" desc="纸面与霜面并排。面板之间以 --border-subtle 分割，展开箭头平滑旋转。">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <Accordion v-model:value="singleOpen">
          <AccordionPanel value="meta">
            <AccordionHeader>题录元数据</AccordionHeader>
            <AccordionContent>
              <p class="doc-note">DOI: 10.1038/s41586-026-00001-x · 期刊：Nature · 发表年份：2026</p>
            </AccordionContent>
          </AccordionPanel>
          <AccordionPanel value="export">
            <AccordionHeader>导出格式设置</AccordionHeader>
            <AccordionContent>
              <p class="doc-note">目标模板：ACM sigconf · 参考文献样式：BibTeX</p>
            </AccordionContent>
          </AccordionPanel>
          <AccordionPanel value="locked" disabled>
            <AccordionHeader>团队归档策略（管理员）</AccordionHeader>
            <AccordionContent>
              <p class="doc-note">仅团队管理员可修改。</p>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
      </Specimen>
    </DocSection>

    <DocSection title="多项展开（Multiple）" desc="允许多个面板同时保持展开状态。">
      <Specimen themes="both" layout="stack">
        <Accordion v-model:value="multiOpen" multiple>
          <AccordionPanel value="abstract">
            <AccordionHeader>摘要与关键词</AccordionHeader>
            <AccordionContent>
              <p class="doc-note">包含中英文双语摘要及 5 个受控关键词。</p>
            </AccordionContent>
          </AccordionPanel>
          <AccordionPanel value="cite">
            <AccordionHeader>引用校验结果</AccordionHeader>
            <AccordionContent>
              <p class="doc-note">全部 18 处正文引用均已匹配文库条目，0 处悬空引用。</p>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
