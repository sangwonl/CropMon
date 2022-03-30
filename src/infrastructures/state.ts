import { injectable } from 'inversify';
import { ipcMain, WebContents } from 'electron';

import { IUiStateApplier } from '@core/services/state';
import { IUiState } from '@core/entities/ui';

@injectable()
export default class UiStateApplier implements IUiStateApplier {
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
