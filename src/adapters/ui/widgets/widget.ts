import { BrowserWindow, type Rectangle, type WebContents } from 'electron';

import { WidgetType } from '@adapters/ui/widgets/types';

export abstract class Widget<T> {
  protected window: BrowserWindow;

  protected abstract createWindow(options?: T): BrowserWindow;

  constructor(type: WidgetType, options?: T) {
    this.window = this.createWindow(options);

    this.window.removeMenu();

    // be sure window scaled as default
    this.window.webContents.on('did-finish-load', () => {
      this.window.webContents.setZoomFactor(1.0);
      this.window.webContents.setZoomLevel(0.0);
      this.window.webContents.setVisualZoomLevelLimits(1.0, 1.0);
      this.window.webContents.send('loadWidget', { type, options });
    });
  }

  get id(): number {
    return this.window.id;
  }

  get webContents(): WebContents {
    return this.window.webContents;
  }

  open() {
    this.window.webContents.on('did-finish-load', () => {
      this.show();
      this.focus();
    });
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

  isDestroyed(): boolean {
    return this.window.isDestroyed();
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
