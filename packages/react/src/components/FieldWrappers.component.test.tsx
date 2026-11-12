import { render } from "@testing-library/react";
import { Search } from "lucide-react";
import { describe, expect, it } from "vitest";
import IconField from "./IconField";
import InputGroup from "./InputGroup";
import InputGroupAddon from "./InputGroupAddon";
import InputIcon from "./InputIcon";

describe("FieldWrappers (IconField, InputIcon, InputGroup, InputGroupAddon)", () => {
  it("renders IconField and InputIcon with className forwarding and icon prop", () => {
    const { container } = render(
      <IconField>
        <InputIcon className="custom-icon-slot">
          <Search />
        </InputIcon>
        <input className="mw-input-text" placeholder="Search" />
      </IconField>,
    );

    const field = container.querySelector(".mw-icon-field");
    expect(field).not.toBeNull();

    const icon = container.querySelector(".mw-input-icon")!;
    expect(icon).not.toBeNull();
    expect(icon.classList.contains("custom-icon-slot")).toBe(true);
    expect(icon.querySelector("svg")).not.toBeNull();

    const { container: c2 } = render(<InputIcon icon={Search} />);
    expect(c2.querySelector(".mw-input-icon svg")).not.toBeNull();
  });

  it("renders InputGroup and InputGroupAddon children", () => {
    const { container } = render(
      <InputGroup>
        <InputGroupAddon>https://</InputGroupAddon>
        <input className="mw-input-text" />
        <InputGroupAddon>.com</InputGroupAddon>
      </InputGroup>,
    );

    const group = container.querySelector(".mw-input-group");
    expect(group).not.toBeNull();

    const addons = container.querySelectorAll(".mw-input-group-addon");
    expect(addons).toHaveLength(2);
    expect(addons[0]!.textContent).toBe("https://");
    expect(addons[1]!.textContent).toBe(".com");
  });
});
