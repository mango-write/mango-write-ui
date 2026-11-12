import { useState } from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Accordion } from "./Accordion";
import { AccordionPanel } from "./AccordionPanel";
import { AccordionHeader } from "./AccordionHeader";
import { AccordionContent } from "./AccordionContent";
import type { AccordionPanelValue } from "./accordion-defs";

describe("Accordion", () => {
  it("supports single mode controlled value/onValueChange, disabled panel, keyboard navigation, and ARIA attributes", async () => {
    const user = userEvent.setup();
    let latestValue: AccordionPanelValue | null = "panel-1";

    function Host() {
      const [active, setActive] = useState<AccordionPanelValue | null>("panel-1");
      return (
        <Accordion
          value={active}
          onValueChange={(val) => {
            const next = Array.isArray(val) ? (val[0] ?? null) : val;
            latestValue = next;
            setActive(next);
          }}
          data-testid="acc-root"
        >
          <AccordionPanel value="panel-1">
            <AccordionHeader>面板一</AccordionHeader>
            <AccordionContent>内容一</AccordionContent>
          </AccordionPanel>
          <AccordionPanel value="panel-2">
            <AccordionHeader>面板二</AccordionHeader>
            <AccordionContent>内容二</AccordionContent>
          </AccordionPanel>
          <AccordionPanel value="panel-3" disabled>
            <AccordionHeader>面板三（禁用）</AccordionHeader>
            <AccordionContent>内容三</AccordionContent>
          </AccordionPanel>
        </Accordion>
      );
    }

    const { container, unmount } = render(<Host />);

    const headers = container.querySelectorAll<HTMLButtonElement>(".mw-accordion__header");
    const contents = container.querySelectorAll<HTMLElement>(".mw-accordion__content");
    expect(headers).toHaveLength(3);
    expect(contents).toHaveLength(3);

    expect(headers[0]!.getAttribute("aria-expanded")).toBe("true");
    expect(headers[1]!.getAttribute("aria-expanded")).toBe("false");
    expect(headers[2]!.hasAttribute("disabled")).toBe(true);
    expect(headers[2]!.hasAttribute("data-disabled")).toBe(true);

    expect(headers[0]!.getAttribute("aria-controls")).toBe(contents[0]!.getAttribute("id"));
    expect(contents[0]!.getAttribute("aria-labelledby")).toBe(headers[0]!.getAttribute("id"));
    expect(contents[0]!.getAttribute("role")).toBe("region");
    expect(contents[0]!.querySelector(".mw-accordion__content-inner")).not.toBeNull();

    // Click second header -> switches to panel-2
    await user.click(headers[1]!);
    expect(latestValue).toBe("panel-2");
    expect(headers[0]!.getAttribute("aria-expanded")).toBe("false");
    expect(headers[1]!.getAttribute("aria-expanded")).toBe("true");

    // Click second header again -> collapses to null in single mode
    await user.click(headers[1]!);
    expect(latestValue).toBeNull();
    expect(headers[1]!.getAttribute("aria-expanded")).toBe("false");

    // Click disabled third header -> does not open
    await user.click(headers[2]!);
    expect(latestValue).toBeNull();
    expect(headers[2]!.getAttribute("aria-expanded")).toBe("false");

    // Keyboard navigation skips disabled header
    headers[0]!.focus();
    expect(document.activeElement).toBe(headers[0]);
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(headers[1]);
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(headers[0]);
    await user.keyboard("{End}");
    expect(document.activeElement).toBe(headers[1]);
    await user.keyboard("{Home}");
    expect(document.activeElement).toBe(headers[0]);

    unmount();
  });

  it("supports multiple mode and uncontrolled defaultValue", async () => {
    const user = userEvent.setup();
    let latestList: AccordionPanelValue[] = ["a"];

    function Host() {
      const [active, setActive] = useState<AccordionPanelValue[]>(["a"]);
      return (
        <Accordion
          value={active}
          multiple
          onValueChange={(val) => {
            const next = Array.isArray(val) ? val : val != null ? [val] : [];
            latestList = next;
            setActive(next);
          }}
        >
          <AccordionPanel value="a">
            <AccordionHeader>A</AccordionHeader>
            <AccordionContent>Content A</AccordionContent>
          </AccordionPanel>
          <AccordionPanel value="b">
            <AccordionHeader>B</AccordionHeader>
            <AccordionContent>Content B</AccordionContent>
          </AccordionPanel>
        </Accordion>
      );
    }

    const { container } = render(<Host />);
    const headers = container.querySelectorAll<HTMLButtonElement>(".mw-accordion__header");
    expect(headers[0]!.getAttribute("aria-expanded")).toBe("true");
    expect(headers[1]!.getAttribute("aria-expanded")).toBe("false");

    await user.click(headers[1]!);
    expect(latestList).toEqual(["a", "b"]);
    expect(headers[0]!.getAttribute("aria-expanded")).toBe("true");
    expect(headers[1]!.getAttribute("aria-expanded")).toBe("true");

    await user.click(headers[0]!);
    expect(latestList).toEqual(["b"]);
    expect(headers[0]!.getAttribute("aria-expanded")).toBe("false");
    expect(headers[1]!.getAttribute("aria-expanded")).toBe("true");
  });
});
