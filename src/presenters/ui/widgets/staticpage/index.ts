/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable promise/param-names */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */
/* eslint-disable max-classes-per-file */

import { assetPathResolver } from '@presenters/common/asset';
import { WidgetType } from '@presenters/ui/widgets/types';
import { Widget } from '@presenters/ui/widgets/widget';

import { StaticPagePopupOptions } from './shared';

export class StaticPagePopup extends Widget {
  options?: StaticPagePopupOptions;

  constructor(options: StaticPagePopupOptions) {
    super(WidgetType.STATIC_PAGE_POPUP, {
      icon: assetPathResolver('icon.png'),
      width: options.width,
      height: options.height,
      resizable: false,
      maximizable: false,
      minimizable: false,
      closable: true,
      skipTaskbar: true,
      options,
    });
    this.options = options;

    this.loadURL(`file://${__dirname}/../staticpage/index.html`);
  }
}
