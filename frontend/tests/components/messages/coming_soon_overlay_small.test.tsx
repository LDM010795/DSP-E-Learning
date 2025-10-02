// ComingSoonOverlaySmall.test.tsx
import { render, screen } from "@testing-library/react";
import ComingSoonOverlaySmall from "@components/messages/coming_soon_overlay_small.tsx";
import { IoSettingsOutline } from "react-icons/io5";

describe("ComingSoonOverlaySmall", () => {
  it("renders with default props", () => {
    render(<ComingSoonOverlaySmall />);
    expect(screen.getByText("In Entwicklung")).toBeInTheDocument();
    expect(
      screen.getByText("Wir arbeiten mit Hochdruck an dieser Funktion."),
    ).toBeInTheDocument();
  });

  it("renders custom texts", () => {
    render(
      <ComingSoonOverlaySmall
        bannerText="Custom Banner"
        message="Custom Message"
        subMessage="Custom Sub"
      />,
    );
    expect(screen.getByText("Custom Banner")).toBeInTheDocument();
    expect(screen.getByText("Custom Message")).toBeInTheDocument();
    expect(screen.getByText("Custom Sub")).toBeInTheDocument();
  });

  it("hides banner if bannerText is blank", () => {
    render(<ComingSoonOverlaySmall bannerText="" />);
    expect(screen.queryByText("In Entwicklung")).not.toBeInTheDocument();
  });

  it("uses custom icon when provided", () => {
    render(
      <ComingSoonOverlaySmall
        icon={<IoSettingsOutline data-testid="custom-icon" />}
      />,
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("applies custom classNames", () => {
    render(
      <ComingSoonOverlaySmall
        className="outer-class"
        bannerClassName="banner-class"
        contentClassName="content-class"
      />,
    );
    const container = screen.getByTestId("coming-soon-overlay");
    expect(container).toHaveClass("outer-class");
    expect(screen.getByText("In Entwicklung").parentElement).toHaveClass(
      "banner-class",
    );
    expect(
      screen.getByText("Wir arbeiten mit Hochdruck an dieser Funktion.")
        .parentElement,
    ).toHaveClass("content-class");
  });
});
