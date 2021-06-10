/* eslint-disable import/prefer-default-export */
/* eslint-disable @typescript-eslint/no-unused-vars */

import localShortcut from 'electron-localshortcut';

import { assetPathResolver } from '@presenters/common/asset';
import store from '@presenters/redux/store';
import { closePreferences } from '@presenters/redux/ui/slice';
import { WindowType } from '@presenters/ui/ui-renderers/types';
import { BaseWindow } from '@presenters/ui/ui-renderers/win';

export class PreferencesWindow extends BaseWindow {
  private forceClose = false;

  constructor() {
    super(WindowType.PREFERENECS_WINDOW, {
      icon: assetPathResolver('icon.png'),
      width: 640,
      height: 250,
      frame: true,
      resizable: false,
      minimizable: false,
      maximizable: false,
      closable: true,
      skipTaskbar: true,
    });

    this.removeMenu();

    this.on('close', (_event) => {
      this.forceClose = true;
      store.dispatch(closePreferences());
    });

    localShortcut.register(this, 'Escape', () => {
      store.dispatch(closePreferences());
    });
  }

  close() {
    if (!this.forceClose) {
      super.close();
    }
  }
}
