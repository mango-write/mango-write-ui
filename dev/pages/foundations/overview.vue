<script setup lang="ts">
import { Filter, Plus } from "lucide-vue-next";
import { Button, InputText, Tag } from "../../../src";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";

const principles = [
  { n: "01", t: "纸先于一切", e: "Paper first", d: "正文落在不透明、偏暖的纸面上；壳、工具条、侧栏退后，不与内容抢亮度。" },
  { n: "02", t: "浮起来的才是霜", e: "Frost for floating", d: "只有浮在内容之上的层用毛玻璃；霜底色足够厚，文字永远可读。同屏霜层 ≤ 2。" },
  { n: "03", t: "着色不铺色", e: "Tint, don't paint", d: "组件内部的填充都是半透明叠层，放在纸面、画布、霜面上都成立，材质不被实色块打断。" },
  { n: "04", t: "橙色只给动作", e: "Ember for action", d: "品牌橙只用于主操作、选中、焦点与关键强调；一个区块至多一个实心主按钮。" },
  { n: "05", t: "一根尺寸轴", e: "One size axis", d: "高度、字号、图标、内距、圆角由同一档位派生；密度由容器决定，不由组件各自决定。" },
  { n: "06", t: "安静的动", e: "Quiet motion", d: "动效解释因果，不表演；只动 transform、opacity 与颜色，尊重减少动态偏好。" },
];

const layers = [
  ["① Palette", "--palette-*", "原料色板；只给语义层用，组件禁止引用"],
  ["② Scale", "--space-* · --size-* · --type-* · --radius-* · --duration-* · --z-*", "与主题无关的刻度"],
  ["③ Semantic", "--bg-* · --text-* · --accent · --danger …", "语义色；浅色基值 + 深色覆盖"],
  ["④ Derived", "--fill-* · --border-* · --*-subtle · --focus-*", "由语义派生的半透明叠层"],
  ["⑤ Domain", "--color-mark-* · --code-* · --lightbox-* · --site-*", "业务域专用"],
  ["⑥ Legacy", "--color-brand-* · --material-* …", "旧名映射，只给存量 app；冻结"],
];
</script>

<template>
  <DocPage lead="内容是纸，浮层是霜，橙色只给动作。研究者长时间面对文字与资料，界面要安静、可预测、层次一眼可辨。">
    <DocSection title="一眼看懂" desc="同一组控件放在纸面与霜面、浅色与深色上——这套语言的全部承诺就是它们看起来是同一家人。">
      <Specimen :surfaces="['paper', 'frost']">
        <InputText placeholder="搜索文献、草稿或引用" style="width: 220px" />
        <Button severity="secondary" label="筛选" :icon="Filter" />
        <Button label="导入文献" :icon="Plus" />
        <Tag value="已同步" severity="success" />
      </Specimen>
    </DocSection>

    <DocSection title="六条原则" desc="冲突时按序取舍。">
      <div class="doc-grid">
        <div v-for="p in principles" :key="p.n" class="doc-card">
          <p class="doc__eyebrow">{{ p.n }} · {{ p.e }}</p>
          <h3 style="margin-top: var(--space-1-5)">{{ p.t }}</h3>
          <p>{{ p.d }}</p>
        </div>
      </div>
    </DocSection>

    <DocSection title="Token 结构" desc="组件只读 ②③④⑤ 与自己的 --mw-* 局部变量；门禁 scripts/check-tokens.mjs 强制。">
      <table class="doc-table">
        <thead>
          <tr><th>层</th><th>示例</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr v-for="l in layers" :key="l[0]">
            <td style="white-space: nowrap; font-weight: var(--weight-medium)">{{ l[0] }}</td>
            <td><code>{{ l[1] }}</code></td>
            <td>{{ l[2] }}</td>
          </tr>
        </tbody>
      </table>
    </DocSection>

    <DocSection title="怎么读这个站">
      <ul class="doc-rules">
        <li>每个示例都在<strong>浅色与深色并排</strong>渲染（主题作用域可以挂在任意元素上）；右上角切换的是页面本身与浮层的主题。</li>
        <li><strong>霜面</strong>示例底下垫了有色内容（色块、高亮、正文），用来检验霜的可读性与整体性。</li>
        <li>数值都是实时从 <span class="doc-code">var.css</span> 读出来的；规范正文见包内 <span class="doc-code">DESIGN.md</span>。</li>
      </ul>
    </DocSection>
  </DocPage>
</template>
