<script setup lang="ts">
import { ref } from "vue";
import { Plus } from "lucide-vue-next";
import { Button, Column, DataTable } from "../../../src";
import { api } from "../../api/entries/data-table";
import ApiTable from "../../kit/ApiTable.vue";
import CodeBlock from "../../kit/CodeBlock.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

interface Paper {
  id: number;
  title: string;
  author: string;
  year: number;
  cited: number;
}

const papers: Paper[] = [
  { id: 1, title: "检索增强生成在综述写作中的应用", author: "张伟", year: 2024, cited: 128 },
  { id: 2, title: "大语言模型的引用幻觉评估", author: "李娜", year: 2023, cited: 342 },
  { id: 3, title: "学术写作中的来源锚点设计", author: "王磊", year: 2022, cited: 57 },
  { id: 4, title: "跨语言文献去重方法比较", author: "陈静", year: 2021, cited: 1093 },
  { id: 5, title: "科研日志的结构化沉淀", author: "刘洋", year: 2024, cited: 9 },
];

const few = papers.slice(0, 3);
const selected = ref<Paper[]>([papers[1]!]);
const selectedSmall = ref<Paper[]>([few[0]!]);
const expanded = ref<Paper[]>([]);
</script>

<template>
  <DocPage lead="展示同构的结构化记录：文献、成员、用量明细。表格外框是一张分组卡，行用发丝线分隔，数字列等宽对齐。">
    <DocSection title="示例">
      <CodeBlock
        v-for="ex in api.examples"
        :key="ex.title"
        :code="ex.code"
        :title="ex.title"
      />
    </DocSection>
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">记录有多个可比较的字段，用户需要扫读、排序或批量选择：文献清单、团队成员、审计日志。</li>
        <li data-kind="do">数字列（年份、被引次数、额度）右对齐，表格已默认启用等宽数字。</li>
        <li data-kind="do">空态写清原因并给出下一步动作（经 <code>#empty</code> 插槽放一个按钮）。</li>
        <li data-kind="dont">字段少于三个、以阅读为主的内容用列表或分组卡，不要用表格。</li>
        <li data-kind="dont">不在表格外再套一层卡片边框；需要嵌入已有卡片时用 <code>--mw-datatable-border: transparent</code> 去掉外框。</li>
      </ul>
    </DocSection>

    <DocSection title="基本" desc="表头 caption 字号、tertiary 色；行高默认 40px（--size-lg-h），hover 是极浅墨色叠层。">
      <Specimen :surfaces="['paper', 'canvas']" layout="stack">
        <DataTable :value="papers" data-key="id" row-hover>
          <Column field="title" header="标题" sortable />
          <Column field="author" header="第一作者" sortable />
          <Column field="year" header="年份" sortable style="text-align: end" />
          <Column field="cited" header="被引" sortable style="text-align: end" />
        </DataTable>
      </Specimen>
    </DocSection>

    <DocSection title="尺寸" desc="sm 为紧凑档（行高 32px），lg 给宽松阅读；不传 size 时字号跟随密度上下文，表格内的勾选与展开按钮一起切档。">
      <Specimen themes="single" layout="stack">
        <div v-for="s in (['sm', 'md', 'lg'] as const)" :key="s" class="doc-stack">
          <span class="doc-note">size="{{ s }}"</span>
          <DataTable :value="few" data-key="id" :size="s">
            <Column field="title" header="标题" />
            <Column field="author" header="第一作者" />
            <Column field="cited" header="被引" style="text-align: end" />
          </DataTable>
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="选择与展开" desc="选中行是品牌色的半透明叠层；勾选框是可输入面，选中后转实心品牌色。">
      <Specimen themes="both" layout="stack">
        <DataTable
          v-model:selection="selected"
          v-model:expanded-rows="expanded"
          :value="few"
          data-key="id"
          size="sm"
        >
          <Column selection-mode="multiple" style="width: 40px" />
          <Column expander style="width: 40px" />
          <Column field="title" header="标题" />
          <Column field="year" header="年份" style="text-align: end" />
          <template #expansion="{ data }">
            <span class="doc-note">《{{ data.title }}》· {{ data.author }} · 已被引用 {{ data.cited }} 次</span>
          </template>
        </DataTable>
      </Specimen>
    </DocSection>

    <DocSection title="状态" desc="排序表头可用 Tab 聚焦、回车切换；加载时整体蒙一层半透明表面色，空态居中并给出下一步。">
      <Specimen themes="both">
        <StateGrid :columns="['表格']" label-width="64px">
          <StateRow label="默认">
            <DataTable :value="few.slice(0, 2)" data-key="id" size="sm" style="width: 360px">
              <Column field="title" header="标题" />
              <Column field="cited" header="被引" style="text-align: end" />
            </DataTable>
          </StateRow>
          <StateRow label="选中">
            <DataTable
              v-model:selection="selectedSmall"
              :value="few.slice(0, 2)"
              data-key="id"
              size="sm"
              style="width: 360px"
            >
              <Column selection-mode="multiple" style="width: 40px" />
              <Column field="title" header="标题" />
            </DataTable>
          </StateRow>
          <StateRow label="排序">
            <DataTable
              :value="few"
              data-key="id"
              size="sm"
              sort-field="cited"
              :sort-order="-1"
              style="width: 360px"
            >
              <Column field="title" header="标题" sortable />
              <Column field="cited" header="被引" sortable style="text-align: end" />
            </DataTable>
          </StateRow>
          <StateRow label="加载">
            <DataTable :value="few.slice(0, 2)" data-key="id" size="sm" loading style="width: 360px">
              <Column field="title" header="标题" />
              <Column field="cited" header="被引" style="text-align: end" />
            </DataTable>
          </StateRow>
          <StateRow label="空">
            <DataTable :value="[]" data-key="id" size="sm" style="width: 360px">
              <Column field="title" header="标题" />
              <Column field="cited" header="被引" />
              <template #empty>
                <div class="doc-stack" style="justify-items: center">
                  <span>文献库里还没有条目</span>
                  <Button size="sm" variant="tinted" label="导入文献" :icon="Plus" />
                </div>
              </template>
            </DataTable>
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection title="分页" desc="分页器嵌在卡片底部，与表格共用分隔线。">
      <Specimen themes="single" layout="stack">
        <DataTable :value="papers" data-key="id" paginator :rows="3" :rows-per-page-options="[3, 5]">
          <Column field="title" header="标题" />
          <Column field="author" header="第一作者" />
          <Column field="cited" header="被引" style="text-align: end" />
        </DataTable>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
