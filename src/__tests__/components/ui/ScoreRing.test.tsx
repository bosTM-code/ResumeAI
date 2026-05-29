import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ScoreRing from "@/components/ui/ScoreRing";

describe("ScoreRing", () => {
  it("displays the score value", () => {
    render(<ScoreRing score={75} />);
    expect(screen.getByText("75")).toBeInTheDocument();
  });

  it("displays the optional label when provided", () => {
    render(<ScoreRing score={80} label="Overall Score" />);
    expect(screen.getByText("Overall Score")).toBeInTheDocument();
  });

  it("does not render a label element when label is omitted", () => {
    render(<ScoreRing score={80} />);
    expect(screen.queryByText("Overall Score")).not.toBeInTheDocument();
  });

  it("renders an SVG element", () => {
    const { container } = render(<ScoreRing score={50} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders two circles: background track and progress arc", () => {
    const { container } = render(<ScoreRing score={60} />);
    const circles = container.querySelectorAll("circle");
    expect(circles).toHaveLength(2);
  });

  it("colors the score text green for score >= 80", () => {
    render(<ScoreRing score={85} />);
    const scoreEl = screen.getByText("85");
    expect(scoreEl).toHaveStyle({ color: "#16a34a" });
  });

  it("colors the score text yellow for score in range 60–79", () => {
    render(<ScoreRing score={65} />);
    const scoreEl = screen.getByText("65");
    expect(scoreEl).toHaveStyle({ color: "#ca8a04" });
  });

  it("colors the score text red for score < 60", () => {
    render(<ScoreRing score={40} />);
    const scoreEl = screen.getByText("40");
    expect(scoreEl).toHaveStyle({ color: "#dc2626" });
  });

  it("renders at the default size of 80px when size is not specified", () => {
    const { container } = render(<ScoreRing score={70} />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("width", "80");
    expect(svg).toHaveAttribute("height", "80");
  });

  it("renders at a custom size when the size prop is provided", () => {
    const { container } = render(<ScoreRing score={70} size={120} />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("width", "120");
    expect(svg).toHaveAttribute("height", "120");
  });

  it("applies the -rotate-90 class so the arc starts at the top", () => {
    const { container } = render(<ScoreRing score={70} />);
    expect(container.querySelector("svg")).toHaveClass("-rotate-90");
  });

  it("colors the progress circle green for score >= 80", () => {
    const { container } = render(<ScoreRing score={90} />);
    const circles = container.querySelectorAll("circle");
    const progressCircle = circles[1];
    expect(progressCircle).toHaveAttribute("stroke", "#16a34a");
  });

  it("colors the progress circle red for score < 60", () => {
    const { container } = render(<ScoreRing score={30} />);
    const circles = container.querySelectorAll("circle");
    const progressCircle = circles[1];
    expect(progressCircle).toHaveAttribute("stroke", "#dc2626");
  });
});
