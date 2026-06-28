// apps/ksulidia/src/components/ui/form/__tests__/FormHint.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FormHint } from "../FormHint";
import { PiQuestionDuotone } from "react-icons/pi";

describe("FormHint", () => {
  it("should render helper text when provided", () => {
    render(<FormHint helperText="This is a hint." />);
    expect(screen.getByText("This is a hint.")).toBeInTheDocument();
  });

  it("should not render helper text when not provided", () => {
    const { container } = render(<FormHint />);
    expect(container.querySelector("span")).toBeNull();
  });

  it("should render tooltip icon when tooltipContent is provided", () => {
    const { container } = render(<FormHint tooltipContent="Tooltip info" />);
    // Check if an element with the PiQuestionDuotone icon's class/structure exists
    // This is a bit brittle, a better way would be a test-id, but for now this works
    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("should render both helper text and tooltip icon", () => {
    render(<FormHint helperText="Hint here." tooltipContent="Tooltip here." />);
    expect(screen.getByText("Hint here.")).toBeInTheDocument();
    const icon = screen.getByRole("img", { hidden: true }); // react-icons might render this way
    expect(icon).toBeInTheDocument();
  });
});
