import { injectable } from 'inversify';
import { WebContents } from 'electron';

import { UiState } from '@application/models/ui';

import { UiStateApplier } from '@application/ports/state';

import { Widget } from '@adapters/ui/widgets/widget';

@injectable()
export default class ElectronUiStateApplier implements UiStateApplier {
  private webContents: Map<number, WebContents> = new Map();

  apply(newState: UiState): void {
    const destroyedIds: number[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const [id, w] of this.webContents.entries()) {
      if (w.isDestroyed()) {
        destroyedIds.push(id);
      }
    }

    destroyedIds.forEach((id) => {
      this.webContents.delete(id);
    });

    this.webContents.forEach((w) => {
      w.send('syncStates', newState);
    });
  }

  joinForSyncStates(widget: Widget): void {
    this.webContents.set(widget.id, widget.webContents);
  }

  leaveFromSyncStates(widget: Widget): void {
    if (this.webContents.has(widget.id)) {
      this.webContents.delete(widget.id);
    }
  }
}
