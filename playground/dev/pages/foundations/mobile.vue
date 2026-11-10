<script setup lang="ts">
import { ref } from "vue";
import {
  MpButton,
  MpCell,
  MpFilterChip,
  MpInput,
  MpNotice,
  MpThemeProvider,
} from "@mango-write/ui-mp";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import { MP_DEVICE_PRESETS } from "../../mobile-demos/state";
import { t } from "../../i18n";

const text = ref("");
const principles = [
  {
    title: { zh: "内容先于装饰", en: "Content before decoration" },
    body: { zh: "单列信息流默认通栏，标题、正文和来源拥有完整宽度。卡片只用于真正需要分组的短内容。", en: "Flush single-column feeds give titles, prose, and sources full width. Cards only group genuinely related short content." },
  },
  {
    title: { zh: "动作先于零件", en: "Actions before parts" },
    body: { zh: "一个视图一个主要动作。独立触控目标至少 44px，不用微型按钮和透明热区伪装可用性。", en: "One primary action per view. Every independent target is at least 44px, without tiny controls or invisible hit areas." },
  },
  {
    title: { zh: "反馈解释结果", en: "Feedback explains outcomes" },
    body: { zh: "Sheet 管理轻量任务，长文编辑使用独立页面。Toast 不堆叠，Confirm 默认聚焦取消。", en: "Sheets handle lightweight tasks and long editing gets a full page. Toasts do not stack and confirmation focuses cancel." },
  },
];
const sizes = [
  ["sm", "36px", "13px", t({ zh: "次要动作、清空与紧凑控件", en: "Secondary actions and compact controls" })],
  ["md", "44px", "15px", t({ zh: "默认按钮与输入", en: "Default buttons and inputs" })],
  ["lg", "48px", "16px", t({ zh: "页面底部主动作", en: "Primary bottom actions" })],
];
</script>

<template>
  <DocPage>
    <DocSection :title="{ zh: '移动是研究信息流', en: 'Mobile is a research feed' }" :desc="{ zh: '不是桌面组件的缩小版，也不是卡片与浮层的陈列。三个核心任务是快速记录、可靠查阅和带空间上下文提问。', en: 'Mobile is not a shrunken desktop or a gallery of cards and overlays. The core tasks are capture, reading, and contextual questions.' }">
      <div class="mp-principles">
        <section v-for="item in principles" :key="item.title.en">
          <h3>{{ t(item.title) }}</h3>
          <p>{{ t(item.body) }}</p>
        </section>
      </div>
    </DocSection>

    <DocSection :title="{ zh: '真实组件标本', en: 'Real component specimens' }" :desc="{ zh: '相同语义组件在纸与霜双底面上保持一致层级；输入框使用凹陷底色，主按钮统一橙底白字。', en: 'The same semantic components preserve hierarchy across light and dark surfaces, with sunken inputs and white text on primary orange.' }">
      <Specimen themes="both" layout="stack">
        <MpThemeProvider class="mp-foundation-specimen">
          <MpInput v-model="text" :placeholder="t({ zh: '搜索标题、作者或 DOI', en: 'Search title, author, or DOI' })" clearable />
          <MpCell :title="t({ zh: '长文档证据召回实验', en: 'Long-document evidence retrieval experiment' })" :subtitle="t({ zh: 'ColBERTv2 重排提升 Top-5 召回率 6.4%。', en: 'ColBERTv2 reranking improves Top-5 recall by 6.4%.' })" :meta="t({ zh: '实验记录 · 10 分钟前', en: 'Experiment log · 10m ago' })" clickable arrow />
          <div class="doc-row"><MpFilterChip :label="t({ zh: '实验记录', en: 'Experiment log' })" selected /><MpButton :label="t({ zh: '记录新日志', en: 'New entry' })" /></div>
          <MpNotice tone="primary" :title="t({ zh: '来源随内容流动', en: 'Provenance travels with content' })">{{ t({ zh: '文献标题与 DOI 会随摘录保留。', en: 'Paper title and DOI travel with the excerpt.' }) }}</MpNotice>
        </MpThemeProvider>
      </Specimen>
    </DocSection>

    <DocSection :title="{ zh: '排版与触控', en: 'Typography and touch' }" :desc="{ zh: '正文 15/22px、阅读 16/26px、辅助 13/20px、元信息 12/18px；图标使用 18/20/22/24px 角色尺寸。', en: 'Body 15/22, reading 16/26, supporting 13/20, metadata 12/18; icons use 18/20/22/24px roles.' }">
      <table class="doc-table">
        <thead><tr><th>{{ t({ zh: "档位", en: "Size" }) }}</th><th>{{ t({ zh: "可见高度", en: "Height" }) }}</th><th>{{ t({ zh: "字号", en: "Font" }) }}</th><th>{{ t({ zh: "用途", en: "Usage" }) }}</th></tr></thead>
        <tbody><tr v-for="row in sizes" :key="row[0]"><td><strong>{{ row[0] }}</strong></td><td><code>{{ row[1] }}</code></td><td><code>{{ row[2] }}</code></td><td>{{ row[3] }}</td></tr></tbody>
      </table>
    </DocSection>

    <DocSection :title="{ zh: '设备视口基准与 1:1 预览矩阵', en: 'Device viewport benchmark and 1:1 matrix' }" :desc="{ zh: '移动端开发统一以 iPhone 18 Pro（402 × 874 CSS px，6.3 英寸 @3x）作为 1:1 基准视口，并提供 Pro Max、主流 21:9 Android、华为 Pura X（16:10 阔折叠）与 iPhone Duo（折叠展开态）多形态切换与自适应响应。', en: 'Mobile development standardizes on iPhone 18 Pro (402 × 874 CSS px, 6.3-inch @3x) for 1:1 rendering, with one-click switching across Pro Max, 21:9 Android, HUAWEI Pura X (16:10 wide fold), and iPhone Duo (fold expanded).' }">
      <table class="doc-table">
        <thead>
          <tr>
            <th>{{ t({ zh: "机型预设", en: "Device Preset" }) }}</th>
            <th>{{ t({ zh: "逻辑视口 (CSS px)", en: "Logical Viewport (CSS px)" }) }}</th>
            <th>{{ t({ zh: "比例 / 分辨率 / DPR", en: "Aspect / Physical / DPR" }) }}</th>
            <th>{{ t({ zh: "尺寸 / 安全区 (上/下)", en: "Size / Safe Area (T/B)" }) }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="device in MP_DEVICE_PRESETS" :key="device.id">
            <td><strong>{{ t(device.name) }}</strong></td>
            <td><code>{{ device.width }} × {{ device.height }}</code></td>
            <td><code>{{ device.aspect }} · {{ device.physical }} · @{{ device.dpr }}x</code></td>
            <td><code>{{ device.diagonal }} · {{ device.safeTop }}px / {{ device.safeBottom }}px</code></td>
          </tr>
        </tbody>
      </table>
    </DocSection>
  </DocPage>
</template>

<style scoped>
.mp-principles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-4);
}

.mp-principles section {
  padding: var(--space-4);
  border-top: var(--border-width) solid var(--border-subtle);
}

.mp-principles h3 {
  margin: 0 0 var(--space-2);
  font-size: var(--type-title-sm-size);
}

.mp-principles p {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--type-body-size);
  line-height: var(--type-body-line);
}

.mp-foundation-specimen {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
}
</style>
