import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { nextTick } from "vue";
import Calendar from "./Calendar.vue";

function toIsoKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

describe("Calendar", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders month days and updates modelValue / selected on day click", async () => {
    const initial = new Date(2026, 4, 10); // 2026-05-10
    const wrapper = mount(Calendar, {
      props: {
        modelValue: initial,
        ariaLabel: "Research calendar",
      },
    });

    expect(wrapper.attributes("aria-label")).toBe("Research calendar");
    const selectedBtn = wrapper.find<HTMLButtonElement>('[data-date="2026-05-10"]');
    expect(selectedBtn.exists()).toBe(true);
    expect(selectedBtn.attributes("aria-selected")).toBe("true");

    const nextDayBtn = wrapper.find<HTMLButtonElement>('[data-date="2026-05-15"]');
    await nextDayBtn.trigger("click");

    expect(wrapper.emitted("select")?.[0]).toEqual(["2026-05-15"]);
    expect(wrapper.emitted("update:selected")?.[0]).toEqual(["2026-05-15"]);
    const updatedModel = wrapper.emitted("update:modelValue")?.[0]?.[0] as Date;
    expect(updatedModel).toBeInstanceOf(Date);
    expect(updatedModel.getFullYear()).toBe(2026);
    expect(updatedModel.getMonth()).toBe(4);
    expect(updatedModel.getDate()).toBe(15);
  });

  it("supports days activity heat levels and onlySelectableWithDays filter mode", async () => {
    const today = new Date();
    const other = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() === 1 ? 2 : today.getDate() - 1,
    );
    const emptyDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() <= 2 ? 3 : today.getDate() - 2,
    );

    const wrapper = mount(Calendar, {
      props: {
        days: {
          [toIsoKey(today)]: 2,
          [toIsoKey(other)]: 1,
        },
        selected: null,
        onlySelectableWithDays: true,
      },
    });

    const todayBtn = wrapper.find<HTMLButtonElement>(`[data-date="${toIsoKey(today)}"]`);
    const otherBtn = wrapper.find<HTMLButtonElement>(`[data-date="${toIsoKey(other)}"]`);
    const emptyBtn = wrapper.find<HTMLButtonElement>(`[data-date="${toIsoKey(emptyDay)}"]`);

    expect(todayBtn.attributes("data-heat")).toBe("2");
    expect(otherBtn.attributes("data-heat")).toBe("1");
    expect(emptyBtn.attributes("data-heat")).toBeUndefined();
    expect(emptyBtn.element.disabled).toBe(true);

    await emptyBtn.trigger("click");
    expect(wrapper.emitted("select")).toBeUndefined();

    await todayBtn.trigger("click");
    expect(wrapper.emitted("select")?.[0]).toEqual([toIsoKey(today)]);

    await wrapper.setProps({ selected: toIsoKey(today) });
    expect(todayBtn.classes()).toContain("mw-calendar__day--selected");
  });

  it("navigates months, emits view range, and provides back-to-today shortcut", async () => {
    const wrapper = mount(Calendar, {
      props: {
        days: {},
        selected: null,
      },
    });

    expect(wrapper.find(".mw-calendar__today-shortcut").exists()).toBe(false);

    await wrapper.find('button[aria-label="上个月"]').trigger("click");
    expect(wrapper.emitted("view")).toHaveLength(1);
    const range = wrapper.emitted("view")![0]![0] as {
      from: string;
      until: string;
      year: number;
      month: number;
    };
    const now = new Date();
    const expectedPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    expect(new Date(range.from).getMonth()).toBe(expectedPrev.getMonth());

    const todayShortcut = wrapper.find(".mw-calendar__today-shortcut");
    expect(todayShortcut.exists()).toBe(true);
    expect(todayShortcut.text()).toBe("回到今天");

    await todayShortcut.trigger("click");
    expect(wrapper.emitted("view")).toHaveLength(2);
    expect(wrapper.find(".mw-calendar__today-shortcut").exists()).toBe(false);
  });

  it("opens the year-month quick switcher and jumps to a chosen year/month", async () => {
    const wrapper = mount(Calendar, {
      props: {
        modelValue: new Date(2026, 4, 10),
      },
    });

    const switcherBtn = wrapper.find(".mw-calendar__switcher-btn");
    expect(switcherBtn.attributes("aria-expanded")).toBe("false");

    await switcherBtn.trigger("click");
    await nextTick();
    expect(switcherBtn.attributes("aria-expanded")).toBe("true");
    expect(wrapper.find(".mw-calendar__switcher").exists()).toBe(true);

    await wrapper.find('button[aria-label="上一年"]').trigger("click");
    const monthOptions = wrapper.findAll(".mw-calendar__month-option");
    expect(monthOptions).toHaveLength(12);

    // Pick March (index 2) of 2025
    await monthOptions[2]!.trigger("click");
    await nextTick();

    expect(wrapper.find(".mw-calendar__switcher").exists()).toBe(false);
    const viewPayload = wrapper.emitted("view")?.at(-1)?.[0] as {
      year: number;
      month: number;
    };
    expect(viewPayload.year).toBe(2025);
    expect(viewPayload.month).toBe(3);
    expect(wrapper.find('[data-date="2025-03-15"]').exists()).toBe(true);
  });

  it("supports firstDayOfWeek configuration and range/multiple selection modes", async () => {
    const wrapper = mount(Calendar, {
      props: {
        modelValue: [new Date(2026, 4, 10), new Date(2026, 4, 14)],
        selectionMode: "range",
        firstDayOfWeek: 0,
      },
    });

    const weekdays = wrapper.findAll(".mw-calendar__weekday").map((w) => w.text());
    expect(weekdays[0]).toBe("日");

    await wrapper.setProps({ firstDayOfWeek: 1 });
    const mondayFirst = wrapper.findAll(".mw-calendar__weekday").map((w) => w.text());
    expect(mondayFirst[0]).toBe("一");

    const inRangeDay = wrapper.find('[data-date="2026-05-12"]');
    expect(inRangeDay.classes()).toContain("mw-calendar__day--in-range");
  });
});
