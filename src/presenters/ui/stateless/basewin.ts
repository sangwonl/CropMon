/* eslint-disable @typescript-eslint/no-explicit-any */
import { BrowserWindow } from 'electron';

import { assetPathResolver } from '@presenters/common/asset';
import { WindowType } from '@presenters/ui/stateless/types';
import { setCustomData } from '@utils/remote';

export interface ContainerWindowOptions {
  width?: number;
  height?: number;
  frame?: boolean;
  resizable?: boolean;
  maximizable?: boolean;
  minimizable?: boolean;
  closable?: boolean;
  skipTaskbar?: boolean;
  options?: any;
}

export class ContainerWindow extends BrowserWindow {
  constructor(type: WindowType, options?: ContainerWindowOptions) {
    super({
      show: false,
      icon: assetPathResolver('icon.png'),
      width: options?.width || 500,
      height: options?.height || 240,
      frame: options?.frame || true,
      resizable: options?.resizable || false,
      maximizable: options?.maximizable || false,
      minimizable: options?.minimizable || false,
      closable: options?.closable || false,
      skipTaskbar: options?.skipTaskbar || true,
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
