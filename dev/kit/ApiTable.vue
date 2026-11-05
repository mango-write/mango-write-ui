<script setup lang="ts">
import type { ApiEntry } from "../api/types";

defineProps<{ api: ApiEntry }>();
</script>

<template>
  <table class="doc-table">
    <thead>
      <tr><th>名称</th><th>取值</th><th>说明</th></tr>
    </thead>
    <tbody>
      <tr v-for="row in api.rows" :key="row.name">
        <td><code>{{ row.name }}</code></td>
        <td><code v-if="row.type">{{ row.type }}</code></td>
        <!-- desc 是仓内人工校对的受控内容,非用户输入 -->
        <td v-html="row.desc" />
      </tr>
    </tbody>
  </table>
</template>
