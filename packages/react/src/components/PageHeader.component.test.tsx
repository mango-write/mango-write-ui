import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("renders title in h1", () => {
    render(<PageHeader title="问卷" />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("问卷");
  });

  it("renders icon and actions slots conditionally", () => {
    const { container, rerender } = render(<PageHeader title="手记" />);
    expect(container.querySelector(".mw-page-header__icon")).toBeNull();
    expect(container.querySelector(".mw-page-header__actions")).toBeNull();

    rerender(
      <PageHeader
        title="手记"
        icon={<i className="demo-icon" />}
        actions={
          <button type="button" className="demo-action">
            新建
          </button>
        }
      />,
    );
    expect(container.querySelector(".mw-page-header__icon .demo-icon")).not.toBeNull();
    expect(container.querySelector(".mw-page-header__actions .demo-action")).not.toBeNull();
  });
});
