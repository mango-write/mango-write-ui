<script setup lang="ts">
import type { ApiEntry } from "../api/types";
import { t } from "../i18n";

defineProps<{ api: ApiEntry }>();

const s = {
  name: { zh: "名称", en: "Name" },
  type: { zh: "取值", en: "Type" },
  desc: { zh: "说明", en: "Description" },
} as const;
</script>

<template>
  <table class="doc-table">
    <thead>
      <tr><th>{{ t(s.name) }}</th><th>{{ t(s.type) }}</th><th>{{ t(s.desc) }}</th></tr>
    </thead>
    <tbody>
      <tr v-for="row in api.rows" :key="t(row.name)">
        <td><code>{{ t(row.name) }}</code></td>
        <td><code v-if="row.type">{{ t(row.type) }}</code></td>
        <!-- desc 是仓内人工校对的受控内容,非用户输入 -->
        <td v-html="t(row.desc)" />
      </tr>
    </tbody>
  </table>
</template>
