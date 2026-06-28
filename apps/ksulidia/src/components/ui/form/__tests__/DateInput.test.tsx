// apps/ksulidia/src/components/ui/form/__tests__/DateInput.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DateInput } from "../DateInput";
import dayjs from "dayjs";

describe("DateInput", () => {
  it("should render the label and default to today's date", () => {
    render(<DateInput name="test-date" label="Test Date" />);
    expect(screen.getByLabelText("Test Date")).toBeInTheDocument();

    const todayFormatted = dayjs().format("MM/DD/YYYY"); // react-datepicker default format
    expect(screen.getByDisplayValue(todayFormatted)).toBeInTheDocument();
  });

  it("should open datepicker on click", () => {
    render(<DateInput name="test-date" label="Test Date" />);
    const input = screen.getByLabelText("Test Date");
    fireEvent.click(input);

    // Check if the datepicker calendar is visible
    expect(screen.getByRole("dialog")).toBeInTheDocument(); // react-datepicker renders in a dialog
  });

  it("should call onChange with the new date when a date is selected", () => {
    const handleChange = vi.fn();
    render(
      <DateInput name="test-date" label="Test Date" onChange={handleChange} />
    );

    fireEvent.click(screen.getByLabelText("Test Date"));

    const nextDay = dayjs().add(1, "day");
    const dayToSelect = screen.getByText(nextDay.date().toString());

    fireEvent.click(dayToSelect);

    expect(handleChange).toHaveBeenCalled();
    // Check if the date passed to onChange is correct (ignoring time part)
    expect(dayjs(handleChange.mock.calls[0][0]).isSame(nextDay, "day")).toBe(
      true
    );
  });

  it("should display helper text and a tooltip icon", () => {
    render(
      <DateInput
        name="test-date"
        label="Test Date"
        helperText="My helper text"
        tooltipContent="My tooltip"
      />
    );

    expect(screen.getByText("My helper text")).toBeInTheDocument();
    // Assuming the FormHint component renders an SVG for the icon
    const icon = screen.getByRole("img", { hidden: true });
    expect(icon).toBeInTheDocument();
  });
});
