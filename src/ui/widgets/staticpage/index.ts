/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable promise/param-names */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */
/* eslint-disable max-classes-per-file */

import { assetPathResolver } from '@utils/asset';
import { WidgetType } from '@ui/widgets/types';
import { Widget } from '@ui/widgets/widget';

import { StaticPageModalOptions } from './shared';

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

    return new Promise((resolve, _) => {
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
