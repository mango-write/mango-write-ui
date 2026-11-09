import { describe, expect, it } from "vitest";
import { Tag } from "lucide-vue-next";
import { mountUiComponent } from "../test-utils/mount.js";
import Chip from "./Chip.vue";

describe("Chip", () => {
  it("renders label, icon, or image", () => {
    const wrapper = mountUiComponent(Chip, {
      props: { label: "Biology", icon: Tag },
    });

    expect(wrapper.find(".mw-chip").exists()).toBe(true);
    expect(wrapper.find(".mw-chip__label").text()).toBe("Biology");
    expect(wrapper.find("svg.mw-chip__icon").exists()).toBe(true);
    expect(wrapper.find(".mw-chip__remove").exists()).toBe(false);
  });

  it("emits remove when removable icon is clicked", async () => {
    const wrapper = mountUiComponent(Chip, {
      props: { label: "Filter", removable: true },
    });

    const removeBtn = wrapper.find(".mw-chip__remove");
    expect(removeBtn.exists()).toBe(true);

    await removeBtn.trigger("click");
    expect(wrapper.emitted("remove")).toHaveLength(1);
    expect(wrapper.find(".mw-chip").exists()).toBe(false);
  });

  it("supports #default and #removeicon slots", async () => {
    const wrapper = mountUiComponent({
      components: { Chip },
      template: `
        <Chip removable>
          <span class="custom-chip-body">Custom Body</span>
          <template #removeicon="{ removeCallback }">
            <button type="button" class="custom-remove" @click="removeCallback">x</button>
          </template>
        </Chip>
      `,
    });

    expect(wrapper.find(".custom-chip-body").text()).toBe("Custom Body");
    await wrapper.find(".custom-remove").trigger("click");
    expect(wrapper.find(".mw-chip").exists()).toBe(false);
  });
});
