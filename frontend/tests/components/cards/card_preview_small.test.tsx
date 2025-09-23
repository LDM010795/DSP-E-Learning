import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CardPreviewSmall from '../../../src/components/cards/card_preview_small.tsx';

describe('CardPreviewSmall', () => {
  test('renders title + description', () => {
    render(
      <CardPreviewSmall title="Intro to DSP" description="Short teaser" progress={0} />
    );
    expect(screen.getByText('Intro to DSP')).toBeInTheDocument();
    expect(screen.getByText('Short teaser')).toBeInTheDocument();
  });

  test('uses YouTube thumbnail when youtubeId is provided', () => {
    render(<CardPreviewSmall title="Video" youtubeId="abc123" progress={0} />);
    const img = screen.getByAltText('Video') as HTMLImageElement;
    expect(img.src).toContain('https://img.youtube.com/vi/abc123/hqdefault.jpg');
  });

  test('shows correct status text based on progress', () => {
    const { rerender } = render(<CardPreviewSmall title="X" progress={0} />);
    expect(screen.getByText('Nicht begonnen')).toBeInTheDocument();

    rerender(<CardPreviewSmall title="X" progress={40} />);
    expect(screen.getByText('In Bearbeitung')).toBeInTheDocument();

    rerender(<CardPreviewSmall title="X" progress={100} />);
    expect(screen.getByText('Abgeschlossen')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  test('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<CardPreviewSmall title="Clickable" onClick={fn} />);
    await user.click(screen.getByText('Clickable'));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
