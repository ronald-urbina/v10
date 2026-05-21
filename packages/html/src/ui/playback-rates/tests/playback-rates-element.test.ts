import type { MediaPlaybackRateState } from '@videojs/core';
import type { AnyPlayerStore } from '@videojs/core/dom';
import { DEFAULT_RATES } from '@videojs/core/dom';
import { ContextProvider } from '@videojs/element/context';
import { createStore } from '@videojs/store';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { playerContext } from '../../../player/context';
import { MediaElement } from '../../media-element';
import { PlaybackRatesElement } from '../playback-rates-element';

let tagCounter = 0;

function uniqueTag(base: string): string {
  return `${base}-${tagCounter++}`;
}

function createElement<Element extends HTMLElement>(Base: abstract new () => Element): Element {
  const tag = uniqueTag('test-el');
  customElements.define(tag, class extends (Base as unknown as typeof HTMLElement) {});
  return document.createElement(tag) as Element;
}

function defineElement(tagName: string, Base: CustomElementConstructor): void {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, Base);
  }
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function createPlaybackRateStore({
  setRequestedRates = vi.fn(),
  setSourceRates = vi.fn(),
}: {
  setRequestedRates?: (rates: number[]) => void;
  setSourceRates?: (rates: number[] | null) => void;
} = {}): AnyPlayerStore {
  return createStore<unknown>()<MediaPlaybackRateState>({
    name: 'playbackRate',
    state: () => ({
      playbackRate: 1,
      playbackRates: [...DEFAULT_RATES],
      requestedRates: [...DEFAULT_RATES],
      sourceRates: null,
      ratesLockedBySource: false,
      setPlaybackRate: vi.fn(),
      setRequestedRates,
      setSourceRates,
    }),
  }) as unknown as AnyPlayerStore;
}

class TestPlayerProviderElement extends MediaElement {
  store: AnyPlayerStore = createPlaybackRateStore();
  readonly #provider = new ContextProvider(this, { context: playerContext });

  override connectedCallback(): void {
    this.#provider.setValue(this.store);
    super.connectedCallback();
  }

  setStore(store: AnyPlayerStore): void {
    this.store = store;
    this.#provider.setValue(store);
  }
}

defineElement('test-playback-rates-player', TestPlayerProviderElement);

afterEach(() => {
  document.body.innerHTML = '';
});

describe('PlaybackRatesElement', () => {
  it('has the correct tag name', () => {
    expect(PlaybackRatesElement.tagName).toBe('media-playback-rates');
  });

  it('initializes with DEFAULT_RATES', () => {
    const el = createElement(PlaybackRatesElement);
    expect(el.rates).toEqual([...DEFAULT_RATES]);
  });

  it('is hidden when connected', () => {
    const provider = document.createElement('test-playback-rates-player') as TestPlayerProviderElement;
    const el = createElement(PlaybackRatesElement);
    provider.append(el);
    document.body.append(provider);

    expect(el.style.display).toBe('none');
  });

  it('calls setRequestedRates on connect', async () => {
    const setRequestedRates = vi.fn();
    const store = createPlaybackRateStore({ setRequestedRates });
    const provider = document.createElement('test-playback-rates-player') as TestPlayerProviderElement;
    const el = createElement(PlaybackRatesElement);

    provider.setStore(store);
    provider.append(el);
    document.body.append(provider);

    await nextFrame();

    expect(setRequestedRates).toHaveBeenCalledWith([...DEFAULT_RATES]);
  });

  it('calls setRequestedRates when rates attribute changes', async () => {
    const setRequestedRates = vi.fn();
    const store = createPlaybackRateStore({ setRequestedRates });
    const provider = document.createElement('test-playback-rates-player') as TestPlayerProviderElement;
    const el = createElement(PlaybackRatesElement);

    provider.setStore(store);
    provider.append(el);
    document.body.append(provider);

    await nextFrame();
    setRequestedRates.mockClear();

    el.setAttribute('rates', '0.5 1 1.5 2');
    await nextFrame();

    expect(setRequestedRates).toHaveBeenCalledWith([0.5, 1, 1.5, 2]);
  });

  it('calls setRequestedRates when rates property is set', async () => {
    const setRequestedRates = vi.fn();
    const store = createPlaybackRateStore({ setRequestedRates });
    const provider = document.createElement('test-playback-rates-player') as TestPlayerProviderElement;
    const el = createElement(PlaybackRatesElement);

    provider.setStore(store);
    provider.append(el);
    document.body.append(provider);

    await nextFrame();
    setRequestedRates.mockClear();

    el.rates = [1, 2];
    await nextFrame();

    expect(setRequestedRates).toHaveBeenCalledWith([1, 2]);
  });

  it('calls setRequestedRates with DEFAULT_RATES on disconnect', async () => {
    const setRequestedRates = vi.fn();
    const store = createPlaybackRateStore({ setRequestedRates });
    const provider = document.createElement('test-playback-rates-player') as TestPlayerProviderElement;
    const el = createElement(PlaybackRatesElement);

    provider.setStore(store);
    provider.append(el);
    document.body.append(provider);

    await nextFrame();

    el.setAttribute('rates', '0.5 1 1.5');
    await nextFrame();
    setRequestedRates.mockClear();

    el.remove();

    expect(setRequestedRates).toHaveBeenCalledWith([...DEFAULT_RATES]);
  });

  it('parses a space-separated rates attribute', () => {
    const el = createElement(PlaybackRatesElement);
    el.setAttribute('rates', '0.5 1 1.5 2');

    expect(el.rates).toEqual([0.5, 1, 1.5, 2]);
  });

  it('falls back to DEFAULT_RATES when attribute is removed', () => {
    const el = createElement(PlaybackRatesElement);
    el.setAttribute('rates', '0.5 1');
    el.removeAttribute('rates');

    expect(el.rates).toEqual([...DEFAULT_RATES]);
  });
});
