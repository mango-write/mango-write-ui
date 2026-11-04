<script setup lang="ts">
import { ref } from "vue";
import {
  Ban,
  BookOpen,
  Bookmark,
  Check,
  Code,
  Copy,
  Download,
  File,
  FileText,
  Menu as MenuIcon,
  Trash2,
} from "lucide-vue-next";
import { Badge, Button, Menu, useNotify, type MenuItem } from "../../../src";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const notify = useNotify();
const popupMenuRef = ref<InstanceType<typeof Menu> | null>(null);
const statePopupRef = ref<InstanceType<typeof Menu> | null>(null);

const basicItems: MenuItem[] = [
  {
    label: "打开文献详情",
    icon: BookOpen,
    shortcut: "↵",
    command: () => notify.info("已打开文献详情"),
  },
  {
    label: "复制 BibTeX 引用",
    icon: Copy,
    shortcut: "⌘C",
    command: () => notify.success("已复制 BibTeX 到剪贴板"),
  },
  {
    label: "导出批注笔记",
    icon: Download,
    command: () => notify.info("已开始导出 Markdown 笔记"),
  },
  { separator: true },
  {
    label: "从文库移除",
    icon: Trash2,
    danger: true,
    command: () => notify.warn("已移入文库回收站"),
  },
];

const groupedItems: MenuItem[] = [
  {
    label: "导出格式",
    items: [
      { label: "Word 文档 (.docx)", icon: File, shortcut: "⌘E" },
      { label: "LaTeX 源码包 (.zip)", icon: Code },
      { label: "PDF 预印本 (.pdf)", icon: FileText, disabled: true },
    ],
  },
  { separator: true },
  {
    label: "版本管理",
    items: [
      { label: "创建里程碑快照", icon: Bookmark, shortcut: "⌘S" },
      { label: "清空历史草稿", icon: Trash2, danger: true },
    ],
  },
];
</script>

<template>
  <DocPage
    lead="命令菜单：展示分组命令、快捷键提示与分隔线。既可内联常驻为面板导航（popup: false），也可挂 popup 作为霜面下拉菜单（.mw-frost）锚定触发器弹出。"
  >
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">触发按钮下方的单层或带组标题（<code>items</code>）命令面板，如导出菜单、账户中心、文档操作。</li>
        <li data-kind="do">需要带头部身份区（<code>#start</code>）或底部元信息区（<code>#end</code>）的命令列表。</li>
        <li data-kind="dont">需要多级悬停子菜单（<code>▸</code>）或右键鼠标坐标定位时，用 <code>ActionMenu</code>。</li>
        <li data-kind="dont">需要在表单中持有并回显选中值时用 <code>Select</code> 或 <code>Listbox</code>；菜单只触发命令。</li>
      </ul>
    </DocSection>

    <DocSection
      title="底面与弹出模式"
      desc="内联菜单直接融入当前表面；popup 模式传送至 body 并自动启用 .mw-frost 毛玻璃。点击按钮体验弹出菜单，或直接在内联菜单上使用上下方向键导航。"
    >
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <div class="doc-row">
          <Button
            size="sm"
            severity="secondary"
            :icon="MenuIcon"
            label="点击弹出霜面菜单"
            @click="popupMenuRef?.toggle($event)"
          />
        </div>
        <Menu :model="basicItems" aria-label="文献操作菜单" />
      </Specimen>

      <Menu ref="popupMenuRef" :model="basicItems" popup aria-label="弹出文献操作菜单" />
    </DocSection>

    <DocSection
      title="分组与头尾插槽"
      desc="在 MenuItem 中传入 items 数组即可渲染小字号分组标题（submenulabel）；#start 与 #end 插槽可在列表首尾固定账户信息或状态说明。"
    >
      <Specimen themes="single">
        <Menu :model="groupedItems" aria-label="分组导出菜单" />

        <Menu :model="basicItems" aria-label="带头尾插槽菜单">
          <template #start>
            <div class="menu-slot-head">
              <div class="menu-slot-head__row">
                <strong>林蔚 · 课题组空间</strong>
                <Badge severity="primary">Pro</Badge>
              </div>
              <span class="doc-note">linwei@example.edu.cn</span>
            </div>
          </template>
          <template #end>
            <div class="menu-slot-foot">
              <span class="doc-note">支持 ↑↓ / Home / End 键盘导航</span>
            </div>
          </template>
        </Menu>
      </Specimen>
    </DocSection>

    <DocSection title="状态" desc="单行高度对齐 sm 档（32px），悬停与键盘高亮使用半透明叠层 --fill-default，危险项使用 --danger-text 与 --danger-subtle。">
      <Specimen themes="both">
        <StateGrid :columns="['内联常规 / 禁用 / 危险', '弹出模式 (popup)']" label-width="76px">
          <StateRow label="命令列表">
            <Menu
              :model="[
                { label: '常规命令项', icon: Check, shortcut: '⌘K' },
                { label: '禁用命令项 (disabled)', icon: Ban, disabled: true },
                { separator: true },
                { label: '危险动作项 (danger)', icon: Trash2, danger: true },
              ]"
              aria-label="状态演示菜单"
            />
            <Button
              size="sm"
              severity="secondary"
              label="唤醒 Popup 菜单"
              @click="statePopupRef?.toggle($event)"
            />
          </StateRow>
        </StateGrid>
      </Specimen>

      <Menu ref="statePopupRef" :model="groupedItems" popup aria-label="状态弹出菜单" />
    </DocSection>

    <DocSection title="接口">
      <table class="doc-table">
        <thead>
          <tr><th>属性 / 插槽 / 方法</th><th>取值</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><code>model</code></td><td><code>MenuItem[]</code></td><td>菜单项数组：支持 <code>label</code>、<code>icon</code>、<code>shortcut</code>、<code>danger</code>、<code>disabled</code>、<code>separator</code>、<code>items</code>、<code>command</code>、<code>url</code></td></tr>
          <tr><td><code>popup</code> / <code>appendTo</code></td><td><code>boolean / string</code></td><td>是否为弹出式霜面浮层（默认 <code>false</code>）；挂载目标默认 <code>"body"</code></td></tr>
          <tr><td><code>#start</code> / <code>#end</code></td><td>插槽</td><td>菜单列表上方与下方的固定扩展区域</td></tr>
          <tr><td><code>#item</code> / <code>#submenulabel</code></td><td><code>{ item, label, props }</code></td><td>自定义单项渲染或分组标题渲染</td></tr>
          <tr><td><code>toggle(event, target)</code> / <code>show</code> / <code>hide</code></td><td>暴露方法</td><td>在 <code>popup</code> 模式下控制菜单锚定弹出与收起</td></tr>
        </tbody>
      </table>
    </DocSection>
  </DocPage>
</template>

<style scoped>
.menu-slot-head {
  display: grid;
  gap: var(--space-0-5);
  padding: var(--space-2) var(--space-2) var(--space-2-5);
  margin-bottom: var(--space-1);
  border-bottom: var(--border-width) solid var(--border-subtle);
}

.menu-slot-head__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  font-size: var(--type-body-sm-size);
}

.menu-slot-foot {
  padding: var(--space-2) var(--space-2) var(--space-1);
  margin-top: var(--space-1);
  border-top: var(--border-width) solid var(--border-subtle);
}
</style>
