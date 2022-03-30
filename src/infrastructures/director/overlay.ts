import { IBounds } from '@core/entities/screen';

import CaptureOverlay from '@ui/widgets/overlays';

export default class CaptureOverlayWrap {
  private widget?: CaptureOverlay;

  constructor() {
    this.widget = new CaptureOverlay();
  }

  show(screenBounds: IBounds) {
    setImmediate(() => {
      // WORKAROUND: https://github.com/electron/electron/issues/10862
      this.widget?.setBounds(screenBounds);
      this.widget?.setBounds(screenBounds);
      this.widget?.setBounds(screenBounds);
      this.widget?.setBounds(screenBounds);
    });

    this.widget?.setIgnoreMouseEvents(false);
    this.widget?.show();
  }

  hide() {
    // should wait for react component rerender
    setTimeout(() => {
      this.widget?.hide();
    }, 500);
  }

  close() {
    this.widget?.close();
  }

  ignoreMouseEvents() {
    this.widget?.setIgnoreMouseEvents(true);
  }

  blur() {
    this.widget?.blur();
  }
}
