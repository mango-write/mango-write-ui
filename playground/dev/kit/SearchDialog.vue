<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Dialog } from "@mango-write/ui-vue";
import { searchDocs, type SearchHit } from "../search";
import { t } from "../i18n";

const props = defineProps<{ open: boolean }>();

const s = {
  placeholder: { zh: "搜索组件、属性或设计规范…", en: "Search components, props, or design notes…" },
  aria: { zh: "搜索文档", en: "Search docs" },
  empty: { zh: "没有匹配结果", en: "No matches" },
} as const;
const emit = defineEmits<{ "update:open": [boolean] }>();

const router = useRouter();
const query = ref("");
const active = ref(0);
const hits = computed(() => searchDocs(query.value).slice(0, 8));
const dialogOpen = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
});

watch(
  () => props.open,
  (open) => {
    if (open) {
      query.value = "";
      active.value = 0;
    }
  },
);
watch(hits, () => (active.value = 0));

function go(hit: SearchHit) {
  emit("update:open", false);
  router.push(hit.item.url);
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "ArrowDown") {
    active.value = Math.min(active.value + 1, hits.value.length - 1);
    event.preventDefault();
  } else if (event.key === "ArrowUp") {
    active.value = Math.max(active.value - 1, 0);
    event.preventDefault();
  } else if (event.key === "Enter" && hits.value[active.value]) {
    go(hits.value[active.value]);
  }
}
</script>

<template>
  <Dialog
    v-model:open="dialogOpen"
    :show-header="false"
    dismissable-mask
    width="min(34rem, calc(100vw - 2rem))"
  >
    <div class="doc-search" @keydown="onKeydown">
      <input
        v-model="query"
        class="doc-search__input"
        type="text"
        :placeholder="t(s.placeholder)"
        :aria-label="t(s.aria)"
      />
      <ul v-if="hits.length" class="doc-search__list">
        <li
          v-for="(hit, i) in hits"
          :key="hit.item.url"
          class="doc-search__item"
          :class="{ 'is-active': i === active }"
          @mouseenter="active = i"
          @click="go(hit)"
        >
          <span class="doc-search__group">{{ t(hit.item.group) }}</span>
          <span class="doc-search__title">{{ hit.item.title }}</span>
        </li>
      </ul>
      <p v-else-if="query" class="doc-search__empty">{{ t(s.empty) }}</p>
    </div>
  </Dialog>
</template>
