<script setup lang="ts">
import { computed, ref } from "vue";
import { Plus } from "lucide-vue-next";
import { Button, Column, DataTable } from "@mango-write/ui-vue";
import { api } from "../../api/entries/data-table";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/data-table";

interface Paper {
  id: number;
  title: string;
  author: string;
  year: number;
  cited: number;
}

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  do1: {
    zh: "记录有多个可比较的字段，用户需要扫读、排序或批量选择：文献清单、团队成员、审计日志。",
    en: "Records with multiple comparable fields that users scan, sort, or bulk-select: reference lists, team members, audit logs.",
  },
  do2: {
    zh: "数字列（年份、被引次数、额度）右对齐，表格已默认启用等宽数字。",
    en: "Right-align numeric columns (year, citation count, quota); tabular numerals are on by default.",
  },
  do3: {
    zh: "空态写清原因并给出下一步动作（经 <code>#empty</code> 插槽放一个按钮）。",
    en: "Empty states state the reason and offer the next step (put a button in the <code>#empty</code> slot).",
  },
  dont1: {
    zh: "字段少于三个、以阅读为主的内容用列表或分组卡，不要用表格。",
    en: "For fewer than three fields or reading-focused content, use a list or grouped cards instead of a table.",
  },
  dont2: {
    zh: "不在表格外再套一层卡片边框；需要嵌入已有卡片时用 <code>--mw-datatable-border: transparent</code> 去掉外框。",
    en: "Don't wrap the table in another card border; when embedding inside an existing card, drop the frame with <code>--mw-datatable-border: transparent</code>.",
  },
  basicTitle: { zh: "基本", en: "Basics" },
  basicDesc: {
    zh: "表头 caption 字号、tertiary 色；行高默认 40px（--size-lg-h），hover 是极浅墨色叠层。",
    en: "Header cells use caption size in tertiary color; row height defaults to 40px (--size-lg-h), and hover is a very light ink overlay.",
  },
  colTitle: { zh: "标题", en: "Title" },
  colAuthor: { zh: "作者", en: "Author" },
  colYear: { zh: "年份", en: "Year" },
  colCited: { zh: "被引", en: "Cited" },
  sizeTitle: { zh: "尺寸", en: "Sizes" },
  sizeDesc: {
    zh: "sm 为紧凑档（行高 32px），lg 给宽松阅读；不传 size 时字号跟随密度上下文，表格内的勾选与展开按钮一起切档。",
    en: "sm is the compact tier (32px rows), lg is for relaxed reading; without a size, the font follows the density context and the table's checkboxes and expanders switch tiers along with it.",
  },
  selTitle: { zh: "选择与展开", en: "Selection and expansion" },
  selDesc: {
    zh: "选中行是品牌色的半透明叠层；勾选框是可输入面，选中后转实心品牌色。",
    en: "Selected rows get a translucent brand overlay; the checkbox is an input surface that turns solid brand color when checked.",
  },
  stateTitle: { zh: "状态", en: "States" },
  stateDesc: {
    zh: "排序表头可用 Tab 聚焦、回车切换；加载时整体蒙一层半透明表面色，空态居中并给出下一步。",
    en: "Sortable headers focus with Tab and toggle with Enter; loading overlays a translucent surface tint, and the empty state centers with a next step.",
  },
  colTable: { zh: "表格", en: "Table" },
  rowDefault: { zh: "默认", en: "Default" },
  rowSelected: { zh: "选中", en: "Selected" },
  rowSorted: { zh: "排序", en: "Sorted" },
  rowLoading: { zh: "加载", en: "Loading" },
  rowEmpty: { zh: "空", en: "Empty" },
  emptyText: { zh: "文献库里还没有条目", en: "No entries in the library yet" },
  importBtn: { zh: "导入文献", en: "Import references" },
  pagerTitle: { zh: "分页", en: "Pagination" },
  pagerDesc: {
    zh: "分页器嵌在卡片底部，与表格共用分隔线。",
    en: "The paginator sits inside the card footer, sharing the table's divider lines.",
  },
  scrollTitle: { zh: "固定高度滚动（Scrollable）", en: "Fixed-height scrolling (scrollable)" },
  scrollDesc: {
    zh: "开启 scrollable 与 scrollHeight 时表头吸顶保持 100% 清晰，表体上下溢出出口自动施加 24px 滚动边缘渐隐。",
    en: "With scrollable and scroll-height on, the header stays pinned and fully crisp, and the body's overflow edges get an automatic 24px scroll fade.",
  },
  api: { zh: "接口", en: "API" },
} as const;

/* DataTable 直读字符串字段,假数据按当前语言整体重建 */
const papers = computed<Paper[]>(() => [
  { id: 1, title: t({ zh: "检索增强生成在综述写作中的应用", en: "Retrieval-augmented generation in review writing" }), author: t({ zh: "张伟", en: "Zhang Wei" }), year: 2024, cited: 128 },
  { id: 2, title: t({ zh: "大语言模型的引用幻觉评估", en: "Evaluating citation hallucination in LLMs" }), author: t({ zh: "李娜", en: "Li Na" }), year: 2023, cited: 342 },
  { id: 3, title: t({ zh: "学术写作中的来源锚点设计", en: "Designing source anchors for academic writing" }), author: t({ zh: "王磊", en: "Wang Lei" }), year: 2022, cited: 57 },
  { id: 4, title: t({ zh: "跨语言文献去重方法比较", en: "Comparing cross-language reference deduplication" }), author: t({ zh: "陈静", en: "Chen Jing" }), year: 2021, cited: 1093 },
  { id: 5, title: t({ zh: "科研日志的结构化沉淀", en: "Structured capture of research logs" }), author: t({ zh: "刘洋", en: "Liu Yang" }), year: 2024, cited: 9 },
  { id: 6, title: t({ zh: "多模态图表问答基准构建", en: "Building multimodal figure-QA benchmarks" }), author: t({ zh: "赵敏", en: "Zhao Min" }), year: 2024, cited: 74 },
  { id: 7, title: t({ zh: "协同文档中的细粒度恢复点", en: "Fine-grained restore points in collaborative documents" }), author: t({ zh: "孙浩", en: "Sun Hao" }), year: 2023, cited: 165 },
]);

const few = computed(() => papers.value.slice(0, 3));
const selected = ref<Paper[]>([papers.value[1]!]);
const selectedSmall = ref<Paper[]>([few.value[0]!]);
const expanded = ref<Paper[]>([]);

function expansionNote(data: Paper): string {
  return t({
    zh: `《${data.title}》· ${data.author} · 已被引用 ${data.cited} 次`,
    en: `"${data.title}" · ${data.author} · cited ${data.cited} times`,
  });
}
</script>

<template>
  <DocPage>
    <DocSection :title="s.demo" :desc="s.demoDesc">
      <UsagePlayground :entry="usage" />
    </DocSection>
    <DocSection :title="s.whenToUse">
      <ul class="doc-rules">
        <li data-kind="do" v-html="t(s.do1)" />
        <li data-kind="do" v-html="t(s.do2)" />
        <li data-kind="do" v-html="t(s.do3)" />
        <li data-kind="dont" v-html="t(s.dont1)" />
        <li data-kind="dont" v-html="t(s.dont2)" />
      </ul>
    </DocSection>

    <DocSection :title="s.basicTitle" :desc="s.basicDesc">
      <Specimen :surfaces="['paper', 'canvas']" layout="stack">
        <DataTable :value="papers" data-key="id" row-hover>
          <Column field="title" :header="t(s.colTitle)" sortable />
          <Column field="author" :header="t(s.colAuthor)" sortable />
          <Column field="year" :header="t(s.colYear)" sortable style="text-align: end" />
          <Column field="cited" :header="t(s.colCited)" sortable style="text-align: end" />
        </DataTable>
      </Specimen>
    </DocSection>

    <DocSection :title="s.sizeTitle" :desc="s.sizeDesc">
      <Specimen themes="single" layout="stack">
        <div v-for="sz in (['sm', 'md', 'lg'] as const)" :key="sz" class="doc-stack">
          <span class="doc-note">size="{{ sz }}"</span>
          <DataTable :value="few" data-key="id" :size="sz">
            <Column field="title" :header="t(s.colTitle)" />
            <Column field="author" :header="t(s.colAuthor)" />
            <Column field="cited" :header="t(s.colCited)" style="text-align: end" />
          </DataTable>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.selTitle" :desc="s.selDesc">
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
          <Column field="title" :header="t(s.colTitle)" />
          <Column field="year" :header="t(s.colYear)" style="text-align: end" />
          <template #expansion="{ data }">
            <span class="doc-note">{{ expansionNote(data) }}</span>
          </template>
        </DataTable>
      </Specimen>
    </DocSection>

    <DocSection :title="s.stateTitle" :desc="s.stateDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colTable]" label-width="64px">
          <StateRow :label="s.rowDefault">
            <DataTable :value="few.slice(0, 2)" data-key="id" size="sm" style="width: 360px; max-width: 100%">
              <Column field="title" :header="t(s.colTitle)" />
              <Column field="cited" :header="t(s.colCited)" style="text-align: end" />
            </DataTable>
          </StateRow>
          <StateRow :label="s.rowSelected">
            <DataTable
              v-model:selection="selectedSmall"
              :value="few.slice(0, 2)"
              data-key="id"
              size="sm"
              style="width: 360px; max-width: 100%"
            >
              <Column selection-mode="multiple" style="width: 40px" />
              <Column field="title" :header="t(s.colTitle)" />
            </DataTable>
          </StateRow>
          <StateRow :label="s.rowSorted">
            <DataTable
              :value="few"
              data-key="id"
              size="sm"
              sort-field="cited"
              :sort-order="-1"
              style="width: 360px; max-width: 100%"
            >
              <Column field="title" :header="t(s.colTitle)" sortable />
              <Column field="cited" :header="t(s.colCited)" sortable style="text-align: end" />
            </DataTable>
          </StateRow>
          <StateRow :label="s.rowLoading">
            <DataTable :value="few.slice(0, 2)" data-key="id" size="sm" loading style="width: 360px; max-width: 100%">
              <Column field="title" :header="t(s.colTitle)" />
              <Column field="cited" :header="t(s.colCited)" style="text-align: end" />
            </DataTable>
          </StateRow>
          <StateRow :label="s.rowEmpty">
            <DataTable :value="[]" data-key="id" size="sm" style="width: 360px; max-width: 100%">
              <Column field="title" :header="t(s.colTitle)" />
              <Column field="cited" :header="t(s.colCited)" />
              <template #empty>
                <div class="doc-stack" style="justify-items: center">
                  <span>{{ t(s.emptyText) }}</span>
                  <Button size="sm" variant="tinted" :label="t(s.importBtn)" :icon="Plus" />
                </div>
              </template>
            </DataTable>
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection :title="s.pagerTitle" :desc="s.pagerDesc">
      <Specimen themes="single" layout="stack">
        <DataTable :value="papers" data-key="id" paginator :rows="3" :rows-per-page-options="[3, 5]">
          <Column field="title" :header="t(s.colTitle)" />
          <Column field="author" :header="t(s.colAuthor)" />
          <Column field="cited" :header="t(s.colCited)" style="text-align: end" />
        </DataTable>
      </Specimen>
    </DocSection>

    <DocSection :title="s.scrollTitle" :desc="s.scrollDesc">
      <Specimen themes="both" layout="stack">
        <DataTable :value="papers" data-key="id" scrollable scroll-height="196px" row-hover>
          <Column field="title" :header="t(s.colTitle)" sortable />
          <Column field="author" :header="t(s.colAuthor)" />
          <Column field="year" :header="t(s.colYear)" style="text-align: end" />
          <Column field="cited" :header="t(s.colCited)" sortable style="text-align: end" />
        </DataTable>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
