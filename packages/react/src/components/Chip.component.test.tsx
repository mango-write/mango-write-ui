import { fireEvent, render } from "@testing-library/react";
import { Tag as TagIcon } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import Chip from "./Chip";

describe("Chip", () => {
  it("renders label, icon, or image", () => {
    const { container } = render(<Chip label="Biology" icon={TagIcon} />);

    expect(container.querySelector(".mw-chip")).not.toBeNull();
    expect(container.querySelector(".mw-chip__label")?.textContent).toBe("Biology");
    expect(container.querySelector("svg.mw-chip__icon")).not.toBeNull();
    expect(container.querySelector(".mw-chip__remove")).toBeNull();

    const imgView = render(<Chip label="User" image="/avatar.png" />);
    expect(imgView.container.querySelector("img.mw-chip__image")?.getAttribute("src")).toBe(
      "/avatar.png",
    );
  });

  it("calls onRemove and hides when removable icon is clicked or triggered via keyboard", () => {
    const onRemove = vi.fn();
    const { container } = render(
      <Chip label="Filter" removable onRemove={onRemove} />,
    );

    const removeBtn = container.querySelector(".mw-chip__remove")!;
    expect(removeBtn).not.toBeNull();

    fireEvent.click(removeBtn);
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(container.querySelector(".mw-chip")).toBeNull();

    const onKeyRemove = vi.fn();
    const keyView = render(<Chip label="Tag2" removable onRemove={onKeyRemove} />);
    fireEvent.keyDown(keyView.container.querySelector(".mw-chip__remove")!, {
      key: "Backspace",
    });
    expect(onKeyRemove).toHaveBeenCalledTimes(1);
    expect(keyView.container.querySelector(".mw-chip")).toBeNull();
  });

  it("supports children and custom removeIcon render prop", () => {
    const { container } = render(
      <Chip
        removable
        removeIcon={({ removeCallback }) => (
          <button type="button" className="custom-remove" onClick={removeCallback}>
            x
          </button>
        )}
      >
        <span className="custom-chip-body">Custom Body</span>
      </Chip>,
    );

    expect(container.querySelector(".custom-chip-body")?.textContent).toBe("Custom Body");
    fireEvent.click(container.querySelector(".custom-remove")!);
    expect(container.querySelector(".mw-chip")).toBeNull();
  });
});
