/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable promise/param-names */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { BrowserWindow, NativeImage } from 'electron';

import { isDebugMode } from '@utils/process';
import { setCustomData } from '@utils/remote';

import { WidgetType } from './types';

export interface WidgetOptions {
  hideWhenClose?: boolean | undefined;
  icon?: NativeImage | string | undefined;
  show?: boolean | undefined;
  width?: number | undefined;
  height?: number | undefined;
  frame?: boolean | undefined;
  movable?: boolean | undefined;
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
  private forceClose = false;
  private contentReady = false;

  constructor(type: WidgetType, options?: WidgetOptions) {
    super({
      icon: options?.icon ?? undefined,
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
        enableRemoteModule: true,
        contextIsolation: false,
      },
    });

    this.removeMenu();
    setCustomData(this, 'type', type);
    setCustomData(this, 'options', options?.options);

    this.on('close', (event) => {
      if (!this.forceClose) {
        event.preventDefault();
      }
      if (options?.hideWhenClose ?? true) {
        this.hide();
      }
    });

    // be sure window scaled as default
    this.webContents.on('did-finish-load', () => {
      this.webContents.setZoomFactor(1.0);
      this.webContents.setZoomLevel(0.0);
      this.webContents.setVisualZoomLevelLimits(1.0, 1.0);
    });
  }

  close(): void {
    this.forceClose = true;
    super.close();
  }

  async lazyShow(): Promise<void> {
    return new Promise((resolve, _) => {
      if (this.contentReady) {
        super.show();
        resolve();
      } else {
        this.webContents.on('did-finish-load', () => {
          this.contentReady = true;
          super.show();
          resolve();
        });
      }
    });
  }
}
