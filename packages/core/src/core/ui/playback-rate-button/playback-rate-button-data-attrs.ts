import type { StateAttrMap } from '../types';
import type { PlaybackRateButtonState } from './playback-rate-button-core';

export const PlaybackRateButtonDataAttrs = {
  /** Current playback rate. */
  rate: 'data-rate',
  /** Set when a source plugin is constraining the available rates. */
  ratesLockedBySource: 'data-rates-locked',
} as const satisfies StateAttrMap<PlaybackRateButtonState>;
