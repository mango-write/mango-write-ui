<script setup lang="ts">
import { ref } from "vue";
import { Copy, FileText, Link2, Pencil, Trash2 } from "lucide-vue-next";
import { Button, InputText } from "@mango-write/ui-vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import { t, type Bi } from "../../i18n";

const backdrops = ["light", "dark", "vivid"] as const;
const backdropName: Record<(typeof backdrops)[number], Bi> = {
  light: { zh: "浅色内容之上", en: "Over light content" },
  dark: { zh: "深色内容之上", en: "Over dark content" },
  vivid: { zh: "鲜艳图片之上", en: "Over vivid imagery" },
};
const q = ref("");

const s = {
  thickTitle: { zh: "霜与厚霜", en: "Frost & thick frost" },
  thickDesc: {
    zh: ".mw-frost 给浮动层（菜单、下拉、Popover、Toast）；.mw-frost--thick 给覆盖层（对话框、确认框）。组件加类，不抄配方。",
    en: ".mw-frost for floating layers (menus, dropdowns, popovers, toasts); .mw-frost--thick for overlay layers (dialogs, confirms). Add the class to components; never copy the recipe.",
  },
  open: { zh: "打开", en: "Open" },
  copyLink: { zh: "复制链接", en: "Copy link" },
  rename: { zh: "重命名…", en: "Rename…" },
  duplicate: { zh: "创建副本", en: "Duplicate" },
  delete: { zh: "删除", en: "Delete" },
  readTitle: { zh: "可读性", en: "Legibility" },
  readDesc: {
    zh: "同一块霜压在浅色、深色与鲜艳内容上。正文用 primary / secondary；tertiary 只给 ≥ 12px 的元信息与快捷键。",
    en: "The same frost sits over light, dark, and vivid content. Body text uses primary / secondary; tertiary is only for ≥ 12px metadata and shortcuts.",
  },
  backdropLine: { zh: "底层内容 Lorem $i · 图片与正文滑过霜面之下", en: "Backdrop content Lorem $i · images and text slide beneath the frost" },
  textPrimary: { zh: "主要文字：文献标题与正文", en: "Primary text: reference titles and body" },
  textSecondary: { zh: "次要文字：作者、期刊与摘要", en: "Secondary text: authors, journal, abstract" },
  textTertiary: { zh: "三级：更新于 3 分钟前 · ⌘K", en: "Tertiary: updated 3 minutes ago · ⌘K" },
  unityTitle: { zh: "整体性", en: "Cohesion" },
  unityDesc: {
    zh: "霜面内部只用半透明叠层（--fill-* / *-subtle / --control-bg）；一块不透明的底色会把材质从内部切断。",
    en: "Inside frost use only translucent overlays (--fill-* / *-subtle / --control-bg); a single opaque fill cuts the material apart from within.",
  },
  okOverlay: { zh: "✓ 半透明叠层", en: "✓ Translucent overlays" },
  badOpaque: { zh: "✗ 内部铺不透明底色", en: "✗ Opaque fills inside" },
  searchCommands: { zh: "搜索命令", en: "Search commands" },
  recentRow: { zh: "最近：导入 BibTeX", en: "Recent: Import BibTeX" },
  selectedRow: { zh: "已选中：插入引用", en: "Selected: Insert citation" },
  scrimTitle: { zh: "遮罩", en: "Scrim" },
  scrimDesc: {
    zh: "遮罩只压暗（--scrim），不模糊。模糊遮罩让面板底下变成一片灰，霜就失去了意义。",
    en: "The scrim only dims (--scrim), never blurs. A blurred scrim turns everything under the panel into gray mush and defeats the frost.",
  },
  draftLine: { zh: "草稿正文第 $i 段：气候模型的参数化方案对结果影响显著，需要在讨论部分说明。", en: "Draft paragraph $i: how the climate model is parameterized affects the results significantly and needs a note in the discussion." },
  deleteDraftTitle: { zh: "删除草稿？", en: "Delete draft?" },
  deleteDraftBody: { zh: "「气候模型综述」将移入回收站，30 天内可恢复。", en: "“Climate model review” will move to the trash; recoverable for 30 days." },
  cancel: { zh: "取消", en: "Cancel" },
  fallbackTitle: { zh: "降级", en: "Fallback" },
  fallbackRule1: {
    zh: "不支持 backdrop-filter、系统开启「减少透明度」、或低配档 <span class=\"doc-code\">html.mw-lowfx</span> 时，霜退为不透明 <span class=\"doc-code\">--frost-fallback</span>，读感不变。",
    en: "When backdrop-filter is unsupported, the system turns on “reduce transparency”, or the low-effects tier <span class=\"doc-code\">html.mw-lowfx</span> applies, frost falls back to the opaque <span class=\"doc-code\">--frost-fallback</span> with the same reading feel.",
  },
  fallbackRule2: {
    zh: "<span class=\"doc-code\">filter</span> / <span class=\"doc-code\">backdrop-filter</span> 永不进入过渡与关键帧。",
    en: "<span class=\"doc-code\">filter</span> / <span class=\"doc-code\">backdrop-filter</span> never enter transitions or keyframes.",
  },
  fallbackRule3: {
    zh: "工作台浮岛不是霜：它们是纸面 + 发丝边 + 轻阴影，浮在画布上。",
    en: "Workbench islands are not frost: they are paper + hairline border + light shadow, floating on the canvas.",
  },
} as const;

function fill(i: number): string {
  return t(s.backdropLine).replace("$i", String(i));
}

function draftLine(i: number): string {
  return t(s.draftLine).replace("$i", String(i));
}
</script>

<template>
  <DocPage>
    <DocSection :title="s.thickTitle" :desc="s.thickDesc">
      <Specimen :surfaces="['frost']" min-height="220px">
        <div class="menu-demo">
          <div class="menu-demo__item menu-demo__item--on"><FileText /> {{ t(s.open) }}<kbd>↵</kbd></div>
          <div class="menu-demo__item"><Link2 /> {{ t(s.copyLink) }}<kbd>⌘L</kbd></div>
          <div class="menu-demo__item"><Pencil /> {{ t(s.rename) }}</div>
          <div class="menu-demo__item"><Copy /> {{ t(s.duplicate) }}</div>
          <hr />
          <div class="menu-demo__item menu-demo__item--danger"><Trash2 /> {{ t(s.delete) }}</div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.readTitle" :desc="s.readDesc">
      <div class="read-grid">
        <div v-for="b in backdrops" :key="b" class="read-cell" :class="`read-cell--${b}`">
          <div class="read-cell__content" aria-hidden="true">
            <span v-for="i in 9" :key="i">{{ fill(i) }}</span>
          </div>
          <div class="read-cell__frost mw-frost">
            <b>{{ t(backdropName[b]) }}</b>
            <span class="t-primary">{{ t(s.textPrimary) }}</span>
            <span class="t-secondary">{{ t(s.textSecondary) }}</span>
            <span class="t-tertiary">{{ t(s.textTertiary) }}</span>
          </div>
        </div>
      </div>
    </DocSection>

    <DocSection :title="s.unityTitle" :desc="s.unityDesc">
      <Specimen :surfaces="['frost']" themes="both" min-height="200px">
        <div class="unity">
          <div class="unity__panel">
            <span class="doc-note">{{ t(s.okOverlay) }}</span>
            <InputText v-model="q" :placeholder="t(s.searchCommands)" fluid />
            <div class="unity__row unity__row--tint">{{ t(s.recentRow) }}</div>
            <div class="unity__row unity__row--selected">{{ t(s.selectedRow) }}</div>
          </div>
          <div class="unity__panel">
            <span class="doc-note">{{ t(s.badOpaque) }}</span>
            <div class="unity__row unity__row--opaque">{{ t(s.recentRow) }}</div>
            <div class="unity__row unity__row--opaque">{{ t(s.selectedRow) }}</div>
          </div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.scrimTitle" :desc="s.scrimDesc">
      <Specimen :surfaces="['paper']" min-height="220px">
        <div class="scrim-demo">
          <div class="scrim-demo__page" aria-hidden="true">
            <span v-for="i in 7" :key="i">{{ draftLine(i) }}</span>
          </div>
          <div class="scrim-demo__scrim" />
          <div class="scrim-demo__dialog mw-frost mw-frost--thick">
            <b>{{ t(s.deleteDraftTitle) }}</b>
            <span>{{ t(s.deleteDraftBody) }}</span>
            <div class="doc-row" style="justify-content: flex-end; gap: var(--space-2)">
              <Button size="sm" variant="text" severity="secondary" :label="t(s.cancel)" />
              <Button size="sm" severity="danger" :label="t(s.delete)" />
            </div>
          </div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.fallbackTitle">
      <ul class="doc-rules">
        <li v-html="t(s.fallbackRule1)" />
        <li v-html="t(s.fallbackRule2)" />
        <li v-html="t(s.fallbackRule3)" />
      </ul>
    </DocSection>
  </DocPage>
</template>

<style scoped>
.menu-demo {
  width: 240px;
  margin-inline: auto;
  font-size: var(--type-body-sm-size);
}

.menu-demo__item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: var(--size-sm-h);
  padding: 0 var(--space-2);
  border-radius: var(--radius-item);
  color: var(--text-primary);
}

.menu-demo__item svg {
  width: var(--icon-md);
  height: var(--icon-md);
  color: var(--text-secondary);
}

.menu-demo__item--on {
  background: var(--fill-default);
}

.menu-demo__item--danger,
.menu-demo__item--danger svg {
  color: var(--danger-text);
}

.menu-demo kbd {
  margin-left: auto;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: var(--type-caption-size);
}

.menu-demo hr {
  margin: var(--space-1) var(--space-2);
  border: 0;
  border-top: var(--border-width) solid var(--border-subtle);
}

.read-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-2);
}

.read-cell {
  position: relative;
  height: 220px;
  overflow: hidden;
  border-radius: var(--radius-card);
  isolation: isolate;
}

.read-cell--light {
  background: var(--palette-paper-50);
  color: var(--palette-paper-900);
}

.read-cell--dark {
  background: var(--palette-carbon-950);
  color: var(--palette-carbon-50);
}

.read-cell--vivid {
  background:
    radial-gradient(circle at 20% 30%, var(--palette-mango-400), transparent 45%),
    radial-gradient(circle at 80% 70%, var(--palette-blue-400), transparent 50%),
    radial-gradient(circle at 60% 10%, var(--palette-green-400), transparent 40%),
    var(--palette-amber-300);
  color: var(--palette-paper-900);
}

.read-cell__content {
  display: grid;
  gap: var(--space-1);
  padding: var(--space-3);
  font-size: var(--type-body-sm-size);
  font-weight: var(--weight-semibold);
}

.read-cell__frost {
  position: absolute;
  color: var(--text-primary);
  left: var(--space-5);
  right: var(--space-5);
  top: 50px;
  display: grid;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-float);
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
}

.t-primary {
  color: var(--text-primary);
}

.t-secondary {
  color: var(--text-secondary);
}

.t-tertiary {
  color: var(--text-tertiary);
  font-size: var(--type-caption-size);
}

.unity {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  width: 100%;
}

.unity__panel {
  display: grid;
  gap: var(--space-2);
  align-content: start;
}

.unity__row {
  height: var(--size-md-h);
  display: flex;
  align-items: center;
  padding: 0 var(--space-3);
  border-radius: var(--radius-item);
  font-size: var(--type-body-sm-size);
}

.unity__row--tint {
  background: var(--fill-subtle);
}

.unity__row--selected {
  background: var(--fill-selected);
}

.unity__row--opaque {
  background: var(--bg-raised);
  box-shadow: inset 0 0 0 1px var(--border-subtle);
}

.scrim-demo {
  position: relative;
  width: 100%;
  min-height: 200px;
  overflow: hidden;
  border-radius: var(--radius-md);
}

.scrim-demo__page {
  display: grid;
  gap: var(--space-1-5);
  padding: var(--space-3);
  font-size: var(--type-body-sm-size);
}

.scrim-demo__scrim {
  position: absolute;
  inset: 0;
  background: var(--scrim);
}

.scrim-demo__dialog {
  position: absolute;
  inset: var(--space-6) 0 auto;
  display: grid;
  gap: var(--space-2);
  max-width: 340px;
  margin: var(--space-4) auto 0;
  padding: var(--space-5);
  border-radius: var(--radius-dialog);
  font-size: var(--type-body-size);
}

.scrim-demo__dialog span {
  color: var(--text-secondary);
  font-size: var(--type-body-sm-size);
}
</style>
