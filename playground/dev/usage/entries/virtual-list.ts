import { defineComponent, h, ref, type Component } from "vue";
import { Button, VirtualList, type VirtualListHandle } from "@mango-write/ui-vue";
import { t } from "../../i18n";
import { sfc } from "../codegen";
import type { UsageEntry } from "../types";

const records = Array.from({ length: 1000 }, (_, i) => i + 1);
const key = (item: number) => item;
const text = {
  jump: { zh: "跳到第 500 条", en: "Jump to record 500" },
  list: { zh: "记录列表", en: "Records" },
  details: { zh: "展开后仍会自动测量行高。", en: "The row is measured again after expansion." },
};
const rowStyle = "padding:var(--space-2);border-bottom:1px solid var(--border-subtle)";
const viewportStyle = "height:16rem";
const List = VirtualList as unknown as Component;

const Demo = defineComponent({
  setup() {
    const list = ref<VirtualListHandle | null>(null);
    return () => h("div", { style: "width:100%" }, [
      h(Button, { label: t(text.jump), severity: "secondary", onClick: () => list.value?.scrollToKey(500) }),
      h(List, {
        ref: list, items: records, itemKey: key, estimateSize: 40, style: viewportStyle, "aria-label": t(text.list),
      }, {
        default: ({ item }: { item: number }) => h("div", { style: rowStyle }, item % 5 === 0
          ? [h("details", [h("summary", String(item)), h("p", t(text.details))])]
          : String(item)),
      }),
    ]);
  },
});

export const usage: UsageEntry = {
  slug: "virtual-list",
  component: List,
  tag: "VirtualList",
  controls: [],
  render: () => h(Demo),
  code: () => sfc({
    ui: ["VirtualList"],
    vue: [],
    setup: ["const items = Array.from({ length: 1000 }, (_, i) => i + 1);"],
    template: `<VirtualList :items="items" :item-key="item => item" :estimate-size="40" aria-label="Records" style="${viewportStyle}">
  <template #default="{ item }"><div style="${rowStyle}">{{ item }}</div></template>
</VirtualList>`,
  }),
  reactCode: () => `import { VirtualList } from "@mango-write/ui-react";

const items = Array.from({ length: 1000 }, (_, i) => i + 1);

export default function Example() {
  return (
    <VirtualList items={items} itemKey={item => item} estimateSize={40} aria-label="Records" style={{ height: "16rem" }}>
      {item => <div style={{ padding: "var(--space-2)" }}>{item}</div>}
    </VirtualList>
  );
}`,
};
