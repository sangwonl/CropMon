/* eslint-disable @typescript-eslint/no-explicit-any */

import { BrowserWindow, NativeImage, Rectangle, WebContents } from 'electron';

import { WidgetType } from '@adapters/ui/widgets/types';

import { isDebugMode } from '@utils/process';

export type WidgetOptions = {
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
};

export class Widget {
  protected window: BrowserWindow;

  constructor(type: WidgetType, options?: WidgetOptions) {
    this.window = new BrowserWindow({
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

    this.window.removeMenu();

    // be sure window scaled as default
    this.window.webContents.on('did-finish-load', () => {
      this.window.webContents.setZoomFactor(1.0);
      this.window.webContents.setZoomLevel(0.0);
      this.window.webContents.setVisualZoomLevelLimits(1.0, 1.0);
      this.window.webContents.send('loadWidget', {
        type,
        options: options?.options,
      });
    });
  }

  get id(): number {
    return this.window.id;
  }

  get webContents(): WebContents {
    return this.window.webContents;
  }

  show() {
    this.window.show();
  }

  hide() {
    this.window.hide();
  }

  focus() {
    this.window.focus();
  }

  blur() {
    this.window.blur();
  }

  close() {
    this.window.close();
  }

  destroy() {
    this.window.destroy();
  }

  setIgnoreMouseEvents(ignore: boolean) {
    this.window.setIgnoreMouseEvents(ignore);
  }

  setBounds(bounds: Partial<Rectangle>) {
    this.window.setBounds(bounds);
  }

  setResizable(resizable: boolean) {
    this.window.setResizable(resizable);
  }
}
