import { BrowserWindow } from 'electron';

import { assetPathResolver } from '@utils/asset';
import { isDebugMode } from '@utils/process';

import type { HelloSvelteOptions } from '@adapters/ui/widgets/hellosvelte/shared';
import { WidgetType } from '@adapters/ui/widgets/types';
import { Widget } from '@adapters/ui/widgets/widget';

export class HelloSvelteWidget extends Widget<HelloSvelteOptions> {
  private constructor(options: HelloSvelteOptions) {
    super(WidgetType.HELLO_SVELTE, options);

    this.window.loadURL(`file://${__dirname}/../hellosvelte/index.html`);
  }

  protected createWindow({
    width,
    height,
  }: {
    width: number;
    height: number;
  }): BrowserWindow {
    return new BrowserWindow({
      icon: assetPathResolver('icon.png'),
      show: false,
      width,
      height,
      resizable: false,
      maximizable: false,
      minimizable: false,
      closable: true,
      webPreferences: {
        devTools: isDebugMode(),
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
  }

  static create(options: HelloSvelteOptions): HelloSvelteWidget {
    return new HelloSvelteWidget(options);
  }
}
