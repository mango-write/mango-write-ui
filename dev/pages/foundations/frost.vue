<script setup lang="ts">
import { ref } from "vue";
import { Copy, FileText, Link2, Pencil, Trash2 } from "lucide-vue-next";
import { Button, InputText } from "../../../src";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";

const backdrops = ["light", "dark", "vivid"] as const;
const backdropName = { light: "浅色内容", dark: "深色内容", vivid: "鲜艳图片" };
const q = ref("");
</script>

<template>
  <DocPage
    lead="霜是唯一的浮层材质：一块均匀的毛玻璃。高不透明度的底色保证上层文字可读，模糊只负责暗示「底下还有东西」。没有镜面高光、没有折射。"
  >
    <DocSection title="霜与厚霜" desc=".mw-frost 给浮动层（菜单、下拉、Popover、Toast）；.mw-frost--thick 给覆盖层（对话框、确认框）。组件加类，不抄配方。">
      <Specimen :surfaces="['frost']" min-height="220px">
        <div class="menu-demo">
          <div class="menu-demo__item menu-demo__item--on"><FileText /> 打开<kbd>↵</kbd></div>
          <div class="menu-demo__item"><Link2 /> 复制链接<kbd>⌘L</kbd></div>
          <div class="menu-demo__item"><Pencil /> 重命名…</div>
          <div class="menu-demo__item"><Copy /> 创建副本</div>
          <hr />
          <div class="menu-demo__item menu-demo__item--danger"><Trash2 /> 删除</div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection
      title="可读性"
      desc="同一块霜压在浅色、深色与鲜艳内容上。正文用 primary / secondary；tertiary 只给 ≥ 12px 的元信息与快捷键。"
    >
      <div class="read-grid">
        <div v-for="b in backdrops" :key="b" class="read-cell" :class="`read-cell--${b}`">
          <div class="read-cell__content" aria-hidden="true">
            <span v-for="i in 9" :key="i">底层内容 Lorem {{ i }} · 图片与正文滑过霜面之下</span>
          </div>
          <div class="read-cell__frost mw-frost">
            <b>{{ backdropName[b] }}之上</b>
            <span class="t-primary">主要文字：文献标题与正文</span>
            <span class="t-secondary">次要文字：作者、期刊与摘要</span>
            <span class="t-tertiary">三级：更新于 3 分钟前 · ⌘K</span>
          </div>
        </div>
      </div>
    </DocSection>

    <DocSection
      title="整体性"
      desc="霜面内部只用半透明叠层（--fill-* / *-subtle / --control-bg）；一块不透明的底色会把材质从内部切断。"
    >
      <Specimen :surfaces="['frost']" themes="both" min-height="200px">
        <div class="unity">
          <div class="unity__panel">
            <span class="doc-note">✓ 半透明叠层</span>
            <InputText v-model="q" placeholder="搜索命令" fluid />
            <div class="unity__row unity__row--tint">最近：导入 BibTeX</div>
            <div class="unity__row unity__row--selected">已选中：插入引用</div>
          </div>
          <div class="unity__panel">
            <span class="doc-note">✗ 内部铺不透明底色</span>
            <div class="unity__row unity__row--opaque">最近：导入 BibTeX</div>
            <div class="unity__row unity__row--opaque">已选中：插入引用</div>
          </div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="遮罩" desc="遮罩只压暗（--scrim），不模糊。模糊遮罩让面板底下变成一片灰，霜就失去了意义。">
      <Specimen :surfaces="['paper']" min-height="220px">
        <div class="scrim-demo">
          <div class="scrim-demo__page" aria-hidden="true">
            <span v-for="i in 7" :key="i">草稿正文第 {{ i }} 段：气候模型的参数化方案对结果影响显著，需要在讨论部分说明。</span>
          </div>
          <div class="scrim-demo__scrim" />
          <div class="scrim-demo__dialog mw-frost mw-frost--thick">
            <b>删除草稿？</b>
            <span>「气候模型综述」将移入回收站，30 天内可恢复。</span>
            <div class="doc-row" style="justify-content: flex-end; gap: var(--space-2)">
              <Button size="sm" variant="text" severity="secondary" label="取消" />
              <Button size="sm" severity="danger" label="删除" />
            </div>
          </div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="降级">
      <ul class="doc-rules">
        <li>不支持 backdrop-filter、系统开启「减少透明度」、或低配档 <span class="doc-code">html.mw-lowfx</span> 时，霜退为不透明 <span class="doc-code">--frost-fallback</span>，读感不变。</li>
        <li><span class="doc-code">filter</span> / <span class="doc-code">backdrop-filter</span> 永不进入过渡与关键帧。</li>
        <li>工作台浮岛不是霜：它们是纸面 + 发丝边 + 轻阴影，浮在画布上。</li>
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
