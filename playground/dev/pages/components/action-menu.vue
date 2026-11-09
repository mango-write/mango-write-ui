<script setup lang="ts">
import { BookOpen, ChevronRight, Copy, Folder, MoreHorizontal, RotateCw, Trash2 } from "lucide-vue-next";
import { computed, ref } from "vue";
import { ActionMenu, Badge, Button, useNotify, type ActionMenuItem } from "@mango-write/ui-vue";
import { api } from "../../api/entries/action-menu";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/action-menu";

const notify = useNotify();
const actionMenuRef = ref<InstanceType<typeof ActionMenu> | null>(null);
const controlledOpen = ref(false);
const lastCommand = ref("");

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "列表行、文献条目或画布对象的「更多操作（<code>⋯</code>）」按钮及右键上下文菜单。",
    en: "The “more actions (<code>⋯</code>)” button and right-click context menu for list rows, library entries, or canvas objects.",
  },
  rule2: {
    zh: "包含二级子菜单（<code>children</code>）或需要为禁用项提供 <code>tooltip</code> 原因说明的动作集合。",
    en: "Action sets with second-level submenus (<code>children</code>) or a <code>tooltip</code> reason for disabled items.",
  },
  rule3: {
    zh: "需要常驻内联渲染或带自定义 <code>#start</code> / <code>#end</code> 面板头尾时用 <code>Menu</code>。",
    en: "Use <code>Menu</code> for persistent inline rendering or custom <code>#start</code> / <code>#end</code> panel headers and footers.",
  },
  rule4: {
    zh: "破坏性动作（如删除、移除）统一放在末尾分隔线之后，并设置 <code>danger: true</code>。",
    en: "Destructive actions (delete, remove) always go after the trailing separator with <code>danger: true</code>.",
  },
  interaction: { zh: "底面与交互演示", en: "Surfaces & interaction" },
  interactionDesc: {
    zh: "点击「⋯」按钮锚定展开，或在条目卡片上点击鼠标右键按指针坐标弹出。下方同时给出静态霜面解剖预演。",
    en: "Click the “⋯” button to open anchored, or right-click the card to open at the pointer. A static frost anatomy preview is shown below.",
  },
  rightClickHint: {
    zh: "在此卡片上点击鼠标右键，或点击右侧按钮唤起对象菜单",
    en: "Right-click this card or use the button on the right to open the action menu",
  },
  moreActions: { zh: "更多操作", en: "More actions" },
  openSplit: { zh: "在分屏中打开原文", en: "Open source in split view" },
  openedSplit: { zh: "已在右侧分屏打开 PDF 原文", en: "PDF source opened in the right pane" },
  copyCite: { zh: "复制引用格式", en: "Copy citation" },
  bibtexEntry: { zh: "BibTeX 条目", en: "BibTeX entry" },
  copiedGbt: { zh: "已复制 GB/T 7714 引用", en: "GB/T 7714 citation copied" },
  copiedApa: { zh: "已复制 APA 7th 引用", en: "APA 7th citation copied" },
  copiedBibtex: { zh: "已复制 BibTeX 条目", en: "BibTeX entry copied" },
  cmdCopyGbt: { zh: "复制 GB/T 7714", en: "Copy GB/T 7714" },
  cmdCopyApa: { zh: "复制 APA 7th", en: "Copy APA 7th" },
  cmdCopyBibtex: { zh: "复制 BibTeX", en: "Copy BibTeX" },
  moveToFolder: { zh: "移至收藏夹", en: "Move to collection" },
  folderCore: { zh: "核心精读文献", en: "Core reading list" },
  folderMethod: { zh: "数值实验方法", en: "Numerical experiment methods" },
  cmdMoveCore: { zh: "移至：核心精读文献", en: "Move to: Core reading list" },
  cmdMoveMethod: { zh: "移至：数值实验方法", en: "Move to: Numerical experiment methods" },
  folderLocked: { zh: "已归档课题 (只读)", en: "Archived project (read-only)" },
  lockedTooltip: {
    zh: "归档课题已锁定，无法移入新文献",
    en: "Archived projects are locked; new sources cannot be added",
  },
  reparse: { zh: "重新运行 OCR 解析", en: "Re-run OCR parsing" },
  reparseTooltip: {
    zh: "当前文献已存在高精度结构化解析产物",
    en: "A high-accuracy parsed result already exists for this source",
  },
  moveToTrash: { zh: "移入回收站", en: "Move to trash" },
  movedToTrash: { zh: "文献已移入回收站", en: "Source moved to trash" },
  keyboard: { zh: "键盘穿梭与禁用提示", en: "Keyboard navigation & disabled hints" },
  keyboardDesc: {
    zh: "展开后支持 ↑↓ 移动、→ 进入二级子菜单、← 返回父菜单、Enter 执行、Esc 关闭并将焦点归还触发器；禁用项保留 pointer-events 以展示 v-tooltip 原因。",
    en: "Once open: ↑↓ to move, → into a submenu, ← back to the parent, Enter to run, Esc to close and return focus to the trigger; disabled items keep pointer-events to show the v-tooltip reason.",
  },
  openNested: { zh: "打开多级动作菜单", en: "Open nested action menu" },
  lastCommandLabel: { zh: "最近执行：", en: "Last command: " },
  idleCommand: { zh: "等待触发动作", en: "Awaiting a command" },
  triggers: { zh: "状态与触发方式", en: "States & triggers" },
  triggersDesc: {
    zh: "同一个 ActionMenu 实例既能锚定按钮左下角，也能在 contextmenu 事件中按指针坐标弹出并自动夹紧视口。",
    en: "One ActionMenu instance can anchor to a button's bottom-left or open at the pointer from a contextmenu event, clamped to the viewport.",
  },
  colAnchored: { zh: "按钮锚定 toggle(e)", en: "Anchored toggle(e)" },
  colPointer: { zh: "右键坐标 show(e)", en: "Pointer show(e)" },
  colControlled: { zh: "受控 v-model:open", en: "Controlled v-model:open" },
  triggerRow: { zh: "触发", en: "Trigger" },
  anchoredBtn: { zh: "按钮锚定", en: "Anchored" },
  pointerBtn: { zh: "右键或点击此处按坐标弹出", en: "Right-click or click to open at pointer" },
  controlledBtn: { zh: "受控打开", en: "Controlled open" },
  api: { zh: "接口", en: "API" },
} as const;

lastCommand.value = t(s.idleCommand);

const items = computed<ActionMenuItem[]>(() => [
  {
    key: "open",
    label: t(s.openSplit),
    icon: BookOpen,
    shortcut: "↵",
    command: () => {
      lastCommand.value = t(s.openSplit);
      notify.info(t(s.openedSplit));
    },
  },
  {
    key: "cite",
    label: t(s.copyCite),
    icon: Copy,
    children: [
      {
        key: "cite-gbt",
        label: "GB/T 7714-2015",
        shortcut: "⌘1",
        command: () => {
          lastCommand.value = t(s.cmdCopyGbt);
          notify.success(t(s.copiedGbt));
        },
      },
      {
        key: "cite-apa",
        label: "APA 7th Edition",
        shortcut: "⌘2",
        command: () => {
          lastCommand.value = t(s.cmdCopyApa);
          notify.success(t(s.copiedApa));
        },
      },
      {
        key: "cite-bib",
        label: t(s.bibtexEntry),
        shortcut: "⌘B",
        command: () => {
          lastCommand.value = t(s.cmdCopyBibtex);
          notify.success(t(s.copiedBibtex));
        },
      },
    ],
  },
  {
    key: "move",
    label: t(s.moveToFolder),
    icon: Folder,
    children: [
      {
        key: "folder-core",
        label: t(s.folderCore),
        command: () => {
          lastCommand.value = t(s.cmdMoveCore);
        },
      },
      {
        key: "folder-method",
        label: t(s.folderMethod),
        command: () => {
          lastCommand.value = t(s.cmdMoveMethod);
        },
      },
      { separator: true },
      {
        key: "folder-locked",
        label: t(s.folderLocked),
        disabled: true,
        tooltip: t(s.lockedTooltip),
      },
    ],
  },
  {
    key: "reparse",
    label: t(s.reparse),
    icon: RotateCw,
    disabled: true,
    tooltip: t(s.reparseTooltip),
  },
  { separator: true },
  {
    key: "delete",
    label: t(s.moveToTrash),
    icon: Trash2,
    shortcut: "⌫",
    danger: true,
    command: () => {
      lastCommand.value = t(s.moveToTrash);
      notify.warn(t(s.movedToTrash));
    },
  },
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

    <DocSection :title="s.interaction" :desc="s.interactionDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <div
          class="context-target"
          tabindex="0"
          @contextmenu.prevent="actionMenuRef?.show($event)"
        >
          <div class="context-target__info">
            <strong>Vaswani et al. · Attention Is All You Need (2017)</strong>
            <span class="doc-note">{{ t(s.rightClickHint) }}</span>
          </div>
          <Button
            size="sm"
            variant="text"
            severity="secondary"
            :icon="MoreHorizontal"
            :aria-label="t(s.moreActions)"
            @click.stop="actionMenuRef?.toggle($event)"
          />
        </div>

        <div class="action-static mw-frost">
          <div class="action-static__item action-static__item--active">
            <BookOpen :size="14" aria-hidden="true" />
            <span>{{ t(s.openSplit) }}</span>
            <kbd>↵</kbd>
          </div>
          <div class="action-static__item">
            <Copy :size="14" aria-hidden="true" />
            <span>{{ t(s.copyCite) }}</span>
            <ChevronRight :size="12" class="action-static__caret" />
          </div>
          <div class="action-static__sep" />
          <div class="action-static__item action-static__item--danger">
            <Trash2 :size="14" aria-hidden="true" />
            <span>{{ t(s.moveToTrash) }}</span>
            <kbd>⌫</kbd>
          </div>
        </div>
      </Specimen>

      <ActionMenu ref="actionMenuRef" :items="items" />
    </DocSection>

    <DocSection :title="s.keyboard" :desc="s.keyboardDesc">
      <Specimen themes="single">
        <Button
          size="sm"
          :label="t(s.openNested)"
          @click="actionMenuRef?.toggle($event)"
        />
        <Badge severity="secondary">{{ t(s.lastCommandLabel) }}{{ lastCommand }}</Badge>
      </Specimen>
    </DocSection>

    <DocSection :title="s.triggers" :desc="s.triggersDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colAnchored, s.colPointer, s.colControlled]" label-width="76px">
          <StateRow :label="s.triggerRow">
            <Button size="sm" severity="secondary" :label="t(s.anchoredBtn)" @click="actionMenuRef?.toggle($event)" />
            <Button
              size="sm"
              variant="tinted"
              :label="t(s.pointerBtn)"
              @click="actionMenuRef?.show($event, null)"
              @contextmenu.prevent="actionMenuRef?.show($event)"
            />
            <Button size="sm" severity="secondary" :label="t(s.controlledBtn)" @click="controlledOpen = true" />
          </StateRow>
        </StateGrid>
      </Specimen>

      <ActionMenu v-model:open="controlledOpen" :items="items" />
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>

<style scoped>
.context-target {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-card);
  border: var(--border-width) dashed var(--border-strong);
  background: var(--fill-subtle);
  cursor: context-menu;
}

.context-target__info {
  display: grid;
  gap: var(--space-0-5);
  font-size: var(--type-body-sm-size);
}

.action-static {
  width: 240px;
  padding: var(--float-padding);
  border-radius: var(--radius-float);
  font-size: var(--type-body-sm-size);
}

.action-static__item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--size-sm-h);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-item);
  color: var(--text-primary);
}

.action-static__item--active {
  background: var(--fill-default);
}

.action-static__item--danger {
  color: var(--danger-text);
}

.action-static__item kbd {
  margin-left: auto;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: var(--type-caption-size);
}

.action-static__caret {
  margin-left: auto;
  color: var(--text-tertiary);
}

.action-static__sep {
  height: var(--border-width);
  margin: var(--space-1) 0;
  background: var(--border-subtle);
}
</style>
