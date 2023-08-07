import type { WebContents } from 'electron';

import { injectable } from 'inversify';

import type { UiState } from '@application/models/ui';
import type { UiStateApplier } from '@application/ports/state';

import Widget from '@adapters/ui/widgets/widget';

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

    destroyedIds.forEach(id => {
      this.webContents.delete(id);
    });

    this.webContents.forEach(w => {
      w.send('syncStates', newState);
    });
  }

  joinForSyncStates(widget: Widget<unknown>): void {
    this.webContents.set(widget.id, widget.webContents);
  }

  leaveFromSyncStates(widget: Widget<unknown>): void {
    if (this.webContents.has(widget.id)) {
      this.webContents.delete(widget.id);
    }
  }
}
