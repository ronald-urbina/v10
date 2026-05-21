import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createPlayerWrapper } from '../../../testing/mocks';
import { PlaybackRates } from '../playback-rates';

afterEach(cleanup);

function createWrapper(setRequestedRates = vi.fn()) {
  return createPlayerWrapper({
    playbackRate: 1,
    playbackRates: [0.2, 0.5, 0.7, 1, 1.2, 1.5, 1.7, 2],
    requestedRates: [0.2, 0.5, 0.7, 1, 1.2, 1.5, 1.7, 2],
    sourceRates: null,
    ratesLockedBySource: false,
    setPlaybackRate: vi.fn(),
    setRequestedRates,
    setSourceRates: vi.fn(),
  });
}

describe('PlaybackRates', () => {
  it('calls setRequestedRates with provided rates on mount', () => {
    const setRequestedRates = vi.fn();
    const { Wrapper } = createWrapper(setRequestedRates);

    render(<PlaybackRates rates={[0.5, 1, 1.5, 2]} />, { wrapper: Wrapper });

    expect(setRequestedRates).toHaveBeenCalledWith([0.5, 1, 1.5, 2]);
  });

  it('calls setRequestedRates again when rates prop changes', () => {
    const setRequestedRates = vi.fn();
    const { Wrapper } = createWrapper(setRequestedRates);

    const { rerender } = render(<PlaybackRates rates={[0.5, 1, 1.5]} />, { wrapper: Wrapper });

    expect(setRequestedRates).toHaveBeenLastCalledWith([0.5, 1, 1.5]);

    rerender(
      <Wrapper>
        <PlaybackRates rates={[1, 1.5, 2]} />
      </Wrapper>
    );

    expect(setRequestedRates).toHaveBeenLastCalledWith([1, 1.5, 2]);
  });

  it('renders nothing', () => {
    const { Wrapper } = createWrapper();
    const { container } = render(<PlaybackRates rates={[1]} />, { wrapper: Wrapper });

    expect(container.firstChild).toBeNull();
  });
});
