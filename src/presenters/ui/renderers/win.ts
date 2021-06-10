/* eslint-disable @typescript-eslint/no-explicit-any */

import { BrowserWindow } from 'electron';

import { assetPathResolver } from '@presenters/common/asset';
import { WindowType } from '@presenters/ui/renderers/types';
import { setCustomData } from '@utils/remote';

export interface WindowOptions {
  icon?: string;
  show?: boolean;
  width?: number;
  height?: number;
  frame?: boolean;
  focusable?: boolean;
  resizable?: boolean;
  maximizable?: boolean;
  minimizable?: boolean;
  closable?: boolean;
  skipTaskbar?: boolean;
  transparent?: boolean;
  enableLargerThanScreen?: boolean;
  titleBarStyle?: 'default' | 'hidden' | 'hiddenInset' | 'customButtonsOnHover';
  options?: any;
}

export class BaseWindow extends BrowserWindow {
  constructor(type: WindowType, options?: WindowOptions) {
    super({
      icon: options?.icon,
      show: options?.show ?? true,
      width: options?.width ?? 800,
      height: options?.height ?? 600,
      frame: options?.frame ?? true,
      focusable: options?.focusable ?? true,
      resizable: options?.resizable ?? true,
      maximizable: options?.maximizable ?? true,
      minimizable: options?.minimizable ?? true,
      closable: options?.closable ?? true,
      skipTaskbar: options?.skipTaskbar ?? false,
      transparent: options?.transparent ?? false,
      enableLargerThanScreen: options?.enableLargerThanScreen ?? false,
      titleBarStyle: options?.titleBarStyle ?? 'default',
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false,
      },
    });
    this.removeMenu();

    setCustomData(this, 'type', type);
    setCustomData(this, 'options', options?.options);
    this.loadURL(`file://${__dirname}/../renderers/index.html`);
  }
}
