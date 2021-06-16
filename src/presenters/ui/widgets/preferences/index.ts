/* eslint-disable import/prefer-default-export */
/* eslint-disable @typescript-eslint/no-unused-vars */

import localShortcut from 'electron-localshortcut';

import { assetPathResolver } from '@presenters/common/asset';
import store from '@presenters/redux/store';
import { closePreferences } from '@presenters/redux/ui/slice';
import { WidgetType } from '@presenters/ui/widgets/types';
import { Widget } from '@presenters/ui/widgets/widget';

export class PreferencesModal extends Widget {
  private forceClose = false;

  constructor() {
    super(WidgetType.PREFERENECS_MODAL, {
      icon: assetPathResolver('icon.png'),
      width: 640,
      height: 450,
      frame: true,
      resizable: false,
      minimizable: false,
      maximizable: false,
      skipTaskbar: true,
    });

    this.on('close', (_event) => {
      this.forceClose = true;
      store.dispatch(closePreferences());
    });

    localShortcut.register(this, 'Escape', () => {
      store.dispatch(closePreferences());
    });

    this.loadURL(`file://${__dirname}/../preferences/index.html`);
  }

  close() {
    if (!this.forceClose) {
      super.close();
    }
  }
}
