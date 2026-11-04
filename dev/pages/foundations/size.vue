<script setup lang="ts">
import { ref } from "vue";
import { Filter, Search, Settings2 } from "lucide-vue-next";
import { Button, InputText } from "../../../src";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import { useTokenValues } from "../../kit/tokens";

const sizes = ["xs", "sm", "md", "lg"] as const;
const parts = ["h", "font", "icon", "px", "gap", "radius"] as const;
const usage: Record<(typeof sizes)[number], string> = {
  xs: "嵌入式微控件",
  sm: "紧凑行、表格行内",
  md: "默认：表单、对话框、页头",
  lg: "营销与空态主 CTA",
};
const spaces = ["0-5", "1", "1-5", "2", "2-5", "3", "4", "5", "6", "8", "10", "12", "16", "20"];

const host = ref<HTMLElement | null>(null);
const { values } = useTokenValues(host, () => [
  ...sizes.flatMap((s) => parts.map((p) => `--size-${s}-${p}`)),
  ...spaces.map((s) => `--space-${s}`),
]);

function px(v: string | undefined) {
  if (!v) return "";
  return v.endsWith("rem") ? `${Number.parseFloat(v) * 16}px` : v;
}
const field = ref("");
</script>

<template>
  <DocPage lead="一根尺寸轴派生控件的全部几何；4px 网格组织所有间距。密度由容器决定，不由组件各自决定。">
    <DocSection title="尺寸轴" desc="每档一次定义高度、字号、图标、横向内距、间隙与圆角。图标约为高度的一半，icon-only 控件恒为正方形。">
      <div ref="host">
        <table class="doc-table">
          <thead>
            <tr>
              <th>档</th><th>高</th><th>字号</th><th>图标</th><th>内距</th><th>间隙</th><th>圆角</th><th>用途</th><th>示例</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in sizes" :key="s">
              <td><code>{{ s }}</code></td>
              <td v-for="p in parts" :key="p" class="mw-tabular">{{ px(values[`--size-${s}-${p}`]) }}</td>
              <td>{{ usage[s] }}</td>
              <td>
                <div class="doc-row" :class="`mw-size-${s}`" style="flex-wrap: nowrap; gap: var(--space-2)">
                  <InputText v-model="field" placeholder="检索" style="width: 96px" />
                  <Button label="应用" />
                  <Button variant="text" severity="secondary" :icon="Settings2" aria-label="设置" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DocSection>

    <DocSection
      title="密度上下文"
      desc="组件读继承的 --control-*。传 size = 该组件定档；容器挂 .mw-size-* = 容器内所有未定档控件跟随。这是改密度的唯一方式。"
    >
      <Specimen themes="single" layout="stack">
        <div class="doc-row">
          <span class="doc-note" style="width: 96px">默认（md）</span>
          <InputText placeholder="搜索文献" style="width: 200px" />
          <Button severity="secondary" label="筛选" :icon="Filter" />
          <Button label="导入" />
        </div>
        <div class="doc-row mw-size-sm">
          <span class="doc-note" style="width: 96px">容器 .mw-size-sm</span>
          <InputText placeholder="搜索文献" style="width: 200px" />
          <Button severity="secondary" label="筛选" :icon="Filter" />
          <Button label="导入" />
        </div>
        <div class="doc-row mw-toolbar">
          <span class="doc-note" style="width: 96px">工具条角色</span>
          <InputText placeholder="搜索文献" style="width: 200px" />
          <Button severity="secondary" label="筛选" :icon="Filter" />
          <Button severity="secondary" class="is-active" label="仅看我的" />
          <Button variant="text" severity="secondary" :icon="Search" aria-label="搜索" />
        </div>
      </Specimen>
      <ul class="doc-rules">
        <li data-kind="do">同一行里的输入、下拉、按钮必须同档——容器定档天然保证这一点。</li>
        <li data-kind="dont">不为省空间把单个控件缩成 sm；省空间的正解是收窄容器、砍字段。</li>
        <li>触屏（pointer: coarse）下控件视觉不变，命中区由伪元素扩到 <span class="doc-code">--hit-min</span>。</li>
      </ul>
    </DocSection>

    <DocSection title="间距" desc="4px 网格。组件内部 1 / 1.5 / 2 / 3；组件之间 2 / 3 / 4；区块之间 6 / 8；页面级 12 / 16。半档（0-5 / 1-5 / 2-5）只给控件内部微调。">
      <div class="space-scale">
        <div v-for="s in spaces" :key="s" class="space-row">
          <code>--space-{{ s }}</code>
          <span class="mw-tabular">{{ values[`--space-${s}`] }}</span>
          <span class="space-bar" :style="{ width: `var(--space-${s})` }" />
        </div>
      </div>
    </DocSection>
  </DocPage>
</template>

<style scoped>
.space-scale {
  display: grid;
  gap: var(--space-1-5);
}

.space-row {
  display: grid;
  grid-template-columns: 120px 48px 1fr;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--type-caption-size);
  color: var(--text-secondary);
}

.space-row code {
  font-family: var(--font-mono);
  color: var(--text-primary);
}

.space-bar {
  height: 12px;
  border-radius: var(--radius-2xs);
  background: var(--accent);
}
</style>
