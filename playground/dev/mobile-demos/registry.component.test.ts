import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { MpThemeProvider } from "@mango-write/ui-mp";
import { docGroups } from "../registry-data";
import { mobileApi } from "./api";
import { mobilePreviews } from "./registry";
import { MP_DEVICE_PRESETS, mpSim, selectMpDevice, setMpOrientation, toggleMpOrientation } from "./state";

describe("mobile playground registry", () => {
  it("gives every registered route one real preview and API document", () => {
    const slugs = docGroups.filter((group) => group.section === "mobile").flatMap((group) => group.entries.map((entry) => entry.slug));
    expect(slugs).toHaveLength(11);
    expect([...slugs].sort()).toEqual(Object.keys(mobilePreviews).sort());
    expect([...slugs].sort()).toEqual(Object.keys(mobileApi).sort());
  });

  it("defaults to iPhone 18 Pro (402x874) 1:1 rendering and switches across Pro Max, Android 21:9, Pura X, and iPhone Duo with portrait/landscape rotation", () => {
    setMpOrientation("portrait");
    selectMpDevice("iphone-18-pro");
    expect(mpSim.deviceId).toBe("iphone-18-pro");
    expect(mpSim.width).toBe(402);
    expect(mpSim.height).toBe(874);
    expect(mpSim.scaleMode).toBe("1:1");
    expect(MP_DEVICE_PRESETS.map((item) => [item.id, item.width, item.height, item.formFactor, item.cutout])).toEqual([
      ["iphone-18-pro", 402, 874, "bar", "island"],
      ["iphone-18-pro-max", 440, 956, "bar", "island"],
      ["android-21-9", 414, 966, "bar", "punch"],
      ["huawei-pura-x", 440, 706, "wide-fold", "punch"],
      ["iphone-duo", 688, 874, "book-fold", "none"],
    ]);

    selectMpDevice("huawei-pura-x");
    expect(mpSim.width).toBe(440);
    expect(mpSim.height).toBe(706);

    toggleMpOrientation();
    expect(mpSim.orientation).toBe("landscape");
    expect(mpSim.width).toBe(706);
    expect(mpSim.height).toBe(440);

    selectMpDevice("iphone-duo");
    expect(mpSim.width).toBe(874);
    expect(mpSim.height).toBe(688);

    toggleMpOrientation();
    expect(mpSim.orientation).toBe("portrait");
    expect(mpSim.width).toBe(688);
    expect(mpSim.height).toBe(874);

    selectMpDevice("iphone-18-pro");
    expect(mpSim.width).toBe(402);
    expect(mpSim.height).toBe(874);
  });

  it("applies viewport mode and orientation classes on MpThemeProvider for Pura X and iPhone Duo across portrait and landscape", async () => {
    const wrapper = mount(MpThemeProvider, {
      props: {
        viewportWidth: 402,
        viewportHeight: 874,
      },
    });
    expect(wrapper.attributes("data-viewport-mode")).toBe("compact");
    expect(wrapper.attributes("data-orientation")).toBe("portrait");
    expect(wrapper.classes()).not.toContain("mw-mp-root--wide-short");
    expect(wrapper.classes()).not.toContain("mw-mp-root--expanded");
    expect(wrapper.classes()).not.toContain("mw-mp-root--landscape");

    await wrapper.setProps({ viewportWidth: 440, viewportHeight: 706 });
    expect(wrapper.attributes("data-viewport-mode")).toBe("wide-short");
    expect(wrapper.attributes("data-orientation")).toBe("portrait");
    expect(wrapper.classes()).toContain("mw-mp-root--wide-short");

    await wrapper.setProps({ viewportWidth: 706, viewportHeight: 440 });
    expect(wrapper.attributes("data-viewport-mode")).toBe("expanded");
    expect(wrapper.attributes("data-orientation")).toBe("landscape");
    expect(wrapper.classes()).toContain("mw-mp-root--expanded");
    expect(wrapper.classes()).toContain("mw-mp-root--wide-short");
    expect(wrapper.classes()).toContain("mw-mp-root--landscape");

    await wrapper.setProps({ viewportWidth: 688, viewportHeight: 874 });
    expect(wrapper.attributes("data-viewport-mode")).toBe("expanded");
    expect(wrapper.attributes("data-orientation")).toBe("portrait");
    expect(wrapper.classes()).toContain("mw-mp-root--expanded");
    expect(wrapper.classes()).not.toContain("mw-mp-root--wide-short");
    expect(wrapper.classes()).not.toContain("mw-mp-root--landscape");

    await wrapper.setProps({ viewportWidth: 874, viewportHeight: 688 });
    expect(wrapper.attributes("data-viewport-mode")).toBe("expanded");
    expect(wrapper.attributes("data-orientation")).toBe("landscape");
    expect(wrapper.classes()).toContain("mw-mp-root--expanded");
    expect(wrapper.classes()).toContain("mw-mp-root--wide-short");
    expect(wrapper.classes()).toContain("mw-mp-root--landscape");
  });
});
