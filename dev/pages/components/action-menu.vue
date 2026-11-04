<script setup lang="ts">
import { BookOpen, ChevronRight, Copy, Folder, MoreHorizontal, RotateCw, Trash2 } from "lucide-vue-next";
import { ref } from "vue";
import { ActionMenu, Badge, Button, useNotify, type ActionMenuItem } from "../../../src";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const notify = useNotify();
const actionMenuRef = ref<InstanceType<typeof ActionMenu> | null>(null);
const controlledOpen = ref(false);
const lastCommand = ref("等待触发动作");

const items: ActionMenuItem[] = [
  {
    key: "open",
    label: "在分屏中打开原文",
    icon: BookOpen,
    shortcut: "↵",
    command: () => {
      lastCommand.value = "在分屏中打开原文";
      notify.info("已在右侧分屏打开 PDF 原文");
    },
  },
  {
    key: "cite",
    label: "复制引用格式",
    icon: Copy,
    children: [
      {
        key: "cite-gbt",
        label: "GB/T 7714-2015",
        shortcut: "⌘1",
        command: () => {
          lastCommand.value = "复制 GB/T 7714";
          notify.success("已复制 GB/T 7714 引用");
        },
      },
      {
        key: "cite-apa",
        label: "APA 7th Edition",
        shortcut: "⌘2",
        command: () => {
          lastCommand.value = "复制 APA 7th";
          notify.success("已复制 APA 7th 引用");
        },
      },
      {
        key: "cite-bib",
        label: "BibTeX 条目",
        shortcut: "⌘B",
        command: () => {
          lastCommand.value = "复制 BibTeX";
          notify.success("已复制 BibTeX 条目");
        },
      },
    ],
  },
  {
    key: "move",
    label: "移至收藏夹",
    icon: Folder,
    children: [
      {
        key: "folder-core",
        label: "核心精读文献",
        command: () => {
          lastCommand.value = "移至：核心精读文献";
        },
      },
      {
        key: "folder-method",
        label: "数值实验方法",
        command: () => {
          lastCommand.value = "移至：数值实验方法";
        },
      },
      { separator: true },
      {
        key: "folder-locked",
        label: "已归档课题 (只读)",
        disabled: true,
        tooltip: "归档课题已锁定，无法移入新文献",
      },
    ],
  },
  {
    key: "reparse",
    label: "重新运行 OCR 解析",
    icon: RotateCw,
    disabled: true,
    tooltip: "当前文献已存在高精度结构化解析产物",
  },
  { separator: true },
  {
    key: "delete",
    label: "移入回收站",
    icon: Trash2,
    shortcut: "⌫",
    danger: true,
    command: () => {
      lastCommand.value = "移入回收站";
      notify.warn("文献已移入回收站");
    },
  },
];
</script>

<template>
  <DocPage
    lead="对象动作菜单：面向文献卡片、列表行或编辑器块的上下文菜单（.mw-frost）。原生支持二级子菜单展开、右键坐标定位（contextmenu）、禁用原因 Tooltip 与全键盘方向键穿梭。"
  >
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">列表行、文献条目或画布对象的「更多操作（<code>⋯</code>）」按钮及右键上下文菜单。</li>
        <li data-kind="do">包含二级子菜单（<code>children</code>）或需要为禁用项提供 <code>tooltip</code> 原因说明的动作集合。</li>
        <li data-kind="dont">需要常驻内联渲染或带自定义 <code>#start</code> / <code>#end</code> 面板头尾时用 <code>Menu</code>。</li>
        <li data-kind="dont">破坏性动作（如删除、移除）统一放在末尾分隔线之后，并设置 <code>danger: true</code>。</li>
      </ul>
    </DocSection>

    <DocSection
      title="底面与交互演示"
      desc="点击「⋯」按钮锚定展开，或在条目卡片上点击鼠标右键按指针坐标弹出。下方同时给出静态霜面解剖预演。"
    >
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <div
          class="context-target"
          tabindex="0"
          @contextmenu.prevent="actionMenuRef?.show($event)"
        >
          <div class="context-target__info">
            <strong>Vaswani et al. · Attention Is All You Need (2017)</strong>
            <span class="doc-note">在此卡片上点击鼠标右键，或点击右侧按钮唤起对象菜单</span>
          </div>
          <Button
            size="sm"
            variant="text"
            severity="secondary"
            :icon="MoreHorizontal"
            aria-label="更多操作"
            @click.stop="actionMenuRef?.toggle($event)"
          />
        </div>

        <div class="action-static mw-frost">
          <div class="action-static__item action-static__item--active">
            <BookOpen :size="14" aria-hidden="true" />
            <span>在分屏中打开原文</span>
            <kbd>↵</kbd>
          </div>
          <div class="action-static__item">
            <Copy :size="14" aria-hidden="true" />
            <span>复制引用格式</span>
            <ChevronRight :size="12" class="action-static__caret" />
          </div>
          <div class="action-static__sep" />
          <div class="action-static__item action-static__item--danger">
            <Trash2 :size="14" aria-hidden="true" />
            <span>移入回收站</span>
            <kbd>⌫</kbd>
          </div>
        </div>
      </Specimen>

      <ActionMenu ref="actionMenuRef" :items="items" />
    </DocSection>

    <DocSection
      title="键盘穿梭与禁用提示"
      desc="展开后支持 ↑↓ 移动、→ 进入二级子菜单、← 返回父菜单、Enter 执行、Esc 关闭并将焦点归还触发器；禁用项保留 pointer-events 以展示 v-tooltip 原因。"
    >
      <Specimen themes="single">
        <Button
          size="sm"
          label="打开多级动作菜单"
          @click="actionMenuRef?.toggle($event)"
        />
        <Badge severity="secondary">最近执行：{{ lastCommand }}</Badge>
      </Specimen>
    </DocSection>

    <DocSection title="状态与触发方式" desc="同一个 ActionMenu 实例既能锚定按钮左下角，也能在 contextmenu 事件中按指针坐标弹出并自动夹紧视口。">
      <Specimen themes="both">
        <StateGrid :columns="['按钮锚定 toggle(e)', '右键坐标 show(e)', '受控 v-model:open']" label-width="76px">
          <StateRow label="触发">
            <Button size="sm" severity="secondary" label="按钮锚定" @click="actionMenuRef?.toggle($event)" />
            <Button
              size="sm"
              variant="tinted"
              label="右键或点击此处按坐标弹出"
              @click="actionMenuRef?.show($event, null)"
              @contextmenu.prevent="actionMenuRef?.show($event)"
            />
            <Button size="sm" severity="secondary" label="受控打开" @click="controlledOpen = true" />
          </StateRow>
        </StateGrid>
      </Specimen>

      <ActionMenu v-model:open="controlledOpen" :items="items" />
    </DocSection>

    <DocSection title="接口">
      <table class="doc-table">
        <thead>
          <tr><th>属性 / 字段 / 方法</th><th>取值</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><code>items</code></td><td><code>ActionMenuItem[]</code></td><td>菜单项数组；支持动态 <code>visible</code> 与 <code>disabled</code> 布尔值或函数</td></tr>
          <tr><td><code>v-model:open</code></td><td><code>boolean</code></td><td>可选受控打开状态</td></tr>
          <tr><td><code>children</code> / <code>items</code></td><td><code>ActionMenuItem[]</code></td><td>二级子菜单项列表；悬停或按 <code>ArrowRight</code> 展开</td></tr>
          <tr><td><code>shortcut</code> / <code>tooltip</code> / <code>danger</code></td><td><code>string / boolean</code></td><td>右侧等宽快捷键提示、悬停气泡说明（禁用项同样生效）、危险红语义</td></tr>
          <tr><td><code>#icon</code></td><td><code>{ item }</code></td><td>自定义菜单项前置图标插槽</td></tr>
          <tr><td><code>toggle(event, target)</code> / <code>show(event, target)</code> / <code>hide()</code></td><td>暴露方法</td><td><code>contextmenu</code> 事件自动取鼠标坐标，常规点击优先取锚点元素</td></tr>
        </tbody>
      </table>
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
