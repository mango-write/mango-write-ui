import { describe, expect, it } from "vitest";
import { mountUiComponent } from "../test-utils/mount.js";
import IconField from "./IconField.vue";
import InputGroup from "./InputGroup.vue";
import InputGroupAddon from "./InputGroupAddon.vue";
import InputIcon from "./InputIcon.vue";

describe("FieldWrappers (IconField, InputIcon, InputGroup, InputGroupAddon)", () => {
  it("renders IconField and InputIcon with class forwarding", () => {
    const wrapper = mountUiComponent({
      components: { IconField, InputIcon },
      template: `
        <IconField>
          <InputIcon class="pi pi-search">S</InputIcon>
          <input class="p-inputtext" placeholder="Search" />
        </IconField>
      `,
    });

    const field = wrapper.find(".mw-icon-field.p-iconfield");
    expect(field.exists()).toBe(true);

    const icon = wrapper.find(".mw-input-icon.p-inputicon");
    expect(icon.exists()).toBe(true);
    expect(icon.classes()).toContain("pi");
    expect(icon.classes()).toContain("pi-search");
    expect(icon.text()).toBe("S");
  });

  it("renders InputGroup and InputGroupAddon slots", () => {
    const wrapper = mountUiComponent({
      components: { InputGroup, InputGroupAddon },
      template: `
        <InputGroup>
          <InputGroupAddon>https://</InputGroupAddon>
          <input class="p-inputtext" />
          <InputGroupAddon>.com</InputGroupAddon>
        </InputGroup>
      `,
    });

    const group = wrapper.find(".mw-input-group.p-inputgroup");
    expect(group.exists()).toBe(true);

    const addons = wrapper.findAll(".mw-input-group-addon.p-inputgroupaddon");
    expect(addons).toHaveLength(2);
    expect(addons[0]!.text()).toBe("https://");
    expect(addons[1]!.text()).toBe(".com");
  });
});
