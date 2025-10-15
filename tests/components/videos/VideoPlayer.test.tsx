/**
 * VideoPlayer
 *
 * Verifies:
 * - Renders an info box when no videoUrl is provided
 * - Routes YouTube URLs to <YouTubePlayer /> with correct props + events
 * - Routes Wasabi URLs to <WasabiPlayer /> with correct props + events
 * - Shows a fallback for unknown/unsupported URLs and displays the URL
 *
 * Author: DSP development team
 * Date: 2025-09-29
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VideoPlayer from "../../../src/components/videos/VideoPlayer";

// --- mock url utils (must come before importing the component in other setups;
// here it's okay because we import VideoPlayer after these lines) ---
const isYouTubeUrl = vi.fn();
const isWasabiUrl = vi.fn();

vi.mock("../../../src/util/videoUtils", () => ({
  isYouTubeUrl: (url: string) => isYouTubeUrl(url),
  isWasabiUrl: (url: string) => isWasabiUrl(url),
}));

// --- mock child players to simple clickable shells that expose props ---
vi.mock("../../../src/components/videos/YouTubePlayer", () => {
  return {
    default: (props: any) => {
      const {
        videoUrl,
        className,
        onLoadedData,
        onCanPlay,
        onLoadStart,
        onError,
      } = props;
      return (
        <div data-testid="yt-player" data-url={videoUrl} data-class={className}>
          <button onClick={onLoadedData}>yt-ld</button>
          <button onClick={onCanPlay}>yt-cp</button>
          <button onClick={onLoadStart}>yt-ls</button>
          <button onClick={() => onError?.({} as any)}>yt-err</button>
        </div>
      );
    },
  };
});

vi.mock("../../../src/components/videos/WasabiPlayer", () => {
  return {
    default: (props: any) => {
      const {
        dbUrl,
        contentId,
        crossOrigin,
        className,
        onLoadedData,
        onCanPlay,
        onLoadStart,
        onError,
      } = props;
      return (
        <div
          data-testid="wasabi-player"
          data-url={dbUrl}
          data-contentid={contentId}
          data-co={crossOrigin}
          data-class={className}
        >
          <button onClick={onLoadedData}>w-ld</button>
          <button onClick={onCanPlay}>w-cp</button>
          <button onClick={onLoadStart}>w-ls</button>
          <button onClick={() => onError?.({} as any)}>w-err</button>
        </div>
      );
    },
  };
});

describe("VideoPlayer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders info text when videoUrl is empty", () => {
    isYouTubeUrl.mockReturnValue(false);
    isWasabiUrl.mockReturnValue(false);

    render(<VideoPlayer videoUrl="" />);
    expect(screen.getByText(/Keine Video-URL verfügbar/i)).toBeInTheDocument();
  });

  test("routes YouTube URL to <YouTubePlayer> with props and fires handlers", async () => {
    const user = userEvent.setup();
    const url = "https://www.youtube.com/watch?v=abc123";
    isYouTubeUrl.mockReturnValue(true);
    isWasabiUrl.mockReturnValue(false);

    const onLoadedData = vi.fn();
    const onCanPlay = vi.fn();
    const onLoadStart = vi.fn();
    const onError = vi.fn();

    render(
      <VideoPlayer
        videoUrl={url}
        className="vid-class"
        onLoadedData={onLoadedData}
        onCanPlay={onCanPlay}
        onLoadStart={onLoadStart}
        onError={onError}
      />,
    );

    const player = screen.getByTestId("yt-player");
    expect(player).toBeInTheDocument();
    expect(player.getAttribute("data-url")).toBe(url);
    expect(player.getAttribute("data-class")).toBe("vid-class");

    // click through mocked event triggers
    await user.click(screen.getByText("yt-ld"));
    await user.click(screen.getByText("yt-cp"));
    await user.click(screen.getByText("yt-ls"));
    await user.click(screen.getByText("yt-err"));

    expect(onLoadedData).toHaveBeenCalledTimes(1);
    expect(onCanPlay).toHaveBeenCalledTimes(1);
    expect(onLoadStart).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  test("routes Wasabi URL to <WasabiPlayer> with props and fires handlers", async () => {
    const user = userEvent.setup();
    const url = "https://s3.wasabisys.com/bucket/video.mp4";
    isYouTubeUrl.mockReturnValue(false);
    isWasabiUrl.mockReturnValue(true);

    const onLoadedData = vi.fn();
    const onCanPlay = vi.fn();
    const onLoadStart = vi.fn();
    const onError = vi.fn();

    render(
      <VideoPlayer
        videoUrl={url}
        contentId={777}
        className="wasabi-class"
        crossOrigin="anonymous"
        onLoadedData={onLoadedData}
        onCanPlay={onCanPlay}
        onLoadStart={onLoadStart}
        onError={onError}
      />,
    );

    const player = screen.getByTestId("wasabi-player");
    expect(player).toBeInTheDocument();
    expect(player.getAttribute("data-url")).toBe(url);
    expect(player.getAttribute("data-contentid")).toBe("777");
    expect(player.getAttribute("data-co")).toBe("anonymous");
    expect(player.getAttribute("data-class")).toBe("wasabi-class");

    await user.click(screen.getByText("w-ld"));
    await user.click(screen.getByText("w-cp"));
    await user.click(screen.getByText("w-ls"));
    await user.click(screen.getByText("w-err"));

    expect(onLoadedData).toHaveBeenCalledTimes(1);
    expect(onCanPlay).toHaveBeenCalledTimes(1);
    expect(onLoadStart).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  test("renders fallback for unknown URL", () => {
    const url = "https://cdn.example.com/video.unknown";
    isYouTubeUrl.mockReturnValue(false);
    isWasabiUrl.mockReturnValue(false);

    render(<VideoPlayer videoUrl={url} />);
    expect(
      screen.getByText(/Nicht unterstütztes Video-Format/),
    ).toBeInTheDocument();
    // shows the raw URL somewhere in the fallback box
    expect(screen.getByText(url)).toBeInTheDocument();
  });
});
