import { BrowserWindow } from 'electron';

import { assetPathResolver } from '@utils/asset';
import { isDebugMode } from '@utils/process';

import type { StaticPageDialogOptions } from '@adapters/ui/widgets/staticpage/shared';
import { WidgetType } from '@adapters/ui/widgets/types';
import { Widget } from '@adapters/ui/widgets/widget';

export class StaticPageDialog extends Widget<StaticPageDialogOptions> {
  private constructor(options: StaticPageDialogOptions) {
    super(WidgetType.STATIC_PAGE_DIALOG, options);

    this.window.loadURL(`file://${__dirname}/../staticpage/index.html`);
  }

  protected createWindow({
    width,
    height,
  }: {
    width: number;
    height: number;
  }): BrowserWindow {
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
