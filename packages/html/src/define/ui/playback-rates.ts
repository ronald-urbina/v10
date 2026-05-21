import { PlaybackRatesElement } from '../../ui/playback-rates/playback-rates-element';
import { safeDefine } from '../safe-define';

safeDefine(PlaybackRatesElement);

declare global {
  interface HTMLElementTagNameMap {
    [PlaybackRatesElement.tagName]: PlaybackRatesElement;
  }
}
