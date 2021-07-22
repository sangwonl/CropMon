/* eslint-disable import/prefer-default-export */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable max-classes-per-file */

import { emptyBounds } from '@utils/bounds';
import { isMac } from '@utils/process';
import { assetPathResolver } from '@utils/asset';
import { WidgetType } from '@ui/widgets/types';
import { Widget } from '@ui/widgets/widget';

export class CaptureOverlay extends Widget {
  constructor() {
    super(WidgetType.CAPTURE_OVERLAY, {
      icon: assetPathResolver('icon.png'),
      show: false,
      frame: false,
      movable: false,
      resizable: false,
      maximizable: false,
      minimizable: false,
      focusable: isMac(),
      skipTaskbar: true,
      transparent: true,
      hideWhenClose: false,
      titleBarStyle: 'customButtonsOnHover', // for MacOS, with frame: false
      enableLargerThanScreen: true, // for MacOS, margin workaround
    });

    // this.setAlwaysOnTop(true, 'main-menu', 1);
    this.setAlwaysOnTop(true, 'screen-saver', 1);
    this.setBounds(emptyBounds());
    // https://github.com/electron/electron/issues/25368
    this.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

    this.loadURL(`file://${__dirname}/../overlays/index.html`);
  }
}
