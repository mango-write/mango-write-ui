<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { Search } from "lucide-vue-next";
import { Button, ConfirmHost, ToastHost } from "@mango-write/ui-vue";
import { docGroups } from "./registry";
import { alt, locale, t } from "./i18n";
import SearchDialog from "./kit/SearchDialog.vue";
import TopBar from "./kit/TopBar.vue";
import { version as uiVersion } from "../package.json";

const route = useRoute();
const sheet = ref<HTMLElement | null>(null);
watch(
  () => route.path,
  () => sheet.value?.scrollTo({ top: 0 }),
);

// document.title 跟路由与语言走;index.html 的静态 title 只是首帧兜底。
watchEffect(() => {
  const title = route.meta.title;
  document.title = title ? `${t(title)} · MangoWrite UI` : "MangoWrite UI";
});

const s = {
  searchDocs: { zh: "搜索文档（Ctrl K）", en: "Search docs (Ctrl K)" },
  navDir: { zh: "设计规范目录", en: "Docs directory" },
} as const;

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
          class="dev-search"
          variant="text"
          severity="secondary"
          size="sm"
          :icon="Search"
          :aria-label="t(s.searchDocs)"
          @click="searchOpen = true"
        />
      </template>
    </TopBar>
    <div class="dev-body">
      <nav class="dev-nav mw-frost" :aria-label="t(s.navDir)">
        <div v-scroll-fade.sm class="dev-nav__scroll mw-scroll">
          <section v-for="group in docGroups" :key="group.id" class="dev-nav__group">
            <h2 class="dev-nav__heading">{{ t(group.title) }}</h2>
            <RouterLink
              v-for="entry in group.entries"
              :key="entry.slug"
              :to="`${group.base}/${entry.slug}`"
              class="dev-nav__item"
            >
              <span>{{ t(entry.title) }}</span>
              <span class="dev-nav__en">{{ alt(entry.title, locale) }}</span>
            </RouterLink>
          </section>
        </div>
      </nav>
      <main class="dev-sheet">
        <div ref="sheet" v-scroll-fade class="dev-sheet__scroll mw-scroll">
          <RouterView />
        </div>
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

/* 窄屏让位给顶栏的首页/文档切换胶囊;版本号走 GitHub CHANGELOG,
   手机档再收搜索钮(Ctrl+K 是桌面习惯,搜索先让位给区域切换)。 */
@media (max-width: 720px) {
  .dev-version {
    display: none;
  }
}

@media (max-width: 480px) {
  .dev-search {
    display: none;
  }
}
</style>
