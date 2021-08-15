/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable import/prefer-default-export */

import { Widget } from './widget';

export class CachedWidget<W extends Widget, C, R> {
  private widget: W | undefined = undefined;
  private timeoutHandle: any | undefined;

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
    this.widget.lazyShow();
  }

  async openAsModal(args: C): Promise<R | undefined> {
    if (this.timeoutHandle !== undefined) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = undefined;
    }

    if (this.widget === undefined) {
      this.widget = new this.widgetClass(args) as any;
    }

    const result = await (this.widget as any).open(args);
    this.timeoutHandle = setTimeout(() => {
      this.widget?.destroy();
      this.widget = undefined;
      this.timeoutHandle = undefined;
    }, this.ttlInSecs * 1000);

    return result;
  }

  close() {
    this.widget?.destroy();
  }
}
