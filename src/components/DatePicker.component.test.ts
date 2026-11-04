// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { nextTick } from "vue";
import DatePicker from "./DatePicker.vue";

describe("DatePicker", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders formatted modelValue and updates via calendar day click", async () => {
    const initial = new Date(2026, 4, 10); // 2026-05-10
    const wrapper = mount(DatePicker, {
      attachTo: document.body,
      props: {
        modelValue: initial,
        dateFormat: "yy-mm-dd",
        showIcon: true,
        inputId: "test-dp",
        ariaLabel: "Publish date",
      },
    });

    const input = wrapper.find("input.p-datepicker-input");
    expect(input.attributes("id")).toBe("test-dp");
    expect(input.attributes("aria-label")).toBe("Publish date");
    expect((input.element as HTMLInputElement).value).toBe("2026-05-10");

    await wrapper.find(".p-datepicker-dropdown").trigger("click");
    await nextTick();

    const dayBtn = document.body.querySelector<HTMLButtonElement>('[data-date="2026-05-15"]');
    expect(dayBtn).not.toBeNull();
    dayBtn!.click();
    await nextTick();

    const emitted = wrapper.emitted("update:modelValue");
    expect(emitted).toBeTruthy();
    const selectedDate = emitted![0]![0] as Date;
    expect(selectedDate).toBeInstanceOf(Date);
    expect(selectedDate.getFullYear()).toBe(2026);
    expect(selectedDate.getMonth()).toBe(4);
    expect(selectedDate.getDate()).toBe(15);
    expect(wrapper.emitted("date-select")?.[0]?.[0]).toBeInstanceOf(Date);

    wrapper.unmount();
  });

  it("parses direct text input in YYYY-MM-DD and YYYY-MM-DD HH:mm formats", async () => {
    const wrapper = mount(DatePicker, {
      attachTo: document.body,
      props: {
        modelValue: null,
        showTime: true,
      },
    });

    const input = wrapper.find("input.p-datepicker-input");
    await input.setValue("2026-08-21 14:35");
    await nextTick();

    const emitted = wrapper.emitted("update:modelValue");
    expect(emitted).toBeTruthy();
    const parsed = emitted![emitted!.length - 1]![0] as Date;
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(7);
    expect(parsed.getDate()).toBe(21);
    expect(parsed.getHours()).toBe(14);
    expect(parsed.getMinutes()).toBe(35);

    wrapper.unmount();
  });

  it("enforces minDate and maxDate constraints on calendar days", async () => {
    const minDate = new Date(2026, 4, 10);
    const maxDate = new Date(2026, 4, 20);
    const wrapper = mount(DatePicker, {
      attachTo: document.body,
      props: {
        modelValue: new Date(2026, 4, 15),
        minDate,
        maxDate,
        showIcon: true,
      },
    });

    await wrapper.find(".p-datepicker-dropdown").trigger("click");
    await nextTick();

    const beforeMin = document.body.querySelector<HTMLButtonElement>('[data-date="2026-05-09"]');
    const inBounds = document.body.querySelector<HTMLButtonElement>('[data-date="2026-05-12"]');
    const afterMax = document.body.querySelector<HTMLButtonElement>('[data-date="2026-05-21"]');

    expect(beforeMin?.disabled).toBe(true);
    expect(inBounds?.disabled).toBe(false);
    expect(afterMax?.disabled).toBe(true);

    beforeMin?.click();
    await nextTick();
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();

    wrapper.unmount();
  });

  it("supports range selection mode and hideOnRangeSelection", async () => {
    const wrapper = mount(DatePicker, {
      attachTo: document.body,
      props: {
        modelValue: [new Date(2026, 4, 10), null],
        selectionMode: "range",
        hideOnRangeSelection: true,
        showIcon: true,
      },
    });

    await wrapper.find(".p-datepicker-dropdown").trigger("click");
    await nextTick();

    const endBtn = document.body.querySelector<HTMLButtonElement>('[data-date="2026-05-18"]');
    expect(endBtn).not.toBeNull();
    endBtn!.click();
    await nextTick();

    const emitted = wrapper.emitted("update:modelValue");
    expect(emitted).toBeTruthy();
    const range = emitted![0]![0] as Array<Date | null>;
    expect(range[0]?.getDate()).toBe(10);
    expect(range[1]?.getDate()).toBe(18);
    expect(document.body.querySelector(".p-datepicker-panel")).toBeNull();

    wrapper.unmount();
  });

  it("supports showTime and timeOnly spinners and showClear / showButtonBar", async () => {
    const initial = new Date(2026, 4, 10, 9, 30, 0, 0);
    const wrapper = mount(DatePicker, {
      attachTo: document.body,
      props: {
        modelValue: initial,
        showTime: true,
        showClear: true,
        showButtonBar: true,
        showIcon: true,
      },
    });

    await wrapper.find(".p-datepicker-dropdown").trigger("click");
    await nextTick();

    const incHour = document.body.querySelector<HTMLButtonElement>(
      ".p-datepicker-hour-picker .p-datepicker-increment-button",
    );
    const incMin = document.body.querySelector<HTMLButtonElement>(
      ".p-datepicker-minute-picker .p-datepicker-increment-button",
    );
    expect(incHour).not.toBeNull();
    expect(incMin).not.toBeNull();

    incHour!.click();
    await nextTick();
    incMin!.click();
    await nextTick();

    const emitted = wrapper.emitted("update:modelValue")!;
    const lastDate = emitted[emitted.length - 1]![0] as Date;
    expect(lastDate.getHours()).toBe(10);
    expect(lastDate.getMinutes()).toBe(31);

    const clearBtn = wrapper.find(".p-datepicker-clear-icon");
    expect(clearBtn.exists()).toBe(true);
    await clearBtn.trigger("click");

    expect(wrapper.emitted("clear")).toBeTruthy();
    expect(wrapper.emitted("clear-click")).toBeTruthy();
    expect(wrapper.emitted("update:modelValue")!.slice(-1)[0]).toEqual([null]);

    wrapper.unmount();
  });
});
