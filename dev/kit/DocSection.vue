<script setup lang="ts">
import { t, type Bi } from "../i18n";

defineProps<{ title: string | Bi; desc?: string | Bi; id?: string }>();
</script>

<template>
  <section :id="id" class="doc-section">
    <h2 class="doc-section__title">{{ t(title) }}</h2>
    <p v-if="desc" class="doc-section__desc">{{ t(desc) }}</p>
    <div class="doc-section__body">
      <slot />
    </div>
  </section>
</template>
