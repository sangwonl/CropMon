/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */

import { injectable } from 'inversify';
import { ipcMain, WebContents } from 'electron';

import { IUiStateApplier } from '@core/interfaces/state';
import { IUiState } from '@core/entities/ui';

@injectable()
export class UiStateApplier implements IUiStateApplier {
  private webContents: Map<number, WebContents> = new Map();

  constructor() {
    ipcMain.on('joinForSynStates', (event, _data) => {
      this.webContents.set(event.sender.id, event.sender);
    });
  }

  apply(newState: IUiState): void {
    this.webContents.forEach((w) => {
      w.send('syncStates', newState);
    });
  }
}
