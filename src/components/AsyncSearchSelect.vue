<script setup lang="ts">
// 异步远程搜索单选 — 公开门面不变（string id 的 modelValue + 注入 search +
// select 事件），内部基 PrimeVue AutoComplete：浮层定位/翻转/z-index、键盘
// a11y、focus ring 与 sm/lg/invalid 档全部继承上游；玻璃浮层配方来自
// primevue-theme.css，这里不再自绘面板。
// 门面自持三件事：
//   • seq 守卫——过期响应与 loading 状态都不落，清除时作废在途请求；
//   • 回显治愈——外部设入未见过的 id 先以裸值占位，initialOption 或之后任意
//     一次取回命中即补上真实 label；
//   • excludeValues 过滤（响应式）。
// 打字中的查询串只留在本地，面板收起即回退已选值（等价旧 dismiss 语义；
// 不能用 forceSelection——它无匹配时清空整个选择而不是恢复旧值）。auto 高亮
// 首项的 auto-option-focus 依赖 select-on-focus 保持关闭：两者同开时上游会在
// 结果落地且字段为空时自动选走首项。
import AutoComplete from "primevue/autocomplete";
import { computed, ref, useId, watch } from "vue";
import { useI18n } from "vue-i18n";

import type { AsyncSearchOption } from "./async-search-select";

const props = withDefaults(
  defineProps<{
    modelValue: string | null;
    search: (query: string) => Promise<AsyncSearchOption[]>;
    inputId?: string;
    ariaLabel?: string;
    placeholder?: string;
    emptyMessage?: string;
    loadingMessage?: string;
    showClear?: boolean;
    disabled?: boolean;
    /** 撑满父容器宽度（默认 hug content）。 */
    fluid?: boolean;
    debounceMs?: number;
    /** 从结果里剔除的 value（如已被选过的项）；响应式，变更即时生效。 */
    excludeValues?: string[];
    /** modelValue 命中未见过的 id 时的回显选项（调用方知道 label 时注入）。 */
    initialOption?: AsyncSearchOption | null;
  }>(),
  {
    inputId: undefined,
    ariaLabel: undefined,
    placeholder: undefined,
    emptyMessage: undefined,
    loadingMessage: undefined,
    showClear: true,
    disabled: false,
    fluid: false,
    debounceMs: 250,
    excludeValues: () => [],
    initialOption: undefined,
  },
);
const emit = defineEmits<{
  (e: "update:modelValue", value: string | null): void;
  (e: "select", option: AsyncSearchOption | null): void;
}>();

const { t } = useI18n();
const emptyMessageText = computed(() => props.emptyMessage ?? t("common.select.noMatch"));
const loadingMessageText = computed(() => props.loadingMessage ?? t("common.select.searching"));

const generatedId = useId();
const fieldId = computed(() => props.inputId ?? `mw-ass-${generatedId}`);

// AutoComplete 的 modelValue 是完整选项对象或打字中的查询串；string id 门面经
// seenOptions 翻译。查询串只落在本地，不外发。
const seenOptions = ref(new Map<string, AsyncSearchOption>());
const selected = ref<AsyncSearchOption | string | null>(null);

watch(
  () => props.modelValue,
  (id) => {
    if (!id) {
      selected.value = null;
      return;
    }
    if (!seenOptions.value.has(id)) {
      const seed =
        props.initialOption?.value === id ? props.initialOption : { value: id, label: id };
      seenOptions.value.set(id, seed);
    }
    selected.value = seenOptions.value.get(id)!;
  },
  { immediate: true },
);

const rawResults = ref<AsyncSearchOption[]>([]);
const loading = ref(false);
const suggestions = computed(() =>
  rawResults.value.filter((o) => !props.excludeValues.includes(o.value)),
);

let seq = 0;
async function runSearch(query: string) {
  const current = ++seq;
  loading.value = true;
  try {
    const items = await props.search(query);
    if (current !== seq) return;
    for (const option of items) seenOptions.value.set(option.value, option);
    // 浅拷贝：上游面板靠 suggestions 的引用变化开合，记忆化 search 返回同一
    // 数组实例时不会重开面板。
    rawResults.value = [...items];
    // 取回命中当前已选 id 时换上完整选项，输入框跟着补真实 label（回显治愈）。
    if (props.modelValue && typeof selected.value === "object") {
      const fresh = seenOptions.value.get(props.modelValue);
      if (fresh && fresh !== selected.value) selected.value = fresh;
    }
  } catch {
    if (current !== seq) return;
    rawResults.value = [];
  } finally {
    if (current === seq) loading.value = false;
  }
}

function onComplete(event: { query: string }) {
  void runSearch(event.query);
}

const acRef = ref<InstanceType<typeof AutoComplete> | null>(null);
// 点击字段重开面板：上游只在 focus 事件上触发取数，选中/Escape 之后焦点留在框
// 上、面板关着，再点字段上游无动于衷——旧版是「点字段即开」。箭头与清除按钮
// 各有自己的开合/清除语义，排除掉。
function onRootClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null;
  if (target?.closest(".p-autocomplete-dropdown, .p-autocomplete-clear-icon")) return;
  const ac = acRef.value as unknown as { overlayVisible: boolean; show: () => void } | null;
  if (ac && !ac.overlayVisible) {
    void runSearch("");
    ac.show();
  }
}

// 回退到已选值的展示。克隆一份选项：selected 常常本来就是那个对象，引用不变
// 时上游 d_value 不会重新同步，输入框会留在查询串/空串上。
function restoreSelected() {
  if (!props.modelValue) {
    selected.value = null;
    return;
  }
  const option = seenOptions.value.get(props.modelValue);
  selected.value = option ? { ...option } : { value: props.modelValue, label: props.modelValue };
}

function onUpdateModelValue(value: AsyncSearchOption | string | null) {
  if (value && typeof value === "object") {
    selected.value = value;
    seenOptions.value.set(value.value, value);
    emit("update:modelValue", value.value);
    emit("select", value);
    return;
  }
  if (value === null) {
    // 清除按钮：作废在途响应，不让旧结果复活；重开默认列表（等价旧 clear→focus
    // →reveal 的行为，面板开着时也直接补齐结果，不会卡在空态）。
    seq++;
    loading.value = false;
    rawResults.value = [];
    selected.value = null;
    if (props.modelValue !== null) {
      emit("update:modelValue", null);
      emit("select", null);
    }
    void runSearch("");
    return;
  }
  if (value === "") {
    // 打字删空不是清除选择：上游已收起面板，这里回退到已选值即可。
    restoreSelected();
    return;
  }
  selected.value = value;
}

function onDismiss() {
  // 打字中收起（Escape/外点/走焦）：回退已选值。hide 事件在浮层 leave 钩子里，
  // blur 兜底保证走焦这类不经过浮层关闭的路也能收口。
  if (typeof selected.value === "string") {
    restoreSelected();
  }
}
</script>

<template>
  <AutoComplete
    ref="acRef"
    :pt="{ root: { onClick: onRootClick } }"
    :model-value="selected"
    :suggestions="suggestions"
    option-label="label"
    data-key="value"
    dropdown
    dropdown-mode="blank"
    complete-on-focus
    auto-option-focus
    :min-length="0"
    :delay="debounceMs"
    :loading="loading"
    :show-clear="showClear"
    :disabled="disabled"
    :fluid="fluid"
    :placeholder="placeholder"
    :input-id="fieldId"
    :aria-label="ariaLabel"
    scroll-height="15rem"
    @complete="onComplete"
    @update:model-value="onUpdateModelValue"
    @hide="onDismiss"
    @blur="onDismiss"
  >
    <template #option="{ option }">
      <slot name="option" :option="option" :selected="option.value === modelValue">
        <span class="mw-ass-option-body">
          <img v-if="option.avatar" class="mw-ass-avatar" :src="option.avatar" alt="" />
          <span class="mw-ass-option-text">
            <span class="mw-ass-option-label">{{ option.label }}</span>
            <span v-if="option.description" class="mw-ass-option-desc">{{ option.description }}</span>
          </span>
        </span>
      </slot>
    </template>
    <template #empty>
      <span class="mw-ass-note">{{ loading ? loadingMessageText : emptyMessageText }}</span>
    </template>
    <template #clearicon="{ clearCallback }">
      <button type="button" class="p-autocomplete-clear-icon" :aria-label="t('common.select.clear')" @click="clearCallback">
        <i class="pi pi-times" aria-hidden="true" />
      </button>
    </template>
  </AutoComplete>
</template>

<style>
/* 面板 teleport 到 body，选项布局只能全局声明。行高亮/选中底色由上游
   autocomplete token + 主题的玻璃浮层规则承担，这里只排选项内容结构。 */
.mw-ass-option-body {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}
.mw-ass-avatar {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: var(--radius-pill, 999px);
  object-fit: cover;
  flex-shrink: 0;
}
.mw-ass-option-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.mw-ass-option-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mw-ass-option-desc {
  color: var(--color-text-tertiary);
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* 空态/加载文案的稳定类（文案由 #empty slot 提供，行样式在 .p-autocomplete-empty-message）。 */
.mw-ass-note {
  color: var(--color-text-tertiary);
}
/* #clearicon 换成真 button 拿到 aria-label；清掉 UA 默认件，热区尺寸交给主题 §4。 */
.p-autocomplete-clear-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
}
</style>
