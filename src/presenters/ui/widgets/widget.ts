/* eslint-disable @typescript-eslint/no-explicit-any */

import log from 'electron-log';
import { BrowserWindow } from 'electron';

import { setCustomData } from '@utils/remote';

import { WidgetType } from './types';

export interface WidgetOptions {
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

export class Widget extends BrowserWindow {
  constructor(type: WidgetType, options?: WidgetOptions) {
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
    this.loadURL(`file://${__dirname}/../widgets/index.html`);
  }
}
