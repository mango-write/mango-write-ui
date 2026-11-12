import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DatePicker, { DatePicker as NamedDatePicker } from "./DatePicker";

describe("DatePicker", () => {
  it("exports named and default DatePicker with displayName MwDatePicker", () => {
    expect(DatePicker).toBe(NamedDatePicker);
    expect(DatePicker.displayName).toBe("MwDatePicker");
  });

  it("renders formatted value and updates via embedded plain Calendar day click", () => {
    const initial = new Date(2026, 4, 10);
    const onValueChange = vi.fn();
    const onDateSelect = vi.fn();

    const { container } = render(
      <DatePicker
        value={initial}
        dateFormat="yy-mm-dd"
        showIcon
        inputId="test-dp"
        ariaLabel="Publish date"
        onValueChange={onValueChange}
        onDateSelect={onDateSelect}
      />,
    );

    const input = container.querySelector<HTMLInputElement>(
      "input.mw-date-picker__input",
    )!;
    expect(input.getAttribute("id")).toBe("test-dp");
    expect(input.getAttribute("aria-label")).toBe("Publish date");
    expect(input.value).toBe("2026-05-10");

    fireEvent.click(container.querySelector(".mw-date-picker__dropdown")!);

    const panel = document.body.querySelector<HTMLElement>(
      ".mw-date-picker__panel",
    );
    expect(panel).not.toBeNull();
    expect(panel?.querySelector(".mw-calendar--plain")).not.toBeNull();

    const dayBtn = document.body.querySelector<HTMLButtonElement>(
      '[data-date="2026-05-15"]',
    )!;
    expect(dayBtn).not.toBeNull();
    fireEvent.click(dayBtn);

    const selectedDate = onValueChange.mock.calls[0]?.[0] as Date;
    expect(selectedDate).toBeInstanceOf(Date);
    expect(selectedDate.getFullYear()).toBe(2026);
    expect(selectedDate.getMonth()).toBe(4);
    expect(selectedDate.getDate()).toBe(15);
    expect(onDateSelect).toHaveBeenCalledWith(expect.any(Date));
  });

  it("parses direct text input in date, datetime, and time-only modes", () => {
    const onValueChange = vi.fn();
    const { container, rerender } = render(
      <DatePicker value={null} showTime onValueChange={onValueChange} />,
    );

    const input = container.querySelector<HTMLInputElement>(
      "input.mw-date-picker__input",
    )!;
    fireEvent.change(input, { target: { value: "2026-08-21 14:35" } });

    const parsed = onValueChange.mock.calls.at(-1)?.[0] as Date;
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(7);
    expect(parsed.getDate()).toBe(21);
    expect(parsed.getHours()).toBe(14);
    expect(parsed.getMinutes()).toBe(35);

    rerender(
      <DatePicker
        value={new Date(2026, 4, 10, 8, 0, 0, 0)}
        timeOnly
        onValueChange={onValueChange}
      />,
    );
    fireEvent.change(input, { target: { value: "16:45" } });
    const parsedTime = onValueChange.mock.calls.at(-1)?.[0] as Date;
    expect(parsedTime.getHours()).toBe(16);
    expect(parsedTime.getMinutes()).toBe(45);
  });

  it("enforces minDate and maxDate constraints on calendar days", () => {
    const minDate = new Date(2026, 4, 10);
    const maxDate = new Date(2026, 4, 20);
    const onValueChange = vi.fn();

    const { container } = render(
      <DatePicker
        value={new Date(2026, 4, 15)}
        minDate={minDate}
        maxDate={maxDate}
        showIcon
        onValueChange={onValueChange}
      />,
    );

    fireEvent.click(container.querySelector(".mw-date-picker__dropdown")!);

    const beforeMin = document.body.querySelector<HTMLButtonElement>(
      '[data-date="2026-05-09"]',
    )!;
    const inBounds = document.body.querySelector<HTMLButtonElement>(
      '[data-date="2026-05-12"]',
    )!;
    const afterMax = document.body.querySelector<HTMLButtonElement>(
      '[data-date="2026-05-21"]',
    )!;

    expect(beforeMin.disabled).toBe(true);
    expect(inBounds.disabled).toBe(false);
    expect(afterMax.disabled).toBe(true);

    fireEvent.click(beforeMin);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("supports range selection mode and hideOnRangeSelection", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <DatePicker
        value={[new Date(2026, 4, 10), null]}
        selectionMode="range"
        hideOnRangeSelection
        showIcon
        onValueChange={onValueChange}
      />,
    );

    fireEvent.click(container.querySelector(".mw-date-picker__dropdown")!);

    const endBtn = document.body.querySelector<HTMLButtonElement>(
      '[data-date="2026-05-18"]',
    )!;
    fireEvent.click(endBtn);

    const range = onValueChange.mock.calls[0]?.[0] as Array<Date | null>;
    expect(range[0]?.getDate()).toBe(10);
    expect(range[1]?.getDate()).toBe(18);
    expect(document.body.querySelector(".mw-date-picker__panel")).toBeNull();
  });

  it("supports showTime spinners, showClear, showButtonBar, and keeps panel compact when fluid", () => {
    const initial = new Date(2026, 4, 10, 9, 30, 0, 0);
    const onValueChange = vi.fn();
    const onClear = vi.fn();
    const onClearClick = vi.fn();

    const { container } = render(
      <DatePicker
        value={initial}
        showTime
        showClear
        showButtonBar
        showIcon
        fluid
        onValueChange={onValueChange}
        onClear={onClear}
        onClearClick={onClearClick}
      />,
    );

    fireEvent.click(container.querySelector(".mw-date-picker__dropdown")!);

    const panel = document.body.querySelector<HTMLElement>(
      ".mw-date-picker__panel",
    )!;
    expect(panel.style.minWidth).toBe("");

    const incHour = document.body.querySelector<HTMLButtonElement>(
      'button[aria-label="Next Hour"]',
    )!;
    const incMin = document.body.querySelector<HTMLButtonElement>(
      'button[aria-label="Next Minute"]',
    )!;
    fireEvent.click(incHour);
    fireEvent.click(incMin);

    const lastDate = onValueChange.mock.calls.at(-1)?.[0] as Date;
    expect(lastDate.getHours()).toBe(10);
    expect(lastDate.getMinutes()).toBe(31);

    const clearBtn = container.querySelector<HTMLButtonElement>(
      ".mw-date-picker__clear",
    )!;
    fireEvent.click(clearBtn);
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onClearClick).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });
});
