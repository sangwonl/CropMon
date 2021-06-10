/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable promise/param-names */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */
/* eslint-disable max-classes-per-file */

import { assetPathResolver } from '@presenters/common/asset';
import { WindowType } from '@presenters/ui/ui-renderers/types';
import { BaseWindow } from '@presenters/ui/ui-renderers/win';

import { StaticPagePopupOptions } from './shared';

export class StaticPagePopup extends BaseWindow {
  options?: StaticPagePopupOptions;

  constructor(options: StaticPagePopupOptions) {
    super(WindowType.STATIC_PAGE_POPUP, {
      icon: assetPathResolver('icon.png'),
      width: options.width,
      height: options.height,
      maximizable: false,
      minimizable: false,
      closable: true,
      skipTaskbar: true,
      options,
    });
    this.options = options;
  }
}
