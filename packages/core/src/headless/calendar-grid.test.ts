import { describe, expect, it } from "vitest";
import {
  buildCalendarWeeks,
  getWeekdayLabels,
  isSameCalendarDay,
  parseDateValue,
  toIsoDateKey,
} from "./calendar-grid.js";

describe("calendar-grid", () => {
  it("builds 6x7 weeks and marks selected, range, today, and activity heat", () => {
    const today = new Date(2026, 10, 9);
    const weeks = buildCalendarWeeks({
      year: 2026,
      month: 10,
      today,
      firstDayOfWeek: 1,
      selectionMode: "range",
      modelValue: ["2026-11-08", "2026-11-11"],
      days: {
        "2026-11-09": 1,
        "2026-11-10": 3,
      },
    });

    expect(weeks).toHaveLength(6);
    expect(weeks[0]).toHaveLength(7);

    const flat = weeks.flat();
    const nov9 = flat.find((c) => c.isoDate === "2026-11-09");
    const nov10 = flat.find((c) => c.isoDate === "2026-11-10");
    const nov8 = flat.find((c) => c.isoDate === "2026-11-08");

    expect(nov8?.selected).toBe(true);
    expect(nov9?.today).toBe(true);
    expect(nov9?.inRange).toBe(true);
    expect(nov9?.heat).toBe(1);
    expect(nov10?.heat).toBe(2);
  });

  it("rotates weekday labels according to firstDayOfWeek", () => {
    expect(getWeekdayLabels("zh-CN", 1)).toEqual(["一", "二", "三", "四", "五", "六", "日"]);
    expect(getWeekdayLabels("en-US", 0)).toEqual(["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]);
  });

  it("parses valid ISO dates and rejects invalid calendar dates", () => {
    const d = parseDateValue("2026-02-28", 9, 30);
    expect(d).not.toBeNull();
    expect(toIsoDateKey(d!)).toBe("2026-02-28");
    expect(parseDateValue("2026-02-30")).toBeNull();
    expect(isSameCalendarDay(d, new Date(2026, 1, 28, 22, 0))).toBe(true);
  });
});
