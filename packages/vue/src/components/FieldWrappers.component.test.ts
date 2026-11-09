import { describe, expect, it } from "vitest";
import { Search } from "lucide-vue-next";
import { mountUiComponent } from "../test-utils/mount.js";
import IconField from "./IconField.vue";
import InputGroup from "./InputGroup.vue";
import InputGroupAddon from "./InputGroupAddon.vue";
import InputIcon from "./InputIcon.vue";

describe("FieldWrappers (IconField, InputIcon, InputGroup, InputGroupAddon)", () => {
  it("renders IconField and InputIcon with class forwarding", () => {
    const wrapper = mountUiComponent({
      components: { IconField, InputIcon, Search },
      template: `
        <IconField>
          <InputIcon class="custom-icon-slot"><Search /></InputIcon>
          <input class="mw-input-text" placeholder="Search" />
        </IconField>
      `,
    });

    const field = wrapper.find(".mw-icon-field");
    expect(field.exists()).toBe(true);

    const icon = wrapper.find(".mw-input-icon");
    expect(icon.exists()).toBe(true);
    expect(icon.classes()).toContain("custom-icon-slot");
    expect(icon.find("svg").exists()).toBe(true);
  });

  it("renders InputGroup and InputGroupAddon slots", () => {
    const wrapper = mountUiComponent({
      components: { InputGroup, InputGroupAddon },
      template: `
        <InputGroup>
          <InputGroupAddon>https://</InputGroupAddon>
          <input class="mw-input-text" />
          <InputGroupAddon>.com</InputGroupAddon>
        </InputGroup>
      `,
    });

    const group = wrapper.find(".mw-input-group");
    expect(group.exists()).toBe(true);

    const addons = wrapper.findAll(".mw-input-group-addon");
    expect(addons).toHaveLength(2);
    expect(addons[0]!.text()).toBe("https://");
    expect(addons[1]!.text()).toBe(".com");
  });
});
