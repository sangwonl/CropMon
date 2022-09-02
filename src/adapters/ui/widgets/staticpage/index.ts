/* eslint-disable @typescript-eslint/no-explicit-any */

import { BrowserWindow } from 'electron';

import { WidgetType } from '@adapters/ui/widgets/types';
import Widget from '@adapters/ui/widgets/widget';
import { StaticPageModalOptions } from '@adapters/ui/widgets/staticpage/shared';

import { assetPathResolver } from '@utils/asset';
import { isDebugMode } from '@utils/process';

export default class StaticPageModal extends Widget {
  private closeResolver?: any;

  private constructor(options: StaticPageModalOptions) {
    super(WidgetType.STATIC_PAGE_POPUP, options);

    this.window.loadURL(`file://${__dirname}/../staticpage/index.html`);

    this.window.on('close', () => {
      this.closeResolver?.();
    });
  }

  protected createWindow({ width, height }: any): BrowserWindow {
    return new BrowserWindow({
      icon: assetPathResolver('icon.png'),
      show: false,
      width,
      height,
      resizable: false,
      maximizable: false,
      minimizable: false,
      closable: true,
      webPreferences: {
        devTools: isDebugMode(),
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
  }

  private async openAsModal(): Promise<void> {
    this.window.webContents.on('did-finish-load', () => {
      this.show();
      this.focus();
    });

    return new Promise((resolve) => {
      this.closeResolver = resolve;
    });
  }

  async doModal(): Promise<void> {
    await this.openAsModal();
  }

  static create(options: StaticPageModalOptions): StaticPageModal {
    return new StaticPageModal(options);
  }
}
