'use client';

import { type AnyPlayerStore, selectPlaybackRate } from '@videojs/core/dom';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { usePlayer } from '../../player/context';

export interface PlaybackRatesProps {
  rates: number[];
}

export function PlaybackRates({ rates }: PlaybackRatesProps): ReactNode {
  const store = usePlayer() as AnyPlayerStore;

  useEffect(() => {
    selectPlaybackRate(store.state)?.setRequestedRates(rates);
  }, [store, rates]);

  return null;
}

export namespace PlaybackRates {
  export type Props = PlaybackRatesProps;
}
