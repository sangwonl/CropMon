/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable promise/param-names */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */
/* eslint-disable max-classes-per-file */

import { WindowType } from '@presenters/ui/stateless/types';

import { StaticPagePopupOptions } from './shared';
import { ContainerWindow } from '../../basewin';

export class StaticPagePopup extends ContainerWindow {
  options?: StaticPagePopupOptions;

  constructor(options: StaticPagePopupOptions) {
    super(WindowType.STATIC_PAGE_POPUP, {
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
