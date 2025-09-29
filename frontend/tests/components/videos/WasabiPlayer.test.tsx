/**
 * WasabiPlayer
 *
 * Verifies:
 * - Loading state (only when fetching and no URL available)
 * - Error state (only when no URL and hooks error)
 * - Pre-play overlay shows before start
 * - Clicking start renders <video>, playback overlay and controls
 * - Forwards video events (loadeddata/canplay/error)
 * - Buffering overlay renders on "waiting" event
 *
 * Author: DSP development team
 * Date: 2025-09-29
 */

import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WasabiPlayer from '../../../src/components/videos/WasabiPlayer';

// --- stub presigned hooks so we can control states ---
const mockById = { data: null as string | null, isFetching: false, error: null as unknown };
const mockByKey = { data: null as string | null, isFetching: false, error: null as unknown };

vi.mock('../../../src/hooks/useVideoPresignedUrl', () => ({
    usePresignedById: () => mockById,
    usePresignedByKey: () => mockByKey,
}));

// --- stub video utils (keep logic simple/ deterministic for tests) ---
vi.mock('../../../src/util/videoUtils', () => ({
    isWasabiUrl: (url: string) => !!url && url.includes('wasabi'),
    toWasabiKey: (url: string) => (url ? url.split('/').pop() ?? null : null),
}));

// --- stub heavy child components ---
vi.mock('../../../src/components/videos/PrePlayOverlay', () => ({
    default: ({ onStart }: { onStart: () => void }) => (
        <button onClick={onStart} data-testid="preplay">start</button>
    ),
}));

vi.mock('../../../src/components/videos/PlaybackOverlay', () => ({
    default: () => <div data-testid="playback" />,
}));

vi.mock('../../../src/components/videos/controls/VideoControls', () => ({
    default: (props: any) => (
        <div data-testid="controls" data-props={JSON.stringify(props)} />
    ),
}));

describe('WasabiPlayer', () => {
    beforeEach(() => {
        mockById.data = null;
        mockById.isFetching = false;
        mockById.error = null;

        mockByKey.data = null;
        mockByKey.isFetching = false;
        mockByKey.error = null;
    });

  test('renders loading state when fetching and no URL', () => {
      // IMPORTANT: no dbUrl; fetching=true; no presigned URL yet
      mockById.isFetching = true;
      render(<WasabiPlayer contentId={123} />);

      expect(screen.getByText(/Video lädt/i)).toBeInTheDocument();
      expect(screen.getByText(/contentId:\s*123/i)).toBeInTheDocument();
  });

  test('renders error state when no URL and error returned', () => {
      // IMPORTANT: no dbUrl; error present; no presigned URL
      mockById.error = new Error('fail byId');
      render(<WasabiPlayer contentId={7} />);

      expect(screen.getByText(/Video-Fehler/i)).toBeInTheDocument();
      expect(screen.getByText(/fail byId/i)).toBeInTheDocument();
  });

  test('shows PrePlayOverlay before starting', () => {
      // With a dbUrl present, player is ready but still shows preplay until user clicks
      render(<WasabiPlayer dbUrl="https://wasabi/foo.mp4" />);
      expect(screen.getByTestId('preplay')).toBeInTheDocument();
  });

  test('clicking PrePlayOverlay starts playback (renders video, controls, overlays)', async () => {
      const user = userEvent.setup();
      render(<WasabiPlayer dbUrl="https://wasabi/foo.mp4" />);

      await user.click(screen.getByTestId('preplay'));

      // video is rendered (no role in JSDOM, so query by tag)
      expect(document.querySelector('video')).not.toBeNull();

      // controls + playback overlay appear
      expect(await screen.findByTestId('controls')).toBeInTheDocument();
      expect(screen.getByTestId('playback')).toBeInTheDocument();
  });

  test('forwards video events to props', async () => {
      const onLoadedData = vi.fn();
      const onCanPlay = vi.fn();
      const onError = vi.fn();

      render(
          <WasabiPlayer
              dbUrl="https://wasabi/test.mp4"
              onLoadedData={onLoadedData}
              onCanPlay={onCanPlay}
              onError={onError}
          />
      );

      // start playback
      await userEvent.click(screen.getByTestId('preplay'));

      const video = document.querySelector('video') as HTMLVideoElement | null;
      expect(video).not.toBeNull();

      // fire events inside act to flush state updates
      await act(async () => {
          video!.dispatchEvent(new Event('loadeddata', { bubbles: true }));
          video!.dispatchEvent(new Event('canplay', { bubbles: true }));
          video!.dispatchEvent(new Event('error', { bubbles: true }));
      });

      expect(onLoadedData).toHaveBeenCalled();
      expect(onCanPlay).toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
  });

  test('renders buffering overlay when isBuffering = true', async () => {
      render(<WasabiPlayer dbUrl="https://wasabi/test.mp4" />);

      // start playback
      await userEvent.click(screen.getByTestId('preplay'));

      const video = document.querySelector('video') as HTMLVideoElement | null;
      expect(video).not.toBeNull();

      // trigger "waiting" to set buffering state
      await act(async () => {
          video!.dispatchEvent(new Event('waiting', { bubbles: true }));
      });

      // spinner div has class 'animate-spin' per component
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });
});
