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
