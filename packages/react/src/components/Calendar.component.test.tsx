import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Calendar, { Calendar as NamedCalendar } from "./Calendar";

function toIsoKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

describe("Calendar", () => {
  it("exports named and default Calendar with displayName MwCalendar", () => {
    expect(Calendar).toBe(NamedCalendar);
    expect(Calendar.displayName).toBe("MwCalendar");
  });

  it("renders month days and updates value / selected on day click, including plain variant", () => {
    const initial = new Date(2026, 4, 10);
    const onValueChange = vi.fn();
    const onSelect = vi.fn();
    const onSelectedChange = vi.fn();

    const { container } = render(
      <Calendar
        value={initial}
        variant="plain"
        ariaLabel="Research calendar"
        onValueChange={onValueChange}
        onSelect={onSelect}
        onSelectedChange={onSelectedChange}
      />,
    );

    const root = container.querySelector<HTMLElement>(".mw-calendar")!;
    expect(root.classList.contains("mw-calendar--plain")).toBe(true);
    expect(root.getAttribute("aria-label")).toBe("Research calendar");

    const selectedBtn = container.querySelector<HTMLButtonElement>(
      '[data-date="2026-05-10"]',
    )!;
    expect(selectedBtn).not.toBeNull();
    expect(selectedBtn.getAttribute("aria-selected")).toBe("true");

    const nextDayBtn = container.querySelector<HTMLButtonElement>(
      '[data-date="2026-05-15"]',
    )!;
    fireEvent.click(nextDayBtn);

    expect(onSelect).toHaveBeenCalledWith("2026-05-15");
    expect(onSelectedChange).toHaveBeenCalledWith("2026-05-15");
    const updatedModel = onValueChange.mock.calls[0]?.[0] as Date;
    expect(updatedModel).toBeInstanceOf(Date);
    expect(updatedModel.getFullYear()).toBe(2026);
    expect(updatedModel.getMonth()).toBe(4);
    expect(updatedModel.getDate()).toBe(15);
  });

  it("supports days/counts activity heat levels and onlySelectableWithDays filter mode", () => {
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
    const onSelect = vi.fn();

    const { container, rerender } = render(
      <Calendar
        counts={{
          [toIsoKey(today)]: 2,
          [toIsoKey(other)]: 1,
        }}
        selected={null}
        onlySelectableWithDays
        onSelect={onSelect}
      />,
    );

    const todayBtn = container.querySelector<HTMLButtonElement>(
      `[data-date="${toIsoKey(today)}"]`,
    )!;
    const otherBtn = container.querySelector<HTMLButtonElement>(
      `[data-date="${toIsoKey(other)}"]`,
    )!;
    const emptyBtn = container.querySelector<HTMLButtonElement>(
      `[data-date="${toIsoKey(emptyDay)}"]`,
    )!;

    expect(todayBtn.getAttribute("data-heat")).toBe("2");
    expect(otherBtn.getAttribute("data-heat")).toBe("1");
    expect(emptyBtn.getAttribute("data-heat")).toBeNull();
    expect(emptyBtn.disabled).toBe(true);

    fireEvent.click(emptyBtn);
    expect(onSelect).not.toHaveBeenCalled();

    fireEvent.click(todayBtn);
    expect(onSelect).toHaveBeenCalledWith(toIsoKey(today));

    rerender(
      <Calendar
        days={{
          [toIsoKey(today)]: 2,
          [toIsoKey(other)]: 1,
        }}
        selected={toIsoKey(today)}
        onlySelectableWithDays
      />,
    );
    expect(
      container
        .querySelector(`[data-date="${toIsoKey(today)}"]`)
        ?.classList.contains("mw-calendar__day--selected"),
    ).toBe(true);
  });

  it("navigates months, emits view range, provides back-to-today shortcut, and jumps via year-month switcher", () => {
    const onView = vi.fn();
    const { container } = render(
      <Calendar days={{}} selected={null} onView={onView} />,
    );

    expect(container.querySelector(".mw-calendar__today-shortcut")).toBeNull();

    fireEvent.click(
      container.querySelector<HTMLButtonElement>('button[aria-label="上个月"]')!,
    );
    expect(onView).toHaveBeenCalledTimes(1);

    const todayShortcut = container.querySelector<HTMLButtonElement>(
      ".mw-calendar__today-shortcut",
    )!;
    expect(todayShortcut).not.toBeNull();
    expect(todayShortcut.textContent).toBe("回到今天");

    fireEvent.click(todayShortcut);
    expect(onView).toHaveBeenCalledTimes(2);
    expect(container.querySelector(".mw-calendar__today-shortcut")).toBeNull();

    const switcherBtn = container.querySelector<HTMLButtonElement>(
      ".mw-calendar__switcher-btn",
    )!;
    expect(switcherBtn.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(switcherBtn);
    expect(switcherBtn.getAttribute("aria-expanded")).toBe("true");
    expect(container.querySelector(".mw-calendar__switcher")).not.toBeNull();

    fireEvent.click(
      container.querySelector<HTMLButtonElement>('button[aria-label="上一年"]')!,
    );
    const monthOptions = container.querySelectorAll<HTMLButtonElement>(
      ".mw-calendar__month-option",
    );
    expect(monthOptions).toHaveLength(12);
    fireEvent.click(monthOptions[2]!);

    expect(container.querySelector(".mw-calendar__switcher")).toBeNull();
    const lastView = onView.mock.calls.at(-1)?.[0];
    expect(lastView?.month).toBe(3);
  });

  it("supports firstDayOfWeek and range / multiple selection modes", () => {
    const onValueChange = vi.fn();
    const { container, rerender } = render(
      <Calendar
        value={[new Date(2026, 4, 10), new Date(2026, 4, 14)]}
        selectionMode="range"
        firstDayOfWeek={0}
        onValueChange={onValueChange}
      />,
    );

    const weekdays = Array.from(
      container.querySelectorAll(".mw-calendar__weekday"),
    ).map((w) => w.textContent);
    expect(weekdays[0]).toBe("日");

    rerender(
      <Calendar
        value={[new Date(2026, 4, 10), new Date(2026, 4, 14)]}
        selectionMode="range"
        firstDayOfWeek={1}
        onValueChange={onValueChange}
      />,
    );
    const mondayFirst = Array.from(
      container.querySelectorAll(".mw-calendar__weekday"),
    ).map((w) => w.textContent);
    expect(mondayFirst[0]).toBe("一");

    expect(
      container
        .querySelector('[data-date="2026-05-12"]')
        ?.classList.contains("mw-calendar__day--in-range"),
    ).toBe(true);

    rerender(
      <Calendar
        value={[new Date(2026, 4, 10)]}
        selectionMode="multiple"
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(container.querySelector('[data-date="2026-05-16"]')!);
    const multiOut = onValueChange.mock.calls.at(-1)?.[0] as Date[];
    expect(multiOut).toHaveLength(2);
  });
});
