import { render, screen } from "@testing-library/react";
import ProgressbarMinimal from "@components/charts/progressbar_minimal.tsx";

describe("ProgressbarMinimal", () => {
  it("renders 0% and 100% labels", () => {
    render(<ProgressbarMinimal progressValue={50} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("applies correct width style for given progressValue", () => {
    const { container } = render(<ProgressbarMinimal progressValue={75} />);
    const progressDiv = container.querySelector(".bg-dsp-orange");
    expect(progressDiv).toHaveStyle({ width: "75%" });
  });

  it("renders correctly with edge values", () => {
    const { container: c1 } = render(<ProgressbarMinimal progressValue={0} />);
    expect(c1.querySelector(".bg-dsp-orange")).toHaveStyle({ width: "0%" });

    const { container: c2 } = render(<ProgressbarMinimal progressValue={100} />);
    expect(c2.querySelector(".bg-dsp-orange")).toHaveStyle({ width: "100%" });
  });
});