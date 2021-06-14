/* eslint-disable @typescript-eslint/no-explicit-any */

import { BrowserWindow, NativeImage } from 'electron';
import { BrowserWindowConstructorOptions } from 'electron/main';
import localShortcut from 'electron-localshortcut';

import { isDebugMode } from '@utils/process';
import { setCustomData } from '@utils/remote';

import { WidgetType } from './types';

export interface WidgetOptions {
  icon?: NativeImage | string | undefined;
  show?: boolean | undefined;
  width?: number | undefined;
  height?: number | undefined;
  frame?: boolean | undefined;
  focusable?: boolean | undefined;
  resizable?: boolean | undefined;
  maximizable?: boolean | undefined;
  minimizable?: boolean | undefined;
  closable?: boolean | undefined;
  skipTaskbar?: boolean | undefined;
  transparent?: boolean | undefined;
  enableLargerThanScreen?: boolean | undefined;
  titleBarStyle?:
    | 'default'
    | 'hidden'
    | 'hiddenInset'
    | 'customButtonsOnHover'
    | undefined;
  options?: any | undefined;
}

export class Widget extends BrowserWindow {
  constructor(type: WidgetType, options?: WidgetOptions) {
    const bwOpts: BrowserWindowConstructorOptions = {
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
    };
    if (options?.icon) {
      bwOpts.icon = options.icon;
    }

    super(bwOpts);

    this.removeMenu();

    setCustomData(this, 'type', type);
    setCustomData(this, 'options', options?.options);

    if (isDebugMode()) {
      localShortcut.register(this, 'Ctrl+F12', () => {
        this.webContents.openDevTools();
      });
    }
  }
}
