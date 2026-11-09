<script setup lang="ts">
import type { ColumnProps } from "./data-table.js";

defineOptions({
  name: "MwColumn",
  inheritAttrs: false,
  __mwColumn: true,
});

export type { ColumnProps } from "./data-table.js";

withDefaults(defineProps<ColumnProps>(), {
  field: undefined,
  header: undefined,
  footer: undefined,
  sortable: false,
  sortField: undefined,
  columnKey: undefined,
  selectionMode: undefined,
  expander: false,
  frozen: false,
  alignFrozen: "left",
  exportable: true,
  style: undefined,
  class: undefined,
  headerStyle: undefined,
  headerClass: undefined,
  bodyStyle: undefined,
  bodyClass: undefined,
  footerStyle: undefined,
  footerClass: undefined,
  width: undefined,
  minWidth: undefined,
  hidden: false,
});

defineSlots<{
  header?: (props: { column: ColumnProps }) => any;
  body?: (props: {
    data: any;
    index: number;
    field?: ColumnProps["field"];
    column: ColumnProps;
    frozenRow: boolean;
  }) => any;
  footer?: (props: { column: ColumnProps }) => any;
  default?: (props: {
    data: any;
    index: number;
    field?: ColumnProps["field"];
    column: ColumnProps;
    frozenRow: boolean;
  }) => any;
}>();
</script>

<template>
  <slot
    v-if="false"
    name="body"
    :data="undefined"
    :index="0"
    :field="field"
    :column="({} as ColumnProps)"
    :frozen-row="false"
  />
</template>
