<script setup lang="ts">
import { Share2, SlidersHorizontal, Tag as TagIcon } from "lucide-vue-next";
import { ref } from "vue";
import { Button, InputText, Popover, SelectButton, ToggleSwitch } from "../../../src";
import { api } from "../../api/entries/popover";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const lineSpacing = ref("1.6");
const spacingOptions = [
  { label: "紧凑 1.4", value: "1.4" },
  { label: "标准 1.6", value: "1.6" },
  { label: "舒展 1.8", value: "1.8" },
];
const syncScroll = ref(true);
const shareUrl = ref("https://mangowrite.com/d/climate-review-2026");
const tagDraft = ref("大洋环流");

const controlledOpen = ref(false);
const sharedPopoverRef = ref<InstanceType<typeof Popover> | null>(null);
const activeAnchorName = ref("文献 #1");

function openSharedAt(event: Event, name: string) {
  activeAnchorName.value = name;
  sharedPopoverRef.value?.toggle(event);
}
</script>

<template>
  <DocPage
    lead="锚定弹出层：点击触发器后在锚点旁展开霜面浮层（.mw-frost），承载轻量表单、排版微调或分享设置。支持 #trigger 插槽声明式触发与 ref.toggle(event) 命令式共享实例。"
  >
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">点击按钮后就地展开 1–3 个关联控件（如阅读器排版微调、分享权限开关、新建标签输入）。</li>
        <li data-kind="do">多行或多按钮共用同一个弹出层时，不传 <code>#trigger</code>，改用 <code>popoverRef.toggle(event)</code> 动态锚定目标元素。</li>
        <li data-kind="dont">纯命令列表用 <code>Menu</code> 或 <code>ActionMenu</code>；悬停即显的只读预览用 <code>HoverCard</code>。</li>
        <li data-kind="dont">复杂多字段表单用 <code>Dialog</code>，不要往小尺寸锚定浮层里塞长滚动条。</li>
      </ul>
    </DocSection>

    <DocSection
      title="底面与内嵌控件"
      desc="Popover 面板自带 .mw-frost，内部放置 InputText、SelectButton 或 ToggleSwitch 时保持半透明叠层，不割裂毛玻璃。"
    >
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <div class="doc-row">
          <Popover aria-label="阅读排版设置">
            <template #trigger>
              <Button size="sm" severity="secondary" :icon="SlidersHorizontal" label="排版设置" />
            </template>
            <div class="popover-form">
              <strong class="popover-form__title">正文行距</strong>
              <SelectButton
                v-model="lineSpacing"
                size="sm"
                :options="spacingOptions"
                option-label="label"
                option-value="value"
                :allow-empty="false"
                aria-label="正文行距"
              />
              <div class="popover-form__switch">
                <span>双栏同步滚动</span>
                <ToggleSwitch v-model="syncScroll" aria-label="双栏同步滚动" />
              </div>
            </div>
          </Popover>

          <Popover aria-label="分享草稿链接">
            <template #trigger>
              <Button size="sm" variant="tinted" :icon="Share2" label="分享草稿" />
            </template>
            <template #default="{ close }">
              <div class="popover-form">
                <strong class="popover-form__title">团队只读链接</strong>
                <InputText v-model="shareUrl" size="sm" readonly fluid />
                <div class="doc-row" style="justify-content: flex-end">
                  <Button size="xs" variant="text" severity="secondary" label="关闭" @click="close" />
                  <Button size="xs" label="复制链接" @click="close" />
                </div>
              </div>
            </template>
          </Popover>
        </div>

        <div class="popover-static mw-frost">
          <div class="popover-form">
            <strong class="popover-form__title">静态预览 · 快捷打标</strong>
            <div class="doc-row">
              <InputText v-model="tagDraft" size="sm" placeholder="输入标签名" />
              <Button size="sm" :icon="TagIcon" label="添加" />
            </div>
          </div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection
      title="弹出方向与对齐"
      desc="支持 side (top / right / bottom / left) 与 align (start / center / end)，视口边缘空间不足时自动翻转（avoidCollisions）。"
    >
      <Specimen themes="single" layout="stack">
        <div class="doc-row">
          <span class="doc-note" style="width: 56px">方向</span>
          <Popover v-for="s in (['top', 'right', 'bottom', 'left'] as const)" :key="s" :side="s" align="center">
            <template #trigger>
              <Button size="sm" severity="secondary" :label="`side=${s}`" />
            </template>
            <div class="doc-note">优先向 <code>{{ s }}</code> 展开，距离锚点 6px。</div>
          </Popover>
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 56px">对齐</span>
          <Popover v-for="a in (['start', 'center', 'end'] as const)" :key="a" side="bottom" :align="a">
            <template #trigger>
              <Button size="sm" severity="secondary" :label="`align=${a}`" />
            </template>
            <div class="doc-note">交叉轴对齐：<code>align="{{ a }}"</code></div>
          </Popover>
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="状态与触发模式" desc="除 #trigger 插槽外，支持 v-model:open 受控模式与 ref.toggle(event) 命令式动态锚定。">
      <Specimen themes="both">
        <StateGrid :columns="['插槽触发', '受控 v-model:open', '命令式锚定 #1', '命令式锚定 #2', '常驻禁外点']" label-width="76px">
          <StateRow label="交互">
            <Popover>
              <template #trigger>
                <Button size="sm" label="插槽触发" />
              </template>
              <span>点击外部或按 Esc 自动收起并将焦点归还触发钮。</span>
            </Popover>

            <Popover v-model:open="controlledOpen">
              <template #trigger>
                <Button size="sm" severity="secondary" :label="controlledOpen ? '已展开' : '受控开关'" />
              </template>
              <div class="doc-row">
                <span>受控状态：<code>open={{ controlledOpen }}</code></span>
                <Button size="xs" label="收起" @click="controlledOpen = false" />
              </div>
            </Popover>

            <Button size="sm" severity="secondary" label="文献 #1 批注" @click="openSharedAt($event, '文献 #1')" />
            <Button size="sm" severity="secondary" label="文献 #2 批注" @click="openSharedAt($event, '文献 #2')" />

            <Popover :dismissable="false">
              <template #trigger>
                <Button size="sm" variant="tinted" label="禁外部关闭" />
              </template>
              <template #default="{ close }">
                <div class="doc-stack">
                  <span>已设置 <code>:dismissable="false"</code>，点击外部不关闭。</span>
                  <Button size="xs" label="显式关闭" @click="close" />
                </div>
              </template>
            </Popover>
          </StateRow>
        </StateGrid>
      </Specimen>

      <Popover ref="sharedPopoverRef" aria-label="共享批注浮层">
        <template #default="{ close }">
          <div class="popover-form">
            <strong class="popover-form__title">当前锚定：{{ activeAnchorName }}</strong>
            <span class="doc-note">通过单个 Popover 实例的 <code>toggle(event)</code> 在不同按钮间平滑切换锚点。</span>
            <Button size="xs" severity="secondary" label="关闭" @click="close" />
          </div>
        </template>
      </Popover>
    </DocSection>

    <DocSection title="接口">
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
