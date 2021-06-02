/* eslint-disable @typescript-eslint/no-explicit-any */
import { BrowserWindow } from 'electron';

import { assetResolver } from '@presenters/common/asset';
import { WindowType } from '@presenters/ui/stateless/types';
import { setCustomData } from '@utils/remote';

export interface ContainerWindowOptions {
  width?: number;
  height?: number;
  options?: any;
}

export class ContainerWindow extends BrowserWindow {
  constructor(type: WindowType, options?: ContainerWindowOptions) {
    super({
      show: false,
      width: options?.width || 500,
      height: options?.height || 240,
      icon: assetResolver('icon.png'),
      frame: true,
      resizable: false,
      maximizable: false,
      minimizable: false,
      closable: false,
      skipTaskbar: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false,
      },
    });
    this.removeMenu();

    setCustomData(this, 'type', type);
    setCustomData(this, 'options', options?.options);
    this.loadURL(`file://${__dirname}/../stateless/renderer.html`);
  }
}
