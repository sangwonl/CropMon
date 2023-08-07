import { BrowserWindow } from 'electron';

import { isDebugMode, isMac } from '@utils/process';

import type { CaptureOverlayOptions } from '@adapters/ui/widgets/overlays/shared';
import { WidgetType } from '@adapters/ui/widgets/types';
import Widget from '@adapters/ui/widgets/widget';

const TRAFFIC_LIGHT_OFFSET_FOR_HIDING = { x: -256, y: -256 };

export default class CaptureOverlay extends Widget<CaptureOverlayOptions> {
  constructor(options: CaptureOverlayOptions) {
    super(WidgetType.CAPTURE_OVERLAY, options);
    this.window.loadURL(`file://${__dirname}/../overlays/index.html`);

    // https://github.com/electron/electron/issues/25368
    this.window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    this.window.setAlwaysOnTop(true, 'screen-saver', 1);
    this.window.setHasShadow(false);

    // Not to expose traffic light buttons
    if (isMac()) {
      this.window.setTrafficLightPosition(TRAFFIC_LIGHT_OFFSET_FOR_HIDING);
    }
  }

  protected createWindow(): BrowserWindow {
    return new BrowserWindow({
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
      webPreferences: {
        devTools: isDebugMode(),
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
  }
}
