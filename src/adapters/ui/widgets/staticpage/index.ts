/* eslint-disable @typescript-eslint/no-explicit-any */

import { BrowserWindow } from 'electron';

import { assetPathResolver } from '@utils/asset';
import { isDebugMode } from '@utils/process';

import { StaticPageDialogOptions } from '@adapters/ui/widgets/staticpage/shared';
import { WidgetType } from '@adapters/ui/widgets/types';
import Widget from '@adapters/ui/widgets/widget';

export default class StaticPageDialog extends Widget {
  private constructor(options: StaticPageDialogOptions) {
    super(WidgetType.STATIC_PAGE_POPUP, options);

    this.window.loadURL(`file://${__dirname}/../staticpage/index.html`);
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

  static create(options: StaticPageDialogOptions): StaticPageDialog {
    return new StaticPageDialog(options);
  }
}
