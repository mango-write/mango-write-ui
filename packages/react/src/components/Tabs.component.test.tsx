import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Tabs } from "./Tabs";
import { TabList } from "./TabList";
import { Tab } from "./Tab";
import { TabPanels } from "./TabPanels";
import { TabPanel } from "./TabPanel";
import type { TabValue } from "./tabs-defs";

describe("Tabs", () => {
  it("supports controlled value/onValueChange and outputs tablist / tab / tabpanel ARIA attributes", async () => {
    const user = userEvent.setup();
    const updates: TabValue[] = [];

    function Host() {
      const [active, setActive] = useState<TabValue>("summary");
      return (
        <Tabs
          value={active}
          onValueChange={(v) => {
            updates.push(v);
            setActive(v);
          }}
          data-testid="doc-tabs"
        >
          <TabList aria-label="文档视图">
            <Tab value="summary">摘要</Tab>
            <Tab value="notes">批注</Tab>
            <Tab value="citations" disabled>
              引用
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="summary">
              <p>论文摘要内容</p>
            </TabPanel>
            <TabPanel value="notes">
              <p>3 条批注</p>
            </TabPanel>
            <TabPanel value="citations">
              <p>12 次引用</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      );
    }

    render(<Host />);

    const tablist = screen.getByRole("tablist");
    expect(tablist.classList.contains("mw-tab-list")).toBe(true);
    expect(tablist.getAttribute("aria-label")).toBe("文档视图");

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
    expect(tabs[0]!.getAttribute("aria-selected")).toBe("true");
    expect(tabs[0]!.getAttribute("data-state")).toBe("active");
    expect(tabs[1]!.getAttribute("aria-selected")).toBe("false");
    expect(tabs[2]!.hasAttribute("disabled")).toBe(true);
    expect(tabs[2]!.hasAttribute("data-disabled")).toBe(true);

    const activePanel = screen.getByRole("tabpanel");
    expect(activePanel.textContent).toBe("论文摘要内容");
    expect(tabs[0]!.getAttribute("aria-controls")).toBe(activePanel.getAttribute("id"));
    expect(activePanel.getAttribute("aria-labelledby")).toBe(tabs[0]!.getAttribute("id"));

    await user.click(tabs[1]!);

    expect(updates).toEqual(["notes"]);
    expect(tabs[1]!.getAttribute("aria-selected")).toBe("true");
    expect(tabs[1]!.getAttribute("data-state")).toBe("active");
    expect(screen.getByRole("tabpanel").textContent).toBe("3 条批注");

    await user.click(tabs[2]!);
    expect(tabs[1]!.getAttribute("aria-selected")).toBe("true");
  });

  it("supports uncontrolled defaultValue, numeric TabValue, arrow key navigation, badge, and hideWhenSingle", async () => {
    const user = userEvent.setup();
    const numericUpdates: TabValue[] = [];

    const { container } = render(
      <Tabs defaultValue={0} onValueChange={(v) => numericUpdates.push(v)}>
        <TabList hideWhenSingle>
          <Tab value={0} badge={12}>
            第一项
          </Tab>
          <Tab value={1} badge="5">
            第二项
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel value={0}>面板 0</TabPanel>
          <TabPanel value={1}>面板 1</TabPanel>
        </TabPanels>
      </Tabs>,
    );

    expect(container.querySelector(".mw-tab-list--hide-single")).not.toBeNull();
    const badges = container.querySelectorAll(".mw-tab__badge");
    expect(badges).toHaveLength(2);
    expect(badges[0]?.textContent).toBe("12");

    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]!.getAttribute("data-state")).toBe("active");
    expect(screen.getByRole("tabpanel").textContent).toBe("面板 0");

    tabs[0]!.focus();
    await user.keyboard("{ArrowRight}");
    expect(tabs[1]!.getAttribute("data-state")).toBe("active");
    expect(screen.getByRole("tabpanel").textContent).toBe("面板 1");
    expect(numericUpdates).toEqual([1]);

    // Also verify synthetic fireEvent.click works cleanly
    fireEvent.click(tabs[0]!);
    expect(tabs[0]!.getAttribute("data-state")).toBe("active");
    expect(numericUpdates).toEqual([1, 0]);
  });

  it("keeps inactive panel mounted with hidden attribute when unmountOnHide is false", () => {
    const { container } = render(
      <Tabs defaultValue="a" unmountOnHide={false} orientation="vertical">
        <TabList>
          <Tab value="a">A</Tab>
          <Tab value="b">B</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="a">
            <span data-testid="mounted-a">Content A</span>
          </TabPanel>
          <TabPanel value="b">
            <span data-testid="mounted-b">Content B</span>
          </TabPanel>
        </TabPanels>
      </Tabs>,
    );

    expect(container.querySelector(".mw-tabs--vertical")).not.toBeNull();
    expect(screen.getAllByRole("tab")[0]!.getAttribute("data-orientation")).toBe("vertical");
    expect(screen.getByTestId("mounted-a")).not.toBeNull();
    expect(screen.getByTestId("mounted-b")).not.toBeNull();
    expect(screen.getByRole("tabpanel").textContent).toBe("Content A");
  });
});
