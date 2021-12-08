/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable import/prefer-default-export */

import { Widget } from './widget';

export default class CachedWidget<W extends Widget, C, R> {
  private loaded = false;
  private widget?: W;
  private timeoutHandle?: any;

  constructor(
    private widgetClass: new (args: C) => W,
    private ttlInSecs: number
  ) {}

  open(args: C): void {
    if (this.timeoutHandle !== undefined) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = undefined;
    }

    if (this.widget !== undefined) {
      this.widget.show();
      this.widget.focus();
      return;
    }

    this.widget = new this.widgetClass(args);
    this.widget.on('close', () => {
      this.timeoutHandle = setTimeout(() => {
        this.widget?.destroy();
        this.widget = undefined;
        this.timeoutHandle = undefined;
      }, this.ttlInSecs * 1000);
    });

    if (this.loaded) {
      this.widget.show();
    } else {
      this.widget.webContents.on('did-finish-load', () => {
        this.loaded = true;
        this.widget?.show();
      });
    }
  }

  async openAsModal(args: C, onClose: (result: R) => void): Promise<void> {
    if (this.timeoutHandle !== undefined) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = undefined;
    }

    if (this.widget === undefined) {
      this.widget = new this.widgetClass(args) as any;
    }

    await (this.widget as any).open(args, onClose);
    this.timeoutHandle = setTimeout(() => {
      this.widget?.destroy();
      this.widget = undefined;
      this.timeoutHandle = undefined;
    }, this.ttlInSecs * 1000);
  }

  close() {
    this.widget?.destroy();
  }
}
