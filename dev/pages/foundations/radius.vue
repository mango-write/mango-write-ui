<script setup lang="ts">
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";

const scale = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl", "full"];
const semantic = [
  ["--radius-item", "菜单项、列表行"],
  ["--radius-card", "卡片、分组卡"],
  ["--radius-float", "菜单、弹出层、Toast"],
  ["--radius-dialog", "对话框"],
  ["--radius-sheet", "工作台浮岛"],
  ["--control-radius", "控件（随尺寸档）"],
];
</script>

<template>
  <DocPage lead="圆角表达「这是一件独立的东西」以及它的大小。越大的容器圆角越大；控件圆角随尺寸档走，不单独指定。">
    <DocSection title="刻度">
      <div class="radius-row">
        <div v-for="r in scale" :key="r" class="radius-box" :style="{ borderRadius: `var(--radius-${r})` }">
          <code>{{ r }}</code>
        </div>
      </div>
    </DocSection>

    <DocSection title="语义圆角" desc="组件写语义名，不写刻度。">
      <div class="radius-row">
        <div v-for="[t, use] in semantic" :key="t" class="radius-box radius-box--wide" :style="{ borderRadius: `var(${t})` }">
          <code>{{ t }}</code>
          <span>{{ use }}</span>
        </div>
      </div>
    </DocSection>

    <DocSection title="同心规则" desc="容器套容器时，内圆角 = 外圆角 − 内边距。否则内外两条弧不平行，角上会「鼓」或「瘪」。">
      <Specimen :surfaces="['frost']" themes="single">
        <div class="concentric">
          <div class="concentric__panel">
            <div class="concentric__item concentric__item--on">打开</div>
            <div class="concentric__item">在新标签页打开</div>
          </div>
          <p class="doc-note">✓ --radius-float − --float-padding = --radius-item</p>
        </div>
        <div class="concentric">
          <div class="concentric__panel">
            <div class="concentric__item concentric__item--on concentric__item--wrong">打开</div>
            <div class="concentric__item">在新标签页打开</div>
          </div>
          <p class="doc-note">✗ 内外同圆角：内弧比外弧更圆，角部发胖</p>
        </div>
      </Specimen>
    </DocSection>
  </DocPage>
</template>

<style scoped>
.radius-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.radius-box {
  display: grid;
  place-content: center;
  gap: var(--space-0-5);
  width: 88px;
  height: 88px;
  border: var(--border-width) solid var(--border-default);
  background: var(--fill-subtle);
  text-align: center;
}

.radius-box--wide {
  width: 156px;
}

.radius-box code {
  font-family: var(--font-mono);
  font-size: var(--type-caption-size);
}

.radius-box span {
  color: var(--text-tertiary);
  font-size: var(--type-micro-size);
}

.concentric {
  display: grid;
  gap: var(--space-2);
}

.concentric__panel {
  width: 200px;
  padding: var(--float-padding);
  border-radius: var(--radius-float);
  border: var(--border-width) solid var(--border-default);
}

.concentric__item {
  height: var(--size-sm-h);
  display: flex;
  align-items: center;
  padding: 0 var(--space-2);
  border-radius: var(--radius-item);
  font-size: var(--type-body-sm-size);
}

.concentric__item--on {
  background: var(--fill-selected);
}

.concentric__item--wrong {
  border-radius: var(--radius-float);
}
</style>
