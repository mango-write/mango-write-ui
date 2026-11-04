<script setup lang="ts">
import { ref } from "vue";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "../../../src";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";

const activeTab = ref("outline");
const frostTab = ref("notes");
</script>

<template>
  <DocPage lead="标签页：在同一容器内切换不同内容分区。底栏下划线指示当前激活页签，方向键可在页签间巡航。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">切换并列的内容子视图（如「大纲 / 批注 / 引用」），且各页签结构独立。</li>
        <li data-kind="do">页签数控制在 2–6 个，标签简洁（2–6 字）。</li>
        <li data-kind="dont">只切同一列表的筛选条件或视图密度时用 <code>SelectButton</code>。</li>
        <li data-kind="dont">不要嵌套两层水平 <code>Tabs</code>；二级分区改用侧栏或分段控件。</li>
      </ul>
    </DocSection>

    <DocSection title="底面" desc="纸面与霜面并排。页签底边使用 --border-subtle，激活指示条使用 --accent。">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <Tabs v-model:value="activeTab">
          <TabList>
            <Tab value="outline">章节大纲</Tab>
            <Tab value="notes">阅读批注</Tab>
            <Tab value="refs">参考文献</Tab>
            <Tab value="history" disabled>历史版本</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="outline">
              <p class="doc-note">1. 引言 · 2. 相关工作 · 3. 实验设计与语料评估</p>
            </TabPanel>
            <TabPanel value="notes">
              <p class="doc-note">共 12 条高亮批注，3 条待合并至正文草稿。</p>
            </TabPanel>
            <TabPanel value="refs">
              <p class="doc-note">已引用 28 篇文献（GB/T 7714 格式校验通过）。</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Specimen>
    </DocSection>

    <DocSection title="深浅主题对照" desc="支持键盘 Home / End / 左右方向键切换与禁用项跳过。">
      <Specimen themes="both" layout="stack">
        <Tabs v-model:value="frostTab">
          <TabList>
            <Tab value="notes">批注列表</Tab>
            <Tab value="figures">图表索引</Tab>
            <Tab value="locked" disabled>审阅意见（只读）</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="notes">
              <p class="doc-note">第 4 页锚点：模型在小样本条件下表现显著优于基线。</p>
            </TabPanel>
            <TabPanel value="figures">
              <p class="doc-note">图 1 架构总览 · 图 2 消融实验对比 · 表 1 数据集统计</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <table class="doc-table">
        <thead>
          <tr><th>组件 / 属性</th><th>取值</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><code>Tabs v-model:value</code></td><td><code>string | number</code></td><td>当前激活的页签值（亦兼容 <code>v-model</code>）</td></tr>
          <tr><td><code>Tabs orientation</code></td><td><code>horizontal · vertical</code></td><td>排列方向，默认 <code>horizontal</code></td></tr>
          <tr><td><code>Tab value</code></td><td><code>string | number</code></td><td>页签唯一标识，与对应 <code>TabPanel</code> 配对</td></tr>
          <tr><td><code>Tab disabled</code></td><td><code>boolean</code></td><td>禁用该页签，键盘导航自动跳过</td></tr>
        </tbody>
      </table>
    </DocSection>
  </DocPage>
</template>
