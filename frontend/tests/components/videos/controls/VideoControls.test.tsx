/**
 * VideoControls.test.tsx
 *
 * Tests for the VideoControls component:
 * - Play/pause button behavior
 * - Progress bar seeking
 * - Volume mute/unmute and slider changes
 * - Settings menu with playback rates
 * - Fullscreen toggle
 *
 * Author: DSP development team
 * Date: 2025-09-29
 */

import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VideoControls from "../../../../src/components/videos/controls/VideoControls";

describe("VideoControls", () => {
  const baseProps = {
    isPlaying: false,
    onTogglePlay: vi.fn(),
    currentTime: 0,
    duration: 100,
    onSeek: vi.fn(),
    buffered: 50,
    volume: 0.5,
    onVolumeChange: vi.fn(),
    isMuted: false,
    onToggleMute: vi.fn(),
    playbackRate: 1,
    onChangePlaybackRate: vi.fn(),
    onToggleFullscreen: vi.fn(),
    className: "",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders play button when not playing, pause button when playing", () => {
    const { rerender } = render(
      <VideoControls {...baseProps} isPlaying={false} />,
    );
    expect(screen.getByLabelText("Play")).toBeInTheDocument();

    rerender(<VideoControls {...baseProps} isPlaying={true} />);
    expect(screen.getByLabelText("Pause")).toBeInTheDocument();
  });

  test("clicking play/pause button calls onTogglePlay", async () => {
    const user = userEvent.setup();
    render(<VideoControls {...baseProps} isPlaying={false} />);

    await user.click(screen.getByLabelText("Play"));
    expect(baseProps.onTogglePlay).toHaveBeenCalledTimes(1);
  });

  test("clicking progress bar calls onSeek with ratio * duration", () => {
    render(<VideoControls {...baseProps} duration={100} currentTime={0} />);
    const [progressSlider] = screen.getAllByRole("slider"); // first = progress bar

    vi.spyOn(progressSlider, "getBoundingClientRect").mockReturnValue({
      left: 0,
      width: 200,
      right: 200,
      top: 0,
      bottom: 0,
      height: 10,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    fireEvent.click(progressSlider, { clientX: 100 }); // middle
    expect(baseProps.onSeek).toHaveBeenCalledWith(50); // 100px/200px = 0.5 * 100
  });

  test("mute button toggles, range changes call onVolumeChange", () => {
    render(<VideoControls {...baseProps} volume={0.5} isMuted={false} />);
    const muteButton = screen.getByLabelText("Mute");
    fireEvent.click(muteButton);
    expect(baseProps.onToggleMute).toHaveBeenCalledTimes(1);

    const [, volumeSlider] = screen.getAllByRole("slider"); // second = volume range
    fireEvent.change(volumeSlider, { target: { value: "0.8" } });
    expect(baseProps.onVolumeChange).toHaveBeenCalledWith(0.8);
  });

  test("opens settings and selects playback rate", async () => {
    const user = userEvent.setup();
    render(<VideoControls {...baseProps} />);

    const settingsButton = screen.getByLabelText("Einstellungen");
    await user.click(settingsButton);

    const rateBtn = screen.getByText("1.5x");
    await user.click(rateBtn);

    expect(baseProps.onChangePlaybackRate).toHaveBeenCalledWith(1.5);
  });

  test("fullscreen button calls onToggleFullscreen", async () => {
    const user = userEvent.setup();
    render(<VideoControls {...baseProps} />);

    const fullscreenButton = screen.getByLabelText("Vollbild");
    await user.click(fullscreenButton);
    expect(baseProps.onToggleFullscreen).toHaveBeenCalledTimes(1);
  });

  test("displays formatted time correctly", () => {
    render(<VideoControls {...baseProps} currentTime={65} duration={125} />);

    expect(screen.getByText("1:05 / 2:05")).toBeInTheDocument();
  });
});
