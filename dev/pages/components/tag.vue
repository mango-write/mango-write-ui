<script setup lang="ts">
import { BookOpen, CheckCircle2, Clock, Sparkles, Tag as TagIcon, TriangleAlert } from "lucide-vue-next";
import { Tag } from "../../../src";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const severities = [
  { label: "主色 primary", value: "primary", text: "期刊论文" },
  { label: "次要 secondary", value: "secondary", text: "预印本" },
  { label: "成功 success", value: "success", text: "已核验" },
  { label: "信息 info", value: "info", text: "同步中" },
  { label: "警告 warning", value: "warning", text: "待补全" },
  { label: "危险 danger", value: "danger", text: "引用缺失" },
  { label: "反色 contrast", value: "contrast", text: "置顶" },
] as const;

const sizes = ["xs", "sm", "md", "lg"] as const;
</script>

<template>
  <DocPage lead="语义标签：用于标记文献类型、审阅状态或属性分类。采用柔和着色底与语义正文色，不抢夺主操作焦点。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">标记条目的分类、阶段或状态：「已核验」「预印本」「DOI 已解析」。</li>
        <li data-kind="do">需要圆润胶囊外观时开启 <code>rounded</code>；可搭配图标增强辨识度。</li>
        <li data-kind="dont">纯数字角标或未读圆点请用 <code>Badge</code>；需要用户交互删除的筛选项请用 <code>Chip</code>。</li>
        <li data-kind="dont">不要把 <code>Tag</code> 当作主按钮使用；它默认是静态或轻度可点击的元信息载体。</li>
      </ul>
    </DocSection>

    <DocSection title="底面" desc="纸面与霜面并排。柔和着色底在两种底面上均保持充足的文字对比度。">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <div class="doc-row">
          <Tag v-for="s in severities" :key="s.value" :severity="s.value" :value="s.text" />
        </div>
        <div class="doc-row">
          <Tag severity="primary" rounded :icon="Sparkles" value="AI 提炼" />
          <Tag severity="success" rounded :icon="CheckCircle2" value="锚点已对齐" />
          <Tag severity="info" rounded :icon="Clock" value="后台解析" />
          <Tag severity="warning" rounded :icon="TriangleAlert" value="元数据待确认" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="尺寸" desc="自身不设独立 size 属性，直接跟随容器的 .mw-size-* 密度上下文缩放高度、字号与图标。">
      <Specimen themes="single" layout="stack">
        <div v-for="s in sizes" :key="s" class="doc-row" :class="`mw-size-${s}`">
          <span class="doc-note" style="width: 24px">{{ s }}</span>
          <Tag severity="primary" :icon="BookOpen" value="文献精读" />
          <Tag severity="secondary" value="2026" />
          <Tag severity="success" rounded value="已归档" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="状态" desc="各语义色在标准圆角、胶囊圆角（rounded）、带图标与胶囊图标下的表现。">
      <Specimen themes="both">
        <StateGrid :columns="['标准圆角', '胶囊 rounded', '带图标', '胶囊 + 图标']" label-width="88px">
          <StateRow v-for="s in severities" :key="s.value" :label="s.label.split(' ')[0]">
            <Tag :severity="s.value" :value="s.text" />
            <Tag :severity="s.value" rounded :value="s.text" />
            <Tag :severity="s.value" :icon="TagIcon" :value="s.text" />
            <Tag :severity="s.value" rounded :icon="BookOpen" :value="s.text" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <table class="doc-table">
        <thead>
          <tr><th>属性 / 事件 / 插槽</th><th>取值</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><code>value</code></td><td><code>string | number | null</code></td><td>标签文本内容</td></tr>
          <tr><td><code>severity</code></td><td><code>primary · secondary · success · info · warn · warning · danger · contrast</code></td><td>语义色彩；默认 <code>primary</code></td></tr>
          <tr><td><code>rounded</code></td><td><code>boolean</code></td><td>是否使用胶囊圆角（<code>--radius-full</code>）；默认 <code>false</code></td></tr>
          <tr><td><code>icon</code></td><td><code>Component</code></td><td>前置 Lucide 图标组件</td></tr>
          <tr><td><code>@click</code></td><td><code>(event: MouseEvent) =&gt; void</code></td><td>点击标签时触发</td></tr>
          <tr><td><code>#icon</code> / <code>#default</code></td><td>—</td><td>自定义图标或标签主体内容</td></tr>
        </tbody>
      </table>
    </DocSection>
  </DocPage>
</template>
