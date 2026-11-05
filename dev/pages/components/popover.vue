<script setup lang="ts">
import { computed, ref } from "vue";
import { Share2, SlidersHorizontal, Tag as TagIcon } from "lucide-vue-next";
import { Button, InputText, Popover, SelectButton, ToggleSwitch } from "../../../src";
import { api } from "../../api/entries/popover";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t, type Bi } from "../../i18n";
import { usage } from "../../usage/entries/popover";

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  do1: {
    zh: "点击按钮后就地展开 1–3 个关联控件（如阅读器排版微调、分享权限开关、新建标签输入）。",
    en: "Open 1–3 related controls in place next to the clicked button (e.g. reader typography tweaks, share-permission switches, new-tag input).",
  },
  do2: {
    zh: "多行或多按钮共用同一个弹出层时，不传 <code>#trigger</code>，改用 <code>popoverRef.toggle(event)</code> 动态锚定目标元素。",
    en: "When multiple rows or buttons share one popover, skip <code>#trigger</code> and anchor the target dynamically via <code>popoverRef.toggle(event)</code>.",
  },
  dont1: {
    zh: "纯命令列表用 <code>Menu</code> 或 <code>ActionMenu</code>；悬停即显的只读预览用 <code>HoverCard</code>。",
    en: "Use <code>Menu</code> or <code>ActionMenu</code> for pure command lists, and <code>HoverCard</code> for read-only previews that appear on hover.",
  },
  dont2: {
    zh: "复杂多字段表单用 <code>Dialog</code>，不要往小尺寸锚定浮层里塞长滚动条。",
    en: "Use a <code>Dialog</code> for complex multi-field forms; don't stuff long scrollbars into a small anchored layer.",
  },
  surfaceTitle: { zh: "底面与内嵌控件", en: "Surface and embedded controls" },
  surfaceDesc: {
    zh: "Popover 面板自带 .mw-frost，内部放置 InputText、SelectButton 或 ToggleSwitch 时保持半透明叠层，不割裂毛玻璃。",
    en: "The popover panel ships with .mw-frost; InputText, SelectButton, or ToggleSwitch inside keep translucent fills that don't break the frosted glass.",
  },
  readerAria: { zh: "阅读排版设置", en: "Reader typography settings" },
  typographyBtn: { zh: "排版设置", en: "Typography" },
  lineSpacing: { zh: "正文行距", en: "Body line height" },
  syncScroll: { zh: "双栏同步滚动", en: "Sync two-pane scroll" },
  shareAria: { zh: "分享草稿链接", en: "Share draft link" },
  shareBtn: { zh: "分享草稿", en: "Share draft" },
  teamLinkTitle: { zh: "团队只读链接", en: "Team read-only link" },
  close: { zh: "关闭", en: "Close" },
  copyLink: { zh: "复制链接", en: "Copy link" },
  staticTitle: { zh: "静态预览 · 快捷打标", en: "Static preview · quick tagging" },
  tagPlaceholder: { zh: "输入标签名", en: "Tag name" },
  addTag: { zh: "添加", en: "Add" },
  tagValue: { zh: "大洋环流", en: "Ocean gyre" },
  dirTitle: { zh: "弹出方向与对齐", en: "Side and alignment" },
  dirDesc: {
    zh: "支持 side (top / right / bottom / left) 与 align (start / center / end)，视口边缘空间不足时自动翻转（avoidCollisions）。",
    en: "Supports side (top / right / bottom / left) and align (start / center / end); flips automatically when viewport edge space runs out (avoidCollisions).",
  },
  sideLabel: { zh: "方向", en: "Side" },
  alignLabel: { zh: "对齐", en: "Align" },
  modeTitle: { zh: "状态与触发模式", en: "States and trigger modes" },
  modeDesc: {
    zh: "除 #trigger 插槽外，支持 v-model:open 受控模式与 ref.toggle(event) 命令式动态锚定。",
    en: "Besides the #trigger slot, supports v-model:open controlled mode and imperative dynamic anchoring via ref.toggle(event).",
  },
  colSlot: { zh: "插槽触发", en: "Slot trigger" },
  colControlled: { zh: "受控 v-model:open", en: "Controlled v-model:open" },
  colAnchor1: { zh: "命令式锚定 #1", en: "Imperative anchor #1" },
  colAnchor2: { zh: "命令式锚定 #2", en: "Imperative anchor #2" },
  colPinned: { zh: "常驻禁外点", en: "Pinned, no outside close" },
  rowInteraction: { zh: "交互", en: "Interaction" },
  slotBtn: { zh: "插槽触发", en: "Slot trigger" },
  slotBody: {
    zh: "点击外部或按 Esc 自动收起并将焦点归还触发钮。",
    en: "Clicking outside or pressing Esc collapses it and returns focus to the trigger.",
  },
  controlledBtn: { zh: "受控开关", en: "Controlled toggle" },
  opened: { zh: "已展开", en: "Open" },
  controlledPrefix: { zh: "受控状态：", en: "Controlled state: " },
  collapse: { zh: "收起", en: "Collapse" },
  refBtn1: { zh: "文献 #1 批注", en: "Reference #1 notes" },
  refBtn2: { zh: "文献 #2 批注", en: "Reference #2 notes" },
  ref1: { zh: "文献 #1", en: "Reference #1" },
  ref2: { zh: "文献 #2", en: "Reference #2" },
  noOutsideBtn: { zh: "禁外部关闭", en: "No outside close" },
  noOutsideBody: {
    zh: "已设置 <code>:dismissable=\"false\"</code>，点击外部不关闭。",
    en: "With <code>:dismissable=\"false\"</code>, clicking outside won't close it.",
  },
  explicitClose: { zh: "显式关闭", en: "Close explicitly" },
  sharedAria: { zh: "共享批注浮层", en: "Shared notes layer" },
  currentAnchor: { zh: "当前锚定：", en: "Current anchor: " },
  sharedNote: {
    zh: "通过单个 Popover 实例的 <code>toggle(event)</code> 在不同按钮间平滑切换锚点。",
    en: "A single Popover instance switches anchors smoothly across buttons via <code>toggle(event)</code>.",
  },
  api: { zh: "接口", en: "API" },
} as const;

const lineSpacing = ref("1.6");
/* SelectButton 直读字符串 label,选项按当前语言重建 */
const spacingOptions = computed(() => [
  { label: t({ zh: "紧凑 1.4", en: "Compact 1.4" }), value: "1.4" },
  { label: t({ zh: "标准 1.6", en: "Standard 1.6" }), value: "1.6" },
  { label: t({ zh: "舒展 1.8", en: "Relaxed 1.8" }), value: "1.8" },
]);
const syncScroll = ref(true);
const shareUrl = ref("https://mangowrite.com/d/climate-review-2026");

/* InputText 直读字符串,v-model 默认值按当前语言取词;用户输入优先 */
const tagDraftEdits = ref<string | null>(null);
const tagDraft = computed({
  get: () => tagDraftEdits.value ?? t(s.tagValue),
  set: (value: string) => (tagDraftEdits.value = value),
});

const controlledOpen = ref(false);
const sharedPopoverRef = ref<InstanceType<typeof Popover> | null>(null);
const activeAnchorName = ref(t(s.ref1));

function openSharedAt(event: Event, name: Bi) {
  activeAnchorName.value = t(name);
  sharedPopoverRef.value?.toggle(event);
}

function sideNote(side: string): string {
  return t({
    zh: `优先向 <code>${side}</code> 展开，距离锚点 6px。`,
    en: `Opens toward <code>${side}</code> first, 6px from the anchor.`,
  });
}

function alignNote(align: string): string {
  return t({
    zh: `交叉轴对齐：<code>align="${align}"</code>`,
    en: `Cross-axis alignment: <code>align="${align}"</code>`,
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
        <li data-kind="dont" v-html="t(s.dont1)" />
        <li data-kind="dont" v-html="t(s.dont2)" />
      </ul>
    </DocSection>

    <DocSection :title="s.surfaceTitle" :desc="s.surfaceDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <div class="doc-row">
          <Popover :aria-label="t(s.readerAria)">
            <template #trigger>
              <Button size="sm" severity="secondary" :icon="SlidersHorizontal" :label="t(s.typographyBtn)" />
            </template>
            <div class="popover-form">
              <strong class="popover-form__title">{{ t(s.lineSpacing) }}</strong>
              <SelectButton
                v-model="lineSpacing"
                size="sm"
                :options="spacingOptions"
                option-label="label"
                option-value="value"
                :allow-empty="false"
                :aria-label="t(s.lineSpacing)"
              />
              <div class="popover-form__switch">
                <span>{{ t(s.syncScroll) }}</span>
                <ToggleSwitch v-model="syncScroll" :aria-label="t(s.syncScroll)" />
              </div>
            </div>
          </Popover>

          <Popover :aria-label="t(s.shareAria)">
            <template #trigger>
              <Button size="sm" variant="tinted" :icon="Share2" :label="t(s.shareBtn)" />
            </template>
            <template #default="{ close }">
              <div class="popover-form">
                <strong class="popover-form__title">{{ t(s.teamLinkTitle) }}</strong>
                <InputText v-model="shareUrl" size="sm" readonly fluid />
                <div class="doc-row" style="justify-content: flex-end">
                  <Button size="xs" variant="text" severity="secondary" :label="t(s.close)" @click="close" />
                  <Button size="xs" :label="t(s.copyLink)" @click="close" />
                </div>
              </div>
            </template>
          </Popover>
        </div>

        <div class="popover-static mw-frost">
          <div class="popover-form">
            <strong class="popover-form__title">{{ t(s.staticTitle) }}</strong>
            <div class="doc-row">
              <InputText v-model="tagDraft" size="sm" :placeholder="t(s.tagPlaceholder)" />
              <Button size="sm" :icon="TagIcon" :label="t(s.addTag)" />
            </div>
          </div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.dirTitle" :desc="s.dirDesc">
      <Specimen themes="single" layout="stack">
        <div class="doc-row">
          <span class="doc-note" style="width: 56px">{{ t(s.sideLabel) }}</span>
          <Popover v-for="side in (['top', 'right', 'bottom', 'left'] as const)" :key="side" :side="side" align="center">
            <template #trigger>
              <Button size="sm" severity="secondary" :label="`side=${side}`" />
            </template>
            <div class="doc-note" v-html="sideNote(side)" />
          </Popover>
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 56px">{{ t(s.alignLabel) }}</span>
          <Popover v-for="a in (['start', 'center', 'end'] as const)" :key="a" side="bottom" :align="a">
            <template #trigger>
              <Button size="sm" severity="secondary" :label="`align=${a}`" />
            </template>
            <div class="doc-note" v-html="alignNote(a)" />
          </Popover>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.modeTitle" :desc="s.modeDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colSlot, s.colControlled, s.colAnchor1, s.colAnchor2, s.colPinned]" label-width="76px">
          <StateRow :label="s.rowInteraction">
            <Popover>
              <template #trigger>
                <Button size="sm" :label="t(s.slotBtn)" />
              </template>
              <span>{{ t(s.slotBody) }}</span>
            </Popover>

            <Popover v-model:open="controlledOpen">
              <template #trigger>
                <Button size="sm" severity="secondary" :label="controlledOpen ? t(s.opened) : t(s.controlledBtn)" />
              </template>
              <div class="doc-row">
                <span>{{ t(s.controlledPrefix) }}<code>open={{ controlledOpen }}</code></span>
                <Button size="xs" :label="t(s.collapse)" @click="controlledOpen = false" />
              </div>
            </Popover>

            <Button size="sm" severity="secondary" :label="t(s.refBtn1)" @click="openSharedAt($event, s.ref1)" />
            <Button size="sm" severity="secondary" :label="t(s.refBtn2)" @click="openSharedAt($event, s.ref2)" />

            <Popover :dismissable="false">
              <template #trigger>
                <Button size="sm" variant="tinted" :label="t(s.noOutsideBtn)" />
              </template>
              <template #default="{ close }">
                <div class="doc-stack">
                  <span v-html="t(s.noOutsideBody)" />
                  <Button size="xs" :label="t(s.explicitClose)" @click="close" />
                </div>
              </template>
            </Popover>
          </StateRow>
        </StateGrid>
      </Specimen>

      <Popover ref="sharedPopoverRef" :aria-label="t(s.sharedAria)">
        <template #default="{ close }">
          <div class="popover-form">
            <strong class="popover-form__title">{{ t(s.currentAnchor) }}{{ activeAnchorName }}</strong>
            <span class="doc-note" v-html="t(s.sharedNote)" />
            <Button size="xs" severity="secondary" :label="t(s.close)" @click="close" />
          </div>
        </template>
      </Popover>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>

<style scoped>
.popover-form {
  display: grid;
  gap: var(--space-2-5);
  min-width: 210px;
}

.popover-form__title {
  color: var(--text-primary);
  font-size: var(--type-body-sm-size);
  font-weight: var(--weight-semibold);
}

.popover-form__switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  color: var(--text-secondary);
  font-size: var(--type-body-sm-size);
}

.popover-static {
  max-width: 280px;
  padding: var(--space-3);
  border-radius: var(--radius-float);
}
</style>
