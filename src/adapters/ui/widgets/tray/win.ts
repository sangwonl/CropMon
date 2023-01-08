import { MenuItem, MenuItemConstructorOptions } from 'electron';
import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { ActionDispatcher } from '@application/ports/action';
import { AppTray } from '@application/ports/tray';

import AppTrayCore from '@adapters/ui/widgets/tray/base';

@injectable()
export default class WinAppTray implements AppTray {
  private core: AppTrayCore;

  constructor(
    @inject(TYPES.ActionDispatcher) private dispatcher: ActionDispatcher
  ) {
    this.core = new AppTrayCore(
      this.dispatcher,
      this.buildMenuTempl.bind(this)
    );
    this.setupClickHandler();
  }

  refreshContextMenu(
    shortcut?: string | undefined,
    isUpdatable?: boolean | undefined,
    isRecording?: boolean | undefined
  ): void {
    this.core.refreshContextMenu(shortcut, isUpdatable, isRecording);
  }

  refreshRecTime(elapsedTimeInSec?: number | undefined): void {
    this.core.refreshRecTime(elapsedTimeInSec);
  }

  private buildMenuTempl(): Array<MenuItemConstructorOptions | MenuItem> {
    return [
      {
        id: 'check-update',
        label: 'Check for &Updates',
        click: () => this.core.onCheckForUpdates(),
      },
      {
        id: 'update',
        label: 'Download and Install',
        click: () => this.core.onDownloadAndInstall(),
      },
      {
        type: 'separator',
      },
      {
        label: '&About',
        click: () => this.core.onAbout(),
      },
      // NOTE: Hiding this item because of nothing in help page for now
      // {
      //   label: '&Help',
      //   click: this.trayCore.onHelp,
      // },
      {
        label: '&Preferences',
        click: () => this.core.onPreferences(),
      },
      {
        type: 'separator',
      },
      {
        id: 'start-capture',
        label: 'Start &Recording',
        click: () => this.core.onStartRecording(),
      },
      {
        id: 'stop-capture',
        label: 'Stop &Recording',
        click: () => this.core.onStopRecording(),
        visible: false,
      },
      {
        id: 'open-folder',
        label: '&Open Folder',
        click: () => this.core.onOpenFolder(),
      },
      {
        type: 'separator',
      },
      {
        label: '&Quit',
        click: () => this.core.onQuit(),
      },
    ];
  }

  private setupClickHandler(): void {
    this.core.tray.on('click', () => {
      if (this.core.isRecording) {
        this.dispatcher.finishCapture();
      }
    });
  }
}
