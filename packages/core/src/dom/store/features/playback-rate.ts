import { listen } from '@videojs/utils/dom';

import type { MediaPlaybackRateState } from '../../../core/media/state';
import { definePlayerFeature } from '../../feature';
import { isMediaPlaybackRateCapable } from '../../media/predicate';

export const DEFAULT_RATES: readonly number[] = [0.2, 0.5, 0.7, 1, 1.2, 1.5, 1.7, 2];

function sanitizeRates(rates: number[]): number[] {
  const seen = new Set<number>();
  const result: number[] = [];
  for (const r of rates) {
    if (Number.isFinite(r) && r > 0 && !seen.has(r)) {
      seen.add(r);
      result.push(r);
    }
  }
  return result.length ? result : [...DEFAULT_RATES];
}

function arraysEqual(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function computeEffectiveRates(requested: number[], source: number[] | null): readonly number[] {
  if (!source) return requested;
  const intersection = requested.filter((r) => source.includes(r));
  return intersection.length ? intersection : source;
}

export const playbackRateFeature = definePlayerFeature({
  name: 'playbackRate',
  state: ({ target, set }): MediaPlaybackRateState => {
    let requestedRates: number[] = [...DEFAULT_RATES];
    let sourceRates: number[] | null = null;

    return {
      playbackRate: 1,
      playbackRates: [...DEFAULT_RATES],
      requestedRates: [...DEFAULT_RATES],
      sourceRates: null,
      ratesLockedBySource: false,

      setPlaybackRate(rate: number) {
        const { media } = target();
        if (isMediaPlaybackRateCapable(media)) media.playbackRate = rate;
      },

      setRequestedRates(rates: number[]) {
        const sanitized = sanitizeRates(rates);
        if (arraysEqual(requestedRates, sanitized)) return;
        requestedRates = sanitized;
        set({
          requestedRates,
          playbackRates: computeEffectiveRates(requestedRates, sourceRates),
          ratesLockedBySource: sourceRates !== null,
        });
      },

      setSourceRates(rates: number[] | null) {
        if (sourceRates === rates || (sourceRates !== null && rates !== null && arraysEqual(sourceRates, rates)))
          return;
        sourceRates = rates;
        set({
          sourceRates: rates,
          playbackRates: computeEffectiveRates(requestedRates, sourceRates),
          ratesLockedBySource: rates !== null,
        });
      },
    };
  },

  attach({ target, signal, set }) {
    const { media } = target;

    if (!isMediaPlaybackRateCapable(media)) return;

    const sync = () => set({ playbackRate: media.playbackRate });
    sync();

    listen(media, 'ratechange', sync, { signal });
  },
});
