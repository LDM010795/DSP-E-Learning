/**
 * YouTubePlayer
 *
 * Verifies:
 * - Invalid URL handling (no videoId → error UI)
 * - PrePlayOverlay is shown before start
 * - Clicking start renders an <iframe> with the correct autoplay embed URL
 * - className is passed to the iframe
 * - onLoadedData is forwarded from the iframe load event
 *
 * Author: DSP development team
 * Date: 2025-09-29
 */

import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import YouTubePlayer from '../../../src/components/videos/YouTubePlayer';

// Stub overlays to keep DOM simple & easily clickable/assertable
vi.mock('../../../src/components/videos/PrePlayOverlay', () => ({
    default: ({ onStart }: { onStart: () => void }) => (
        <button data-testid="preplay" onClick={onStart}>start</button>
    ),
}));

vi.mock('../../../src/components/videos/PlaybackOverlay', () => ({
    default: () => <div data-testid="playback" />,
}));

// Stub video utils so we can control parsing/embedding deterministically
const mockExtract = vi.fn<(url: string) => string | null>();
const mockEmbed = vi.fn<(id: string) => string>();

vi.mock('../../../src/util/videoUtils', () => ({
    extractVideoId: (url: string) => mockExtract(url),
    createYouTubeEmbedUrl: (id: string) => mockEmbed(id),
}));

describe('YouTubePlayer', () => {
    beforeEach(() => {
        mockExtract.mockReset();
        mockEmbed.mockReset();
    });

    test('renders invalid URL message when extractVideoId returns null', () => {
        mockExtract.mockReturnValue(null);

        render(<YouTubePlayer videoUrl="https://example.com/not-youtube" />);
        expect(screen.getByText(/Ungültige YouTube URL/i)).toBeInTheDocument();
        expect(screen.getByText('https://example.com/not-youtube')).toBeInTheDocument();
    });

    test('shows PrePlayOverlay before starting', () => {
        mockExtract.mockReturnValue('abc123');
        mockEmbed.mockReturnValue('https://youtube.com/embed/abc123?rel=0');

        render(<YouTubePlayer videoUrl="https://youtube.com/watch?v=abc123" />);

        expect(screen.getByTestId('preplay')).toBeInTheDocument();
        expect(document.querySelector('iframe')).toBeNull();
    });

    test('clicking PrePlayOverlay renders iframe with autoplay and PlaybackOverlay', async () => {
        const user = userEvent.setup();
        mockExtract.mockReturnValue('abc123');
        mockEmbed.mockReturnValue('https://youtube.com/embed/abc123?rel=0');

        render(<YouTubePlayer videoUrl="https://youtube.com/watch?v=abc123" />);

        await user.click(screen.getByTestId('preplay'));

        const iframe = document.querySelector('iframe') as HTMLIFrameElement | null;
        expect(iframe).not.toBeNull();
        expect(iframe!.getAttribute('src')).toBe('https://youtube.com/embed/abc123?rel=0&autoplay=1');
        expect(iframe!.getAttribute('title')).toBe('YouTube video player');
        expect(screen.getByTestId('playback')).toBeInTheDocument();
    });

    test('applies className to the iframe', async () => {
        const user = userEvent.setup();
        mockExtract.mockReturnValue('xyz789');
        mockEmbed.mockReturnValue('https://youtube.com/embed/xyz789?rel=0');

        render(
            <YouTubePlayer
                videoUrl="https://youtube.com/watch?v=xyz789"
                className="rounded-xl shadow"
            />
        );

        await user.click(screen.getByTestId('preplay'));
        const iframe = document.querySelector('iframe') as HTMLIFrameElement | null;
        expect(iframe).not.toBeNull();
        expect(iframe!.className).toContain('rounded-xl');
        expect(iframe!.className).toContain('shadow');
    });

    test('forwards onLoadedData from iframe load event', async () => {
        const user = userEvent.setup();
        const onLoadedData = vi.fn();

        mockExtract.mockReturnValue('vid111');
        mockEmbed.mockReturnValue('https://youtube.com/embed/vid111?rel=0');

        render(
            <YouTubePlayer
                videoUrl="https://youtube.com/watch?v=vid111"
                onLoadedData={onLoadedData}
            />
        );

        await user.click(screen.getByTestId('preplay'));

        const iframe = document.querySelector('iframe') as HTMLIFrameElement | null;
        expect(iframe).not.toBeNull();

        await act(async () => {
            fireEvent.load(iframe!);
        });

        expect(onLoadedData).toHaveBeenCalledTimes(1);
    });
});
