import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Badge from "@/components/ui/Badge";

describe("Badge", () => {
  it("renders children text", () => {
    render(<Badge>Label</Badge>);
    expect(screen.getByText("Label")).toBeInTheDocument();
  });

  it("renders as a <span> element", () => {
    render(<Badge>Span</Badge>);
    expect(screen.getByText("Span").tagName).toBe("SPAN");
  });

  it("applies default variant classes when no variant is given", () => {
    render(<Badge>Default</Badge>);
    const el = screen.getByText("Default");
    expect(el).toHaveClass("bg-gray-100");
    expect(el).toHaveClass("text-gray-800");
  });

  it("applies success variant classes", () => {
    render(<Badge variant="success">Success</Badge>);
    const el = screen.getByText("Success");
    expect(el).toHaveClass("bg-green-100");
    expect(el).toHaveClass("text-green-800");
  });

  it("applies warning variant classes", () => {
    render(<Badge variant="warning">Warning</Badge>);
    const el = screen.getByText("Warning");
    expect(el).toHaveClass("bg-yellow-100");
    expect(el).toHaveClass("text-yellow-800");
  });

  it("applies danger variant classes", () => {
    render(<Badge variant="danger">Danger</Badge>);
    const el = screen.getByText("Danger");
    expect(el).toHaveClass("bg-red-100");
    expect(el).toHaveClass("text-red-800");
  });

  it("applies info variant classes", () => {
    render(<Badge variant="info">Info</Badge>);
    const el = screen.getByText("Info");
    expect(el).toHaveClass("bg-blue-100");
    expect(el).toHaveClass("text-blue-800");
  });

  it("merges additional className prop", () => {
    render(<Badge className="custom-class">Custom</Badge>);
    expect(screen.getByText("Custom")).toHaveClass("custom-class");
  });

  it("forwards HTML attributes to the span", () => {
    render(<Badge data-testid="my-badge">Attr</Badge>);
    expect(screen.getByTestId("my-badge")).toBeInTheDocument();
  });
});
