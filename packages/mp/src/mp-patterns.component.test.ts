import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import MpComposer from "./components/MpComposer.vue";
import MpFormField from "./components/MpFormField.vue";
import MpInput from "./components/MpInput.vue";
import MpMessage from "./components/MpMessage.vue";
import MpNotice from "./components/MpNotice.vue";

describe("@mango-write/ui-mp patterns", () => {
  it("connects labels, hints, and errors to the real input", () => {
    const wrapper = mount({
      components: { MpFormField, MpInput },
      template: `<MpFormField input-id="title" label="标题" hint="帮助" error="必填" required><template #default="{ inputId, describedBy, invalid, required }"><MpInput :input-id="inputId" :aria-describedby="describedBy" :invalid="invalid" :required="required" /></template></MpFormField>`,
    });
    const input = wrapper.find("input");
    expect(wrapper.find("label").attributes("for")).toBe("title");
    expect(input.attributes("aria-invalid")).toBe("true");
    expect(input.attributes("required")).toBeDefined();
    const ids = input.attributes("aria-describedby")?.split(" ") ?? [];
    expect(ids).toHaveLength(2);
    for (const id of ids) expect(wrapper.find(`#${id}`).exists()).toBe(true);
  });

  it("submits non-empty composer values in both standalone and inline rail modes", async () => {
    const composer = mount(MpComposer, { props: { modelValue: "", contained: true } });
    expect(composer.find('[data-testid="mp-composer-submit"]').attributes("disabled")).toBeDefined();
    await composer.setProps({ modelValue: "总结实验结论" });
    await composer.find("input").trigger("keydown", { key: "Enter" });
    expect(composer.emitted("submit")?.[0]).toEqual(["总结实验结论"]);

    const inlineComposer = mount(MpComposer, { props: { modelValue: "生成大纲", inline: true } });
    expect(inlineComposer.classes()).toContain("mw-mp-composer--inline");
    expect(inlineComposer.classes()).toContain("mw-frost");
    await inlineComposer.find('[data-testid="mp-composer-submit"]').trigger("click");
    expect(inlineComposer.emitted("submit")?.[0]).toEqual(["生成大纲"]);
  });

  it("distinguishes inline notices and user/assistant message geometry", () => {
    const notice = mount(MpNotice, { props: { title: "来源已保留", severity: "success" } });
    expect(notice.classes()).toContain("mw-mp-notice--success");
    const warnNotice = mount(MpNotice, { props: { title: "注意", severity: "warn" } });
    expect(warnNotice.classes()).toContain("mw-mp-notice--warning");
    const user = mount(MpMessage, { props: { from: "user", text: "问题" } });
    const assistant = mount(MpMessage, { props: { from: "assistant", text: "回答" } });
    expect(user.classes()).toContain("mw-mp-message--user");
    expect(assistant.classes()).toContain("mw-mp-message--assistant");
  });
});
