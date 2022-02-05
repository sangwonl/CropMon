/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable promise/param-names */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { BrowserWindow, NativeImage } from 'electron';

import { isDebugMode } from '@utils/process';

import { WidgetType } from './types';

export interface WidgetOptions {
  icon?: NativeImage | string;
  show?: boolean;
  width?: number;
  height?: number;
  frame?: boolean;
  movable?: boolean;
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
      movable: options?.movable ?? true,
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
        devTools: isDebugMode(),
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    this.removeMenu();

    // be sure window scaled as default
    this.webContents.on('did-finish-load', () => {
      this.webContents.setZoomFactor(1.0);
      this.webContents.setZoomLevel(0.0);
      this.webContents.setVisualZoomLevelLimits(1.0, 1.0);
      this.webContents.send('loadWidget', {
        type,
        options: options?.options,
      });
    });
  }
}
