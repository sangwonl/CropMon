import { MenuItem, MenuItemConstructorOptions } from 'electron';
import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { Preferences } from '@domain/models/preferences';

import { UseCaseInteractor } from '@application/ports/interactor';
import { AppTray } from '@application/ports/tray';

import AppTrayCore from '@adapters/ui/widgets/tray/base';

@injectable()
export default class MacAppTray implements AppTray {
  private core: AppTrayCore;

  constructor(
    @inject(TYPES.UseCaseInteractor) private interactor: UseCaseInteractor
  ) {
    this.core = new AppTrayCore(
      this.interactor,
      this.buildMenuTempl.bind(this)
    );
    this.setupClickHandler();
  }

  syncPrefs(prefs: Preferences): void {
    this.core.syncPrefs(prefs);
  }

  setRecording(recording: boolean): void {
    this.core.setRecording(recording);
  }

  setUpdater(checkable: boolean, updatable: boolean): void {
    this.core.setUpdater(checkable, updatable);
  }

  refreshRecTime(elapsedTimeInSec?: number | undefined): void {
    this.core.refreshRecTime(elapsedTimeInSec);
  }

  private buildMenuTempl(): Array<MenuItemConstructorOptions | MenuItem> {
    return [
      {
        id: 'check-update',
        label: 'Check for Updates',
        click: () => this.core.onCheckForUpdates(),
        visible: false,
      },
      {
        id: 'update',
        label: 'Download and Install',
        click: () => this.core.onDownloadAndInstall(),
        visible: false,
      },
      {
        id: 'separator1',
        type: 'separator',
        visible: false,
      },
      {
        label: 'Preferences',
        click: () => this.core.onPreferences(),
        visible: true,
      },
      {
        id: 'separator2',
        type: 'separator',
        visible: true,
      },
      {
        id: 'start-capture',
        label: 'Start Recording',
        click: () => this.core.onStartRecording(),
        visible: true,
      },
      {
        id: 'stop-capture',
        label: 'Stop Recording',
        click: () => this.core.onStopRecording(),
        visible: false,
      },
      {
        id: 'open-folder',
        label: 'Open Folder',
        click: () => this.core.onOpenFolder(),
        visible: true,
      },
      {
        id: 'separator3',
        type: 'separator',
        visible: true,
      },
      {
        label: 'Quit',
        click: () => this.core.onQuit(),
        visible: true,
      },
    ];
  }

  private setupClickHandler(): void {
    this.core.tray.on('click', () => {
      if (this.core.recording) {
        this.core.tray.setContextMenu(null);
        this.interactor.finishCapture();
      } else {
        this.core.tray.setContextMenu(this.core.menu);
        this.core.tray.popUpContextMenu();
      }
    });
    this.core.tray.on('right-click', () => {
      this.core.tray.setContextMenu(this.core.menu);
      this.core.tray.popUpContextMenu();
    });
  }
}
