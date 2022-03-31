/* eslint-disable @typescript-eslint/no-explicit-any */

import { WidgetType } from '@adapters/ui/widgets/types';
import { Widget } from '@adapters/ui/widgets/widget';
import { StaticPageModalOptions } from '@adapters/ui/widgets/staticpage/shared';

import { assetPathResolver } from '@utils/asset';

export default class StaticPageModal extends Widget {
  private closeResolver?: any;

  private constructor(options: StaticPageModalOptions) {
    super(WidgetType.STATIC_PAGE_POPUP, {
      icon: assetPathResolver('icon.png'),
      show: false,
      width: options.width,
      height: options.height,
      resizable: false,
      maximizable: false,
      minimizable: false,
      closable: true,
      options,
    });

    this.loadURL(`file://${__dirname}/../staticpage/index.html`);

    this.on('close', () => {
      this.closeResolver?.();
    });
  }

  private async openAsModal(): Promise<void> {
    this.webContents.on('did-finish-load', () => {
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
