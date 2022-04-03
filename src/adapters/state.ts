import { injectable } from 'inversify';
import { ipcMain, WebContents } from 'electron';

import { UiState } from '@application/models/ui';

@injectable()
export default class ElectronUiStateApplier {
  private webContents: Map<number, WebContents> = new Map();

  constructor() {
    ipcMain.on('joinForSynStates', (event, _data) => {
      this.webContents.set(event.sender.id, event.sender);
    });
  }

  apply(newState: UiState): void {
    this.webContents.forEach((w) => {
      w.send('syncStates', newState);
    });
  }
}
