/* eslint-disable import/prefer-default-export */
/* eslint-disable max-classes-per-file */

import { BrowserWindow } from 'electron';

import { assetResolver } from '@presenters/common/asset';
import { setCustomData } from '@utils/remote';

import { StatelessWindowType } from '../types';

export class ProgressBar extends BrowserWindow {
  constructor() {
    super({
      width: 640,
      height: 250,
      icon: assetResolver('icon.png'),
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false,
      },
    });
    setCustomData(this, 'statelessWinType', StatelessWindowType.PROGRESS_BAR);
    this.loadURL(`file://${__dirname}/../progress/renderer.html`);
  }
}
