<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";
import {
  computed,
  getCurrentInstance,
  inject,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  useSlots,
} from "vue";
import Button from "../Button.vue";
import { vScrollFade } from "../../lib/scroll-fade";
import { vTooltip } from "../../lib/tooltip";
import { uiMessages } from "../../locale";
import {
  ADMIN_HEADER_LEAD_TAKEN,
  type AdminDetailPageEmits,
  type AdminDetailPageProps,
} from "./admin-defs";

defineOptions({
  name: "MwAdminDetailPage",
});

const props = withDefaults(defineProps<AdminDetailPageProps>(), {
  backTo: undefined,
  showBack: undefined,
  backLabel: undefined,
  teleport: true,
  leadTarget: "#admin-header-lead",
  actionsTarget: "#admin-header-actions",
});

const emit = defineEmits<AdminDetailPageEmits>();
const slots = useSlots();
const instance = getCurrentInstance();
const leadTaken = inject(ADMIN_HEADER_LEAD_TAKEN, null);

const hasBack = computed(() => Boolean(props.backTo || props.showBack));

const resolvedBackLabel = computed(() => {
  if (props.backLabel) return props.backLabel;
  const globalProps = instance?.appContext.config.globalProperties as
    | { $t?: (k: string) => string }
    | undefined;
  if (typeof globalProps?.$t === "function") {
    const res = globalProps.$t("common.admin.back");
    if (res && res !== "common.admin.back") return res;
  }
  return uiMessages["zh-CN"].common.admin.back;
});

function syncLead() {
  if (leadTaken && props.teleport) {
    leadTaken.value = Boolean(hasBack.value || slots.title);
  }
}

onMounted(syncLead);
onUpdated(syncLead);
onBeforeUnmount(() => {
  if (leadTaken) leadTaken.value = false;
});

function handleBack() {
  emit("back");
  if (props.backTo !== undefined) {
    const proxy = instance?.proxy as { $router?: { push?: (to: unknown) => unknown } } | null;
    proxy?.$router?.push?.(props.backTo);
  }
}
</script>

<template>
  <div class="admin-panel admin-detail-page">
    <Teleport v-if="teleport && (hasBack || $slots.title)" defer :to="leadTarget">
      <Button
        v-if="hasBack"
        :icon="ArrowLeft"
        text
        severity="secondary"
        :aria-label="resolvedBackLabel"
        v-tooltip.bottom="resolvedBackLabel"
        @click="handleBack"
      />
      <div v-if="$slots.title" class="admin-detail-title">
        <slot name="title" />
      </div>
    </Teleport>
    <Teleport v-if="teleport && $slots.actions" defer :to="actionsTarget">
      <slot name="actions" />
    </Teleport>

    <header v-if="!teleport && (hasBack || $slots.title || $slots.actions)" class="mw-admin-shell-header">
      <div class="mw-admin-shell-header__lead">
        <Button
          v-if="hasBack"
          :icon="ArrowLeft"
          text
          severity="secondary"
          :aria-label="resolvedBackLabel"
          v-tooltip.bottom="resolvedBackLabel"
          @click="handleBack"
        />
        <div v-if="$slots.title" class="admin-detail-title">
          <slot name="title" />
        </div>
      </div>
      <div v-if="$slots.actions" class="mw-admin-shell-header__actions">
        <slot name="actions" />
      </div>
    </header>

    <div v-if="$slots.cards" class="admin-detail-cards">
      <slot name="cards" />
    </div>

    <div v-if="$slots.tabs" class="admin-detail-tabs">
      <slot name="tabs" />
    </div>

    <div class="admin-detail-page__body admin-panel--scrollable" v-scroll-fade>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.admin-detail-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  gap: var(--space-3);
}

.admin-detail-page__body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.admin-panel--scrollable {
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--space-1);
  margin: calc(-1 * var(--space-1));
}

.admin-panel--scrollable > * {
  flex-shrink: 0;
}

/* 当默认插槽直接放入 <Tabs> 时，TabList 作为页面要素固定在顶部，仅下方 TabPanels 数据区滚动 */
.admin-detail-page__body :deep(> .mw-tabs) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-detail-page__body :deep(> .mw-tabs > .mw-tab-list) {
  flex-shrink: 0;
}

.admin-detail-page__body :deep(> .mw-tabs > .mw-tab-panels) {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.admin-panel--scrollable :deep(.mw-datatable:not(.mw-datatable--flex-scrollable)) {
  flex: none;
  height: auto;
}

.admin-panel--scrollable :deep(.mw-datatable:not(.mw-datatable--flex-scrollable) .mw-datatable__table-container) {
  flex: none;
}

.admin-panel--scrollable :deep(.mw-datatable thead th) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--mw-datatable-head-bg, var(--bg-raised));
  white-space: nowrap;
}

.mw-admin-shell-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding-bottom: var(--space-3);
  border-bottom: var(--border-width) solid var(--border-subtle);
  flex-shrink: 0;
}

.mw-admin-shell-header__lead {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex: 1 1 auto;
  min-width: 0;
}

.mw-admin-shell-header__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  margin-inline-start: auto;
}

.admin-detail-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-0-5) var(--space-4);
  min-width: 0;
}

.admin-detail-cards {
  --mw-admin-detail-card-min: 240px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--mw-admin-detail-card-min), 1fr));
  gap: var(--space-3);
  flex-shrink: 0;
}

.admin-detail-tabs {
  flex-shrink: 0;
}
</style>
