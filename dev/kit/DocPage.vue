<script setup lang="ts">
import { useRoute } from "vue-router";

defineProps<{ lead?: string }>();
const route = useRoute();
</script>

<template>
  <article class="doc">
    <p class="doc__eyebrow">{{ route.meta.group }} · {{ route.meta.en }}</p>
    <h1 class="doc__title">{{ route.meta.title }}</h1>
    <p v-if="lead" class="doc__lead">{{ lead }}</p>
    <slot />
  </article>
</template>
