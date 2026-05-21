import { type AnyPlayerStore, DEFAULT_RATES, selectPlaybackRate } from '@videojs/core/dom';
import type { PropertyValues } from '@videojs/element';

import { playerContext } from '../../player/context';
import { PlayerController } from '../../player/player-controller';
import { MediaElement } from '../media-element';

export class PlaybackRatesElement extends MediaElement {
  static readonly tagName = 'media-playback-rates';

  static override get observedAttributes(): string[] {
    return [...MediaElement.observedAttributes, 'rates'];
  }

  #rates: number[] = [...DEFAULT_RATES];

  get rates(): number[] {
    return this.#rates;
  }

  set rates(value: number[]) {
    const old = this.#rates;
    this.#rates = value;
    this.requestUpdate('rates', old);
  }

  // No selector — avoids StoreController which throws when store is gone.
  // selectPlaybackRate is applied manually in #setRates().
  readonly #player = new PlayerController(this, playerContext);

  override connectedCallback(): void {
    super.connectedCallback();
    this.style.display = 'none';
    this.#setRates(this.#rates);
  }

  override disconnectedCallback(): void {
    this.#setRates([...DEFAULT_RATES]);
    super.disconnectedCallback();
  }

  override attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (name === 'rates') {
      this.#rates = parseRates(newValue);
      this.requestUpdate('rates', oldValue);
    }
  }

  protected override update(changed: PropertyValues): void {
    super.update(changed);
    if (this.isConnected) {
      this.#setRates(this.#rates);
    }
  }

  #setRates(rates: number[]): void {
    const store = this.#player.value as AnyPlayerStore | undefined;
    if (!store) return;
    selectPlaybackRate(store.state)?.setRequestedRates(rates);
  }
}

function parseRates(value: string | null): number[] {
  if (!value) return [...DEFAULT_RATES];
  return value.split(' ').map(Number);
}
