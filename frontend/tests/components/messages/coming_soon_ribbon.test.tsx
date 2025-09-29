import { render, screen } from "@testing-library/react";
import ComingSoonRibbon from "@components/messages/coming_soon_ribbon.tsx";

describe("ComingSoonRibbon", () => {
  it("renders with default props", () => {
    render(<ComingSoonRibbon />);
    const ribbon = screen.getByText("Work in Progress");
    expect(ribbon).toBeInTheDocument();
    expect(ribbon).toHaveStyle({ color: "rgb(255, 255, 255)" });
    expect(ribbon.parentElement).toHaveStyle({
      backgroundColor: "#3b5998",
    });
  });

  it("renders with custom text and colors", () => {
    render(
      <ComingSoonRibbon
        text="Coming Soon"
        color="black"
        backgroundColor="#123456"
      />,
    );
    const ribbon = screen.getByText("Coming Soon");
    expect(ribbon).toHaveStyle({ zIndex: "2" });
    expect(ribbon.parentElement).toHaveStyle({ color: "rgb(0, 0, 0)" });
    expect(ribbon.parentElement).toHaveStyle({ backgroundColor: "#123456" });
  });

  it("applies top-right position styles by default", () => {
    render(<ComingSoonRibbon />);
    const container = screen.getByText("Work in Progress").parentElement;
    expect(container).toHaveStyle({
      right: "-50px",
      top: "25px",
      transform: "rotate(45deg)",
    });
  });

  it("applies top-left position styles when specified", () => {
    render(<ComingSoonRibbon position="top-left" />);
    const container = screen.getByText("Work in Progress").parentElement;
    expect(container).toHaveStyle({
      left: "-50px",
      top: "25px",
      transform: "rotate(-45deg)",
    });
  });
});
