<script setup lang="ts">
import { computed, getCurrentInstance } from "vue";
import Button from "../Button.vue";
import { useConfirm } from "../../lib/confirm";
import { vScrollFade } from "../../lib/scroll-fade";
import { uiMessages } from "../../locale";
import type { AdminConfigPageEmits, AdminConfigPageProps } from "./admin-defs";

defineOptions({
  name: "MwAdminConfigPage",
});

const props = withDefaults(defineProps<AdminConfigPageProps>(), {
  dirtyCount: 0,
  saving: false,
  confirmMessage: undefined,
  title: undefined,
  teleport: true,
  actionsTarget: "#admin-header-actions",
  unsavedLabel: undefined,
  saveLabel: undefined,
  savingLabel: undefined,
  confirmHeader: undefined,
  confirmAcceptLabel: undefined,
  confirmRejectLabel: undefined,
});

const emit = defineEmits<AdminConfigPageEmits>();
const confirm = useConfirm();
const instance = getCurrentInstance();

function translate(keys: string[], fallback: string, params?: Record<string, unknown>): string {
  const globalProps = instance?.appContext.config.globalProperties as
    | { $t?: (k: string, p?: Record<string, unknown>) => string }
    | undefined;
  if (typeof globalProps?.$t === "function") {
    for (const key of keys) {
      const res = globalProps.$t(key, params);
      if (res && res !== key) return res;
    }
  }
  if (params && "count" in params) {
    return fallback.replace("{count}", String(params.count));
  }
  return fallback;
}

const resolvedUnsaved = computed(
  () =>
    props.unsavedLabel ??
    translate(
      ["platform.admin.shell.unsaved", "common.admin.unsaved"],
      uiMessages["zh-CN"].common.admin.unsaved,
      { count: props.dirtyCount },
    ),
);

const resolvedSave = computed(
  () =>
    props.saveLabel ??
    translate(["platform.admin.shell.save", "common.admin.save"], uiMessages["zh-CN"].common.admin.save),
);

const resolvedSaving = computed(
  () =>
    props.savingLabel ??
    translate(["platform.admin.shell.saving", "common.admin.saving"], uiMessages["zh-CN"].common.admin.saving),
);

const resolvedConfirmHeader = computed(
  () =>
    props.confirmHeader ??
    translate(
      ["platform.admin.shell.confirmSaveHeader", "common.admin.confirmSaveHeader"],
      uiMessages["zh-CN"].common.admin.confirmSaveHeader,
    ),
);

const resolvedAcceptLabel = computed(
  () =>
    props.confirmAcceptLabel ??
    translate(["platform.admin.common.confirm", "common.confirm.accept"], uiMessages["zh-CN"].common.confirm.accept),
);

const resolvedRejectLabel = computed(
  () =>
    props.confirmRejectLabel ??
    translate(["platform.admin.common.cancel", "common.confirm.reject"], uiMessages["zh-CN"].common.confirm.reject),
);

function requestSave() {
  if (!props.confirmMessage) {
    emit("save");
    return;
  }
  void confirm.require({
    message: props.confirmMessage,
    header: resolvedConfirmHeader.value,
    acceptLabel: resolvedAcceptLabel.value,
    rejectLabel: resolvedRejectLabel.value,
    accept: () => emit("save"),
  });
}
</script>

<template>
  <div class="admin-panel admin-config-page">
    <Teleport v-if="teleport" defer :to="actionsTarget">
      <slot name="actions" />
      <span v-if="dirtyCount > 0" class="admin-config-bar__dirty">
        {{ resolvedUnsaved }}
      </span>
      <Button
        :label="saving ? resolvedSaving : resolvedSave"
        :disabled="dirtyCount === 0 || saving"
        :loading="saving"
        @click="requestSave"
      />
    </Teleport>
    <header v-else class="mw-admin-shell-header">
      <h2 v-if="title" class="mw-admin-shell-header__title">{{ title }}</h2>
      <div class="mw-admin-shell-header__actions">
        <slot name="actions" />
        <span v-if="dirtyCount > 0" class="admin-config-bar__dirty">
          {{ resolvedUnsaved }}
        </span>
        <Button
          :label="saving ? resolvedSaving : resolvedSave"
          :disabled="dirtyCount === 0 || saving"
          :loading="saving"
          @click="requestSave"
        />
      </div>
    </header>
    <div v-if="$slots.toolbar" class="admin-config-page__toolbar">
      <slot name="toolbar" />
    </div>
    <div class="admin-config-page__body admin-panel--scrollable" v-scroll-fade>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.admin-config-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  gap: var(--space-3);
}

.admin-config-page__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.admin-config-page__body {
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

.mw-admin-shell-header__title {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--type-title-size);
  line-height: var(--type-title-line);
  font-weight: var(--weight-semibold);
}

.mw-admin-shell-header__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  margin-inline-start: auto;
}

.admin-config-bar__dirty {
  color: var(--text-tertiary);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
  font-variant-numeric: tabular-nums;
}
</style>
