import { describe, expect, it } from "vitest";
import { acquireOverlaySlot, releaseOverlaySlot } from "./overlay-slot.js";

describe("overlay-slot 槽位分配", () => {
  it("活跃期间单调递增，全关后归零复位", () => {
    const a = acquireOverlaySlot();
    const b = acquireOverlaySlot();
    expect(b).toBe(a + 1);

    releaseOverlaySlot(b);
    const c = acquireOverlaySlot();
    expect(c).toBe(b + 1);

    releaseOverlaySlot(a);
    releaseOverlaySlot(c);
    const fresh = acquireOverlaySlot();
    expect(fresh).toBe(1);
    releaseOverlaySlot(fresh);
  });

  it("重复释放与未知槽位不污染计数", () => {
    const a = acquireOverlaySlot();
    releaseOverlaySlot(a);
    releaseOverlaySlot(a);
    releaseOverlaySlot(999);
    expect(acquireOverlaySlot()).toBe(1);
    releaseOverlaySlot(1);
  });
});
