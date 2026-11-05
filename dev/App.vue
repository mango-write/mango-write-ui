<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { Search } from "lucide-vue-next";
import { Button, ConfirmHost, ToastHost } from "../src";
import { docGroups } from "./registry";
import SearchDialog from "./kit/SearchDialog.vue";
import TopBar from "./kit/TopBar.vue";
import { version as uiVersion } from "../package.json";

const route = useRoute();
const sheet = ref<HTMLElement | null>(null);
watch(
  () => route.path,
  () => sheet.value?.scrollTo({ top: 0 }),
);

const searchOpen = ref(false);
function onGlobalKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchOpen.value = !searchOpen.value;
  }
}
onMounted(() => window.addEventListener("keydown", onGlobalKeydown));
onUnmounted(() => window.removeEventListener("keydown", onGlobalKeydown));
</script>

<template>
  <RouterView v-if="route.meta.landing" />
  <div v-else class="dev-app">
    <TopBar>
      <template #append>
        <a
          class="dev-version"
          href="https://github.com/mango-write/mango-write-ui/blob/main/CHANGELOG.md"
          target="_blank"
          rel="noreferrer"
        >v{{ uiVersion }}</a>
        <Button
          variant="text"
          severity="secondary"
          size="sm"
          :icon="Search"
          aria-label="搜索文档（Ctrl K）"
          @click="searchOpen = true"
        />
      </template>
    </TopBar>
    <div class="dev-body">
      <nav class="dev-nav mw-scroll mw-frost" aria-label="设计规范目录">
        <section v-for="group in docGroups" :key="group.id" class="dev-nav__group">
          <h2 class="dev-nav__heading">{{ group.title }}</h2>
          <RouterLink
            v-for="entry in group.entries"
            :key="entry.slug"
            :to="`${group.base}/${entry.slug}`"
            class="dev-nav__item"
          >
            <span>{{ entry.title }}</span>
            <span class="dev-nav__en">{{ entry.en }}</span>
          </RouterLink>
        </section>
      </nav>
      <main ref="sheet" class="dev-sheet mw-scroll">
        <RouterView />
      </main>
    </div>
  </div>
  <ToastHost position="top-right" />
  <ConfirmHost />
  <SearchDialog v-model:open="searchOpen" />
</template>

<style scoped>
.dev-version {
  padding: 0 var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--type-caption-size);
  line-height: var(--size-sm-h);
  color: var(--text-tertiary);
}

.dev-version:hover {
  background: var(--fill-default);
  color: var(--text-primary);
}
</style>
