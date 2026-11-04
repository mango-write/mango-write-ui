import { defineComponent, h, nextTick, ref } from "vue";
import { describe, expect, it } from "vitest";

import { mountUiComponent } from "../test-utils/mount.js";
import Tabs from "./Tabs.vue";
import TabList from "./TabList.vue";
import Tab from "./Tab.vue";
import TabPanels from "./TabPanels.vue";
import TabPanel from "./TabPanel.vue";

describe("Tabs", () => {
  it("支持 v-model 与 v-model:value 受控读写，并正确输出 tablist / tab / tabpanel 无障碍关联", async () => {
    const updates: Array<{ modelValue?: string | number; value?: string | number }> = [];
    const Host = defineComponent({
      setup() {
        const active = ref<string | number>("summary");
        return () =>
          h(
            Tabs,
            {
              value: active.value,
              "onUpdate:modelValue": (v: string | number) => {
                updates.push({ modelValue: v });
              },
              "onUpdate:value": (v: string | number) => {
                active.value = v;
                updates.push({ value: v });
              },
              "data-testid": "doc-tabs",
            },
            () => [
              h(TabList, { "aria-label": "文档视图" }, () => [
                h(Tab, { value: "summary" }, () => "摘要"),
                h(Tab, { value: "notes" }, () => "批注"),
                h(Tab, { value: "citations", disabled: true }, () => "引用"),
              ]),
              h(TabPanels, null, () => [
                h(TabPanel, { value: "summary" }, () => h("p", "论文摘要内容")),
                h(TabPanel, { value: "notes" }, () => h("p", "3 条批注")),
                h(TabPanel, { value: "citations" }, () => h("p", "12 次引用")),
              ]),
            ],
          );
      },
    });

    const wrapper = mountUiComponent(Host);
    await nextTick();

    const tablist = wrapper.get('[role="tablist"]');
    expect(tablist.classes()).toContain("mw-tab-list");
    expect(tablist.attributes("aria-label")).toBe("文档视图");

    const tabs = wrapper.findAll('[role="tab"]');
    expect(tabs).toHaveLength(3);
    expect(tabs[0]!.attributes("aria-selected")).toBe("true");
    expect(tabs[0]!.attributes("data-state")).toBe("active");
    expect(tabs[1]!.attributes("aria-selected")).toBe("false");
    expect(tabs[2]!.attributes("disabled")).toBeDefined();
    expect(tabs[2]!.attributes("data-disabled")).toBeDefined();

    const activePanel = wrapper.get('[role="tabpanel"]:not([hidden])');
    expect(activePanel.text()).toBe("论文摘要内容");
    expect(tabs[0]!.attributes("aria-controls")).toBe(activePanel.attributes("id"));
    expect(activePanel.attributes("aria-labelledby")).toBe(tabs[0]!.attributes("id"));

    // 点击第二个 Tab 切换
    await tabs[1]!.trigger("mousedown", { button: 0 });
    await nextTick();

    expect(updates).toEqual([{ modelValue: "notes" }, { value: "notes" }]);
    expect(tabs[1]!.attributes("aria-selected")).toBe("true");
    expect(tabs[1]!.attributes("data-state")).toBe("active");
    expect(wrapper.get('[role="tabpanel"]:not([hidden])').text()).toBe("3 条批注");

    // 点击禁用 Tab 不得切换
    await tabs[2]!.trigger("mousedown", { button: 0 });
    await nextTick();
    expect(tabs[1]!.attributes("aria-selected")).toBe("true");
  });

  it("支持非受控初始 value 与键盘 Enter/Space 激活", async () => {
    const wrapper = mountUiComponent({
      components: { Tabs, TabList, Tab, TabPanels, TabPanel },
      template: `
        <Tabs value="0">
          <TabList>
            <Tab value="0">第一项</Tab>
            <Tab value="1">第二项</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="0">面板 0</TabPanel>
            <TabPanel value="1">面板 1</TabPanel>
          </TabPanels>
        </Tabs>
      `,
    });

    await nextTick();
    const tabs = wrapper.findAll('[role="tab"]');
    expect(tabs[0]!.attributes("data-state")).toBe("active");
    expect(wrapper.get('[role="tabpanel"]:not([hidden])').text()).toBe("面板 0");

    await tabs[1]!.trigger("keydown", { key: "Enter" });
    await nextTick();
    expect(tabs[1]!.attributes("data-state")).toBe("active");
    expect(wrapper.get('[role="tabpanel"]:not([hidden])').text()).toBe("面板 1");
  });
});
