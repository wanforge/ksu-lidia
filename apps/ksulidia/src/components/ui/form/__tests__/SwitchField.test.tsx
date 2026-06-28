// apps/ksulidia/src/components/ui/form/__tests__/SwitchField.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SwitchField } from "../SwitchField";

describe("SwitchField", () => {
  it("should render label and description", () => {
    render(
      <SwitchField
        name="newsletter"
        label="Subscribe to newsletter"
        description="Receive updates on new products"
      />
    );

    expect(screen.getByText("Subscribe to newsletter")).toBeInTheDocument();
    expect(
      screen.getByText("Receive updates on new products")
    ).toBeInTheDocument();
  });

  it("should toggle when clicking anywhere on the label container", () => {
    const handleChange = vi.fn();
    render(
      <SwitchField
        name="newsletter"
        label="Subscribe to newsletter"
        onChange={handleChange}
      />
    );

    const labelContainer = screen
      .getByText("Subscribe to newsletter")
      .closest("label");
    expect(labelContainer).not.toBeNull();

    fireEvent.click(labelContainer!);
    expect(handleChange).toHaveBeenCalled();
  });

  it('should be accessible with role="switch"', () => {
    render(<SwitchField name="status" label="Active Status" />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });
});
