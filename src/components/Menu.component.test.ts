import { describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { Settings, User } from "lucide-vue-next";
import { mountUiComponent } from "../test-utils/mount.js";
import Menu from "./Menu.vue";
import type { MenuItem } from "./menu";

describe("Menu", () => {
  it("renders inline menu items, submenus, and separators", () => {
    const commandSpy = vi.fn();
    const model: MenuItem[] = [
      { label: "Profile", icon: User, command: commandSpy },
      { separator: true },
      {
        label: "Workspace",
        items: [
          { label: "Settings", icon: Settings },
          { label: "Disabled Item", disabled: true },
          { label: "Hidden Item", visible: false },
        ],
      },
    ];

    const wrapper = mountUiComponent(Menu, {
      props: { model, ariaLabel: "Main menu" },
    });

    const root = wrapper.find(".mw-menu");
    expect(root.exists()).toBe(true);
    const list = wrapper.find(".mw-menu__list");
    expect(list.attributes("aria-label")).toBe("Main menu");

    const links = wrapper.findAll(".mw-menu__item-link");
    expect(links).toHaveLength(3);
    expect(links[0]!.text()).toContain("Profile");
    expect(links[1]!.text()).toContain("Settings");
    expect(links[2]!.text()).toContain("Disabled Item");
    expect(links[2]!.attributes("aria-disabled")).toBe("true");

    expect(wrapper.find(".mw-menu__separator").exists()).toBe(true);
    expect(wrapper.find(".mw-menu__submenu-label").text()).toBe("Workspace");
  });

  it("invokes item command on click and respects disabled items", async () => {
    const activeCommand = vi.fn();
    const disabledCommand = vi.fn();
    const model: MenuItem[] = [
      { label: "Run", command: activeCommand },
      { label: "Locked", disabled: () => true, command: disabledCommand },
    ];

    const wrapper = mountUiComponent(Menu, {
      props: { model },
    });

    const links = wrapper.findAll(".mw-menu__item-link");
    await links[0]!.trigger("click");
    expect(activeCommand).toHaveBeenCalledTimes(1);
    expect(activeCommand.mock.calls[0]?.[0]?.item.label).toBe("Run");

    await links[1]!.trigger("click");
    expect(disabledCommand).not.toHaveBeenCalled();
  });

  it("supports #start, #end, #submenulabel, and #item slots with action binding", async () => {
    const commandSpy = vi.fn();
    const model: MenuItem[] = [
      {
        label: "Group",
        items: [{ label: "Custom Action", badge: "PRO", command: commandSpy }],
      },
    ];

    const wrapper = mountUiComponent({
      components: { Menu },
      setup() {
        return { model };
      },
      template: `
        <Menu :model="model">
          <template #start><div class="slot-start">Header</div></template>
          <template #submenulabel="{ item }">
            <span class="slot-submenu">{{ item.label }}!</span>
          </template>
          <template #item="{ item, label, props: itemProps }">
            <a v-bind="itemProps.action" class="slot-item-link">
              <span>{{ label }}</span>
              <em class="slot-badge">{{ item.badge }}</em>
            </a>
          </template>
          <template #end><div class="slot-end">Footer</div></template>
        </Menu>
      `,
    });

    expect(wrapper.find(".slot-start").text()).toBe("Header");
    expect(wrapper.find(".slot-end").text()).toBe("Footer");
    expect(wrapper.find(".slot-submenu").text()).toBe("Group!");
    expect(wrapper.find(".slot-badge").text()).toBe("PRO");

    await wrapper.find(".slot-item-link").trigger("click");
    expect(commandSpy).toHaveBeenCalledTimes(1);
  });

  it("toggles, shows, and hides popup menu and closes on item click or Escape", async () => {
    const commandSpy = vi.fn();
    const model: MenuItem[] = [{ label: "Delete", command: commandSpy }];

    const wrapper = mountUiComponent(Menu, {
      props: { model, popup: true, appendTo: "self" },
      attachTo: document.body,
    });

    expect(wrapper.find(".mw-menu--popup").exists()).toBe(false);

    const anchor = document.createElement("button");
    document.body.appendChild(anchor);
    const clickEvent = new MouseEvent("click", { bubbles: true });
    Object.defineProperty(clickEvent, "currentTarget", { value: anchor });

    const vm = wrapper.vm as unknown as {
      toggle: (event: Event) => void;
      show: (event: Event) => void;
      hide: () => void;
    };

    vm.toggle(clickEvent);
    await nextTick();
    expect(wrapper.find(".mw-menu--popup").exists()).toBe(true);

    await wrapper.find(".mw-menu__item-link").trigger("click");
    await nextTick();
    expect(commandSpy).toHaveBeenCalledTimes(1);
    expect(wrapper.find(".mw-menu--popup").exists()).toBe(false);

    vm.show(clickEvent);
    await nextTick();
    expect(wrapper.find(".mw-menu--popup").exists()).toBe(true);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await nextTick();
    expect(wrapper.find(".mw-menu--popup").exists()).toBe(false);

    anchor.remove();
    wrapper.unmount();
  });
});
