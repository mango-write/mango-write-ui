<script setup lang="ts">
import { computed, ref } from "vue";
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
import { api } from "../../api/entries/menu";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/menu";

const notify = useNotify();
const popupMenuRef = ref<InstanceType<typeof Menu> | null>(null);
const statePopupRef = ref<InstanceType<typeof Menu> | null>(null);

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "触发按钮下方的单层或带组标题（<code>items</code>）命令面板，如导出菜单、账户中心、文档操作。",
    en: "A command panel under a trigger button, single level or with group headings (<code>items</code>): export menus, account centers, document actions.",
  },
  rule2: {
    zh: "需要带头部身份区（<code>#start</code>）或底部元信息区（<code>#end</code>）的命令列表。",
    en: "Command lists that need a header identity area (<code>#start</code>) or a footer meta area (<code>#end</code>).",
  },
  rule3: {
    zh: "需要多级悬停子菜单（<code>▸</code>）或右键鼠标坐标定位时，用 <code>ActionMenu</code>。",
    en: "For multi-level hover submenus (<code>▸</code>) or right-click pointer positioning, use <code>ActionMenu</code>.",
  },
  rule4: {
    zh: "需要在表单中持有并回显选中值时用 <code>Select</code> 或 <code>Listbox</code>；菜单只触发命令。",
    en: "Use <code>Select</code> or <code>Listbox</code> to hold and echo a selected value in forms; menus only trigger commands.",
  },
  surfacesPopup: { zh: "底面与弹出模式", en: "Surfaces & popup mode" },
  surfacesPopupDesc: {
    zh: "内联菜单直接融入当前表面；popup 模式传送至 body 并自动启用 .mw-frost 毛玻璃。点击按钮体验弹出菜单，或直接在内联菜单上使用上下方向键导航。",
    en: "Inline menus blend into the current surface; popup mode teleports to body and enables .mw-frost frost blur. Click the button to open the popup, or navigate the inline menu with the up/down arrow keys.",
  },
  openFrostPopup: { zh: "点击弹出霜面菜单", en: "Click to open frost popup" },
  sourceMenu: { zh: "文献操作菜单", en: "Source actions menu" },
  sourceMenuPopup: { zh: "弹出文献操作菜单", en: "Popup source actions menu" },
  groupedMenu: { zh: "分组导出菜单", en: "Grouped export menu" },
  slottedMenu: { zh: "带头尾插槽菜单", en: "Menu with start/end slots" },
  openDetails: { zh: "打开文献详情", en: "Open source details" },
  openedDetails: { zh: "已打开文献详情", en: "Source details opened" },
  copyBibtex: { zh: "复制 BibTeX 引用", en: "Copy BibTeX citation" },
  copiedBibtex: { zh: "已复制 BibTeX 到剪贴板", en: "BibTeX copied to clipboard" },
  exportNotes: { zh: "导出批注笔记", en: "Export annotation notes" },
  exportStarted: { zh: "已开始导出 Markdown 笔记", en: "Markdown export started" },
  removeFromLibrary: { zh: "从文库移除", en: "Remove from library" },
  movedToTrash: { zh: "已移入文库回收站", en: "Moved to the library trash" },
  exportFormats: { zh: "导出格式", en: "Export formats" },
  wordDocx: { zh: "Word 文档 (.docx)", en: "Word document (.docx)" },
  latexZip: { zh: "LaTeX 源码包 (.zip)", en: "LaTeX source bundle (.zip)" },
  pdfPreprint: { zh: "PDF 预印本 (.pdf)", en: "PDF preprint (.pdf)" },
  versioning: { zh: "版本管理", en: "Versioning" },
  createSnapshot: { zh: "创建里程碑快照", en: "Create milestone snapshot" },
  clearDrafts: { zh: "清空历史草稿", en: "Clear draft history" },
  groups: { zh: "分组与头尾插槽", en: "Groups & start/end slots" },
  groupsDesc: {
    zh: "在 MenuItem 中传入 items 数组即可渲染小字号分组标题（submenulabel）；#start 与 #end 插槽可在列表首尾固定账户信息或状态说明。",
    en: "Pass an items array to MenuItem to render small-caps group headings (submenulabel); the #start and #end slots pin account info or status notes to the top and bottom of the list.",
  },
  userName: { zh: "林蔚 · 课题组空间", en: "Lin Wei · Research group" },
  kbdHint: { zh: "支持 ↑↓ / Home / End 键盘导航", en: "Keyboard: ↑↓ / Home / End" },
  states: { zh: "状态", en: "States" },
  statesDesc: {
    zh: "单行高度对齐 sm 档（32px），悬停与键盘高亮使用半透明叠层 --fill-default，危险项使用 --danger-text 与 --danger-subtle。",
    en: "Row height matches the sm tier (32px); hover and keyboard highlights use the translucent --fill-default overlay; danger items use --danger-text and --danger-subtle.",
  },
  colInline: { zh: "内联常规 / 禁用 / 危险", en: "Inline regular / disabled / danger" },
  colPopup: { zh: "弹出模式 (popup)", en: "Popup mode" },
  stateCommands: { zh: "命令列表", en: "Commands" },
  wakePopup: { zh: "唤醒 Popup 菜单", en: "Wake popup menu" },
  stateMenu: { zh: "状态演示菜单", en: "State demo menu" },
  stateMenuPopup: { zh: "状态弹出菜单", en: "State popup menu" },
  stateRegular: { zh: "常规命令项", en: "Regular command" },
  stateDisabled: { zh: "禁用命令项 (disabled)", en: "Disabled command (disabled)" },
  stateDanger: { zh: "危险动作项 (danger)", en: "Danger item (danger)" },
  api: { zh: "接口", en: "API" },
} as const;

const basicItems = computed<MenuItem[]>(() => [
  {
    label: t(s.openDetails),
    icon: BookOpen,
    shortcut: "↵",
    command: () => notify.info(t(s.openedDetails)),
  },
  {
    label: t(s.copyBibtex),
    icon: Copy,
    shortcut: "⌘C",
    command: () => notify.success(t(s.copiedBibtex)),
  },
  {
    label: t(s.exportNotes),
    icon: Download,
    command: () => notify.info(t(s.exportStarted)),
  },
  { separator: true },
  {
    label: t(s.removeFromLibrary),
    icon: Trash2,
    danger: true,
    command: () => notify.warn(t(s.movedToTrash)),
  },
]);

const groupedItems = computed<MenuItem[]>(() => [
  {
    label: t(s.exportFormats),
    items: [
      { label: t(s.wordDocx), icon: File, shortcut: "⌘E" },
      { label: t(s.latexZip), icon: Code },
      { label: t(s.pdfPreprint), icon: FileText, disabled: true },
    ],
  },
  { separator: true },
  {
    label: t(s.versioning),
    items: [
      { label: t(s.createSnapshot), icon: Bookmark, shortcut: "⌘S" },
      { label: t(s.clearDrafts), icon: Trash2, danger: true },
    ],
  },
]);

const stateItems = computed<MenuItem[]>(() => [
  { label: t(s.stateRegular), icon: Check, shortcut: "⌘K" },
  { label: t(s.stateDisabled), icon: Ban, disabled: true },
  { separator: true },
  { label: t(s.stateDanger), icon: Trash2, danger: true },
]);
</script>

<template>
  <DocPage>
    <DocSection :title="s.demo" :desc="s.demoDesc">
      <UsagePlayground :entry="usage" />
    </DocSection>
    <DocSection :title="s.whenToUse">
      <ul class="doc-rules">
        <li data-kind="do" v-html="t(s.rule1)" />
        <li data-kind="do" v-html="t(s.rule2)" />
        <li data-kind="dont" v-html="t(s.rule3)" />
        <li data-kind="dont" v-html="t(s.rule4)" />
      </ul>
    </DocSection>

    <DocSection :title="s.surfacesPopup" :desc="s.surfacesPopupDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <div class="doc-row">
          <Button
            size="sm"
            severity="secondary"
            :icon="MenuIcon"
            :label="t(s.openFrostPopup)"
            @click="popupMenuRef?.toggle($event)"
          />
        </div>
        <Menu :model="basicItems" :aria-label="t(s.sourceMenu)" />
      </Specimen>

      <Menu ref="popupMenuRef" :model="basicItems" popup :aria-label="t(s.sourceMenuPopup)" />
    </DocSection>

    <DocSection :title="s.groups" :desc="s.groupsDesc">
      <Specimen themes="single">
        <Menu :model="groupedItems" :aria-label="t(s.groupedMenu)" />

        <Menu :model="basicItems" :aria-label="t(s.slottedMenu)">
          <template #start>
            <div class="menu-slot-head">
              <div class="menu-slot-head__row">
                <strong>{{ t(s.userName) }}</strong>
                <Badge severity="primary">Pro</Badge>
              </div>
              <span class="doc-note">linwei@example.edu.cn</span>
            </div>
          </template>
          <template #end>
            <div class="menu-slot-foot">
              <span class="doc-note">{{ t(s.kbdHint) }}</span>
            </div>
          </template>
        </Menu>
      </Specimen>
    </DocSection>

    <DocSection :title="s.states" :desc="s.statesDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colInline, s.colPopup]" label-width="76px">
          <StateRow :label="s.stateCommands">
            <Menu :model="stateItems" :aria-label="t(s.stateMenu)" />
            <Button
              size="sm"
              severity="secondary"
              :label="t(s.wakePopup)"
              @click="statePopupRef?.toggle($event)"
            />
          </StateRow>
        </StateGrid>
      </Specimen>

      <Menu ref="statePopupRef" :model="groupedItems" popup :aria-label="t(s.stateMenuPopup)" />
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
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
