/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/prefer-default-export */

import localShortcut from 'electron-localshortcut';

import store from '@presenters/redux/store';
import { closePreferences } from '@presenters/redux/ui/slice';
import { WindowType } from '@presenters/ui/renderers/types';
import { BaseWindow } from '@presenters/ui/renderers/win';

export class PreferencesWindow extends BaseWindow {
  private forceClose = false;

  constructor() {
    super(WindowType.PREFERENECS_WINDOW, {
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
