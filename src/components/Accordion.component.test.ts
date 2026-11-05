import { defineComponent, h, nextTick, ref } from "vue";
import { describe, expect, it } from "vitest";

import { mountUiComponent } from "../test-utils/mount.js";
import Accordion from "./Accordion.vue";
import AccordionPanel from "./AccordionPanel.vue";
import AccordionHeader from "./AccordionHeader.vue";
import AccordionContent from "./AccordionContent.vue";

describe("Accordion", () => {
  it("支持单选模式受控 v-model:value 展开与收起，并输出正确的 ARIA 关联", async () => {
    const active = ref<string | number | null>("panel-1");
    const Host = defineComponent({
      setup() {
        return () =>
          h(
            Accordion,
            {
              value: active.value,
              "onUpdate:value": (val: string | number | Array<string | number> | null) => {
                active.value = Array.isArray(val) ? (val[0] ?? null) : val;
              },
              "data-testid": "acc-root",
            },
            () => [
              h(AccordionPanel, { value: "panel-1" }, () => [
                h(AccordionHeader, null, () => "面板一"),
                h(AccordionContent, null, () => "内容一"),
              ]),
              h(AccordionPanel, { value: "panel-2" }, () => [
                h(AccordionHeader, null, () => "面板二"),
                h(AccordionContent, null, () => "内容二"),
              ]),
              h(AccordionPanel, { value: "panel-3", disabled: true }, () => [
                h(AccordionHeader, null, () => "面板三（禁用）"),
                h(AccordionContent, null, () => "内容三"),
              ]),
            ],
          );
      },
    });

    const wrapper = mountUiComponent(Host, { attachTo: document.body });
    await nextTick();

    const headers = wrapper.findAll(".mw-accordion__header");
    const contents = wrapper.findAll(".mw-accordion__content");
    expect(headers).toHaveLength(3);
    expect(contents).toHaveLength(3);

    expect(headers[0]!.attributes("aria-expanded")).toBe("true");
    expect(headers[1]!.attributes("aria-expanded")).toBe("false");
    expect(headers[2]!.attributes("disabled")).toBeDefined();
    expect(headers[2]!.attributes("data-disabled")).toBeDefined();

    expect(headers[0]!.attributes("aria-controls")).toBe(contents[0]!.attributes("id"));
    expect(contents[0]!.attributes("aria-labelledby")).toBe(headers[0]!.attributes("id"));
    expect(contents[0]!.attributes("role")).toBe("region");
    expect(contents[0]!.find(".mw-accordion__content-inner").exists()).toBe(
      true,
    );

    // 点击第二个面板头，切换到 panel-2
    await headers[1]!.trigger("click");
    await nextTick();
    expect(active.value).toBe("panel-2");
    expect(headers[0]!.attributes("aria-expanded")).toBe("false");
    expect(headers[1]!.attributes("aria-expanded")).toBe("true");

    // 再次点击第二个面板头，单选模式下收起为 null
    await headers[1]!.trigger("click");
    await nextTick();
    expect(active.value).toBeNull();
    expect(headers[1]!.attributes("aria-expanded")).toBe("false");

    // 点击禁用面板头不得展开
    await headers[2]!.trigger("click");
    await nextTick();
    expect(active.value).toBeNull();
    expect(headers[2]!.attributes("aria-expanded")).toBe("false");

    // 键盘方向键导航（跳过禁用项）
    (headers[0]!.element as HTMLElement).focus();
    expect(document.activeElement).toBe(headers[0]!.element);
    await headers[0]!.trigger("keydown", { key: "ArrowDown" });
    expect(document.activeElement).toBe(headers[1]!.element);
    await headers[1]!.trigger("keydown", { key: "ArrowDown" });
    expect(document.activeElement).toBe(headers[0]!.element);
    await headers[0]!.trigger("keydown", { key: "End" });
    expect(document.activeElement).toBe(headers[1]!.element);
    await headers[1]!.trigger("keydown", { key: "Home" });
    expect(document.activeElement).toBe(headers[0]!.element);

    wrapper.unmount();
  });

  it("支持 multiple 多选模式与非受控模式", async () => {
    const active = ref<Array<string | number>>(["a"]);
    const wrapper = mountUiComponent({
      components: { Accordion, AccordionPanel, AccordionHeader, AccordionContent },
      setup() {
        return { active };
      },
      template: `
        <Accordion v-model:value="active" multiple>
          <AccordionPanel value="a">
            <AccordionHeader>A</AccordionHeader>
            <AccordionContent>Content A</AccordionContent>
          </AccordionPanel>
          <AccordionPanel value="b">
            <AccordionHeader>B</AccordionHeader>
            <AccordionContent>Content B</AccordionContent>
          </AccordionPanel>
        </Accordion>
      `,
    });

    await nextTick();
    const headers = wrapper.findAll(".mw-accordion__header");
    expect(headers[0]!.attributes("aria-expanded")).toBe("true");
    expect(headers[1]!.attributes("aria-expanded")).toBe("false");

    await headers[1]!.trigger("click");
    await nextTick();
    expect(active.value).toEqual(["a", "b"]);
    expect(headers[0]!.attributes("aria-expanded")).toBe("true");
    expect(headers[1]!.attributes("aria-expanded")).toBe("true");

    await headers[0]!.trigger("click");
    await nextTick();
    expect(active.value).toEqual(["b"]);
    expect(headers[0]!.attributes("aria-expanded")).toBe("false");
    expect(headers[1]!.attributes("aria-expanded")).toBe("true");
  });
});
