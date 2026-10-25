<script setup lang="ts">
// 四态容器（issue #110 · §4.5）：加载 / 空 / 错误 / 内容收进一个组件。
// 目的是把「四态齐全 + 不闪 + 不跳」从靠自觉的规则变成用了就自动满足的默认值
// ——规则不如默认值。新取数界面一律用它，别再手写 v-if="loading" 直切。
//
// 内建四条行为（调用方不用操心）：
//  1. 状态切换一律交叉淡入（mw-async 独立命名空间，base 时长 + 4px 位移，L3
//     区域级语言；离场分支脱流防叠放，完成信号见 shared/lib/area-transition 的
//     :duration 约定，不用 out-in——快速换态下其延迟插入协调会竞态卡死）；
//  2. 加载态按 skeleton 指定的骨架占位，形状与真实内容一致是硬要求；
//  3. 空态强制要求 emptyTitle（#empty 整块覆盖或 #empty-action 至少给一个
//     下一步）——空态是邀请不是墓碑；dev 下缺文案给控制台警告；
//  4. 错误态默认渲染重试按钮（emit retry），#error-action 可覆盖。
import { useI18n } from "vue-i18n";
import Button from "primevue/button";
import { useSlots } from "vue";

import { areaDurationMs } from "../lib/area-transition.js";

const props = defineProps<{
  status: "loading" | "empty" | "error" | "ready";
  /** 骨架占位形状；与真实内容尺寸一致是硬要求。none = 不占位（调用方自理）。 */
  skeleton?: "list" | "card" | "text" | "none";
  /** 空态与错误态的文案，走 i18n key（不传裸中文），组件内 t()。 */
  emptyTitle?: string;
  emptyHint?: string;
  errorTitle?: string;
  errorHint?: string;
}>();

const emit = defineEmits<{ (e: "retry"): void }>();

const { t } = useI18n();
const slots = useSlots();

// 开发期契约检查：空态没标题、也没整块 #empty 覆盖 → 控制台警告。
if (import.meta.env.DEV) {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (props.status === "empty" && !props.emptyTitle && !slots.empty) {
    console.warn("[AsyncSlot] empty state needs emptyTitle (i18n key) or an #empty override — an empty state is an invitation, not a tombstone."); // i18n-allow: dev-only console diagnostic, not UI copy
  }
}

/** 骨架行数：list 5 行 / text 3 行 / card 单卡，对应常见列表与正文的真实密度。 */
const skeletonRows = props.skeleton === "text" ? 3 : 5;
</script>

<template>
  <!-- 状态换装交叉淡入 + 独立 mw-async 命名空间（不与外层区域级 mw-area 共类名）。
       默认模式（非 out-in）：新区即刻入流，离场分支由 .mw-async-host 提供定位
       上下文脱流淡出。完成信号走显式 :duration，不接管 Vue 原生完成协调。 -->
  <div class="mw-async-host">
    <Transition name="mw-async" :duration="areaDurationMs()">
    <!-- 加载态：骨架占位，形状与真实内容一致（skeleton=none 时零占位）。 -->
    <div v-if="status === 'loading' && skeleton !== 'none'" key="loading" class="mw-async mw-async--loading" aria-busy="true">
      <template v-if="skeleton === 'card'">
        <div class="mw-async-skeleton mw-async-skeleton--card" />
      </template>
      <template v-else>
        <div
          v-for="i in skeletonRows"
          :key="i"
          class="mw-async-skeleton mw-async-skeleton--row"
          :style="{ width: i === skeletonRows ? '62%' : undefined }"
        />
      </template>
    </div>

    <!-- 空态：整块 #empty 覆盖优先（复杂空态），否则 title/hint + #empty-action。 -->
    <div v-else-if="status === 'empty'" key="empty" class="mw-async mw-async--empty">
      <slot name="empty">
        <span class="mw-async-empty-icon"><i class="pi pi-inbox" /></span>
        <p class="mw-async-title">{{ emptyTitle ? t(emptyTitle) : "" }}</p>
        <p v-if="emptyHint" class="mw-async-hint">{{ t(emptyHint) }}</p>
        <div v-if="slots['empty-action']" class="mw-async-action">
          <slot name="empty-action" />
        </div>
      </slot>
    </div>

    <!-- 错误态：说清发生了什么 + 怎么办；默认重试按钮，#error-action 可覆盖。 -->
    <div v-else-if="status === 'error'" key="error" class="mw-async mw-async--error" role="alert">
      <slot name="error">
        <span class="mw-async-empty-icon"><i class="pi pi-exclamation-triangle" /></span>
        <p class="mw-async-title">{{ errorTitle ? t(errorTitle) : t("common.async.errorTitle") }}</p>
        <p v-if="errorHint" class="mw-async-hint">{{ t(errorHint) }}</p>
        <div class="mw-async-action">
          <slot name="error-action">
            <Button
              :label="t('common.async.retry')"
              icon="pi pi-refresh"
              severity="secondary"
              variant="outlined"
              size="small"
              @click="emit('retry')"
            />
          </slot>
        </div>
      </slot>
    </div>

    <!-- 内容态。 -->
    <div v-else key="ready" class="mw-async mw-async--ready">
      <slot />
    </div>
    </Transition>
  </div>
</template>

<style scoped>
/* 交叉淡入的定位宿主：离场分支脱流覆在上方淡出，不与入场分支叠放撑高。 */
.mw-async-host {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
}
.mw-async-leave-active {
  position: absolute;
  inset-inline: 0;
  top: 0;
}

/* 状态换装的过渡语言与 mw-area 一致（交叉淡入 + 4px 位移），但类名独立，
   不与外层区域级过渡共享类空间。 */
.mw-async-enter-active,
.mw-async-leave-active {
  transition:
    opacity var(--motion-duration-base) var(--motion-ease-standard),
    transform var(--motion-duration-base) var(--motion-ease-standard);
}
.mw-async-enter-from {
  opacity: 0;
  transform: translateY(4px);
}
.mw-async-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
@media (prefers-reduced-motion: reduce) {
  .mw-async-enter-active,
  .mw-async-leave-active {
    transition: none;
  }
}

.mw-async {
  width: 100%;
}
.mw-async--loading {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 4px 0;
}
.mw-async-skeleton {
  border-radius: var(--radius-sm);
  background: var(--color-surface-muted);
  animation: mw-async-pulse 1.4s var(--motion-ease-standard) infinite;
}
.mw-async-skeleton--row {
  height: 44px;
}
.mw-async-skeleton--card {
  height: 160px;
  border-radius: var(--radius-lg);
}
@keyframes mw-async-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.55;
  }
}
@media (prefers-reduced-motion: reduce) {
  .mw-async-skeleton {
    animation: none;
  }
}
.mw-async--empty,
.mw-async--error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 48px 16px;
  text-align: center;
}
.mw-async-empty-icon {
  font-size: 28px;
  color: var(--color-text-quaternary);
}
.mw-async-title {
  margin: 0;
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}
.mw-async-hint {
  margin: 0;
  font-size: var(--font-size-body-sm);
  color: var(--color-text-tertiary);
  max-width: 36em;
}
.mw-async--error .mw-async-empty-icon {
  color: var(--color-warning-500);
}
.mw-async-action {
  margin-top: 6px;
}
.mw-async--ready {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
