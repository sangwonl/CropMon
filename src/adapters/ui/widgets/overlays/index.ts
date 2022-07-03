import { WidgetType } from '@adapters/ui/widgets/types';
import { Widget } from '@adapters/ui/widgets/widget';
import { CaptureOverlayOptions } from '@adapters/ui/widgets/overlays/shared';

import { assetPathResolver } from '@utils/asset';
import { isMac } from '@utils/process';

const TRAFFIC_LIGHT_OFFSET_FOR_HIDING = { x: -256, y: -256 };

export default class CaptureOverlay extends Widget {
  constructor(options: CaptureOverlayOptions) {
    super(WidgetType.CAPTURE_OVERLAY, {
      icon: assetPathResolver('icon.png'),
      show: false,
      frame: false,
      movable: false,
      resizable: true, // WORKAROUND: for Windows to be set bounds properly
      maximizable: false,
      minimizable: false,
      focusable: true,
      skipTaskbar: true,
      transparent: true,
      titleBarStyle: 'customButtonsOnHover', // for MacOS, with frame: false
      enableLargerThanScreen: true, // for MacOS, margin workaround
      options,
    });

    this.loadURL(`file://${__dirname}/../overlays/index.html`);

    // https://github.com/electron/electron/issues/25368
    this.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    this.setAlwaysOnTop(true, 'screen-saver', 1);
    this.setHasShadow(false);

    // Not to expose traffic light buttons
    if (isMac()) {
      this.setTrafficLightPosition(TRAFFIC_LIGHT_OFFSET_FOR_HIDING);
    }
  }
}
