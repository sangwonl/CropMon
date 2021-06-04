/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable max-classes-per-file */
/* eslint-disable import/prefer-default-export */

import { Tray, nativeImage, Menu, NativeImage, MenuItem } from 'electron';

import { CaptureStatus } from '@core/entities/capture';
import store, { RootState } from '@presenters/redux/store';
import {
  checkForUpdates,
  enableAreaSelection,
  openPreferences,
  quitApplication,
} from '@presenters/redux/ui/slice';
import { finishCapture } from '@presenters/redux/capture/slice';

export abstract class AppTray {
  tray: Tray;
  contextMenu: Menu;

  constructor(trayImage: NativeImage) {
    this.tray = new Tray(trayImage);

    this.contextMenu = this.buildContextMenu();
    this.tray.setContextMenu(this.contextMenu);

    store.subscribe(() => this.onStateChanged(store.getState()));
  }

  protected abstract buildContextMenu(): Menu;

  private getMenuItemById(id: string): MenuItem {
    return this.contextMenu.items.find((m: MenuItem) => m.id === id)!;
  }

  private onStateChanged(state: RootState): void {
    const updateRecordMenuItemVisibility = () => {
      const isRecording =
        state.capture.curCaptureCtx?.status === CaptureStatus.IN_PROGRESS;

      this.getMenuItemById('start-capture').visible = !isRecording;
      this.getMenuItemById('stop-capture').visible = isRecording;
    };

    updateRecordMenuItemVisibility();
  }

  protected onCheckForUpdates() {
    store.dispatch(checkForUpdates());
  }

  protected onStartRecording() {
    store.dispatch(enableAreaSelection());
  }

  protected onStopRecording() {
    store.dispatch(finishCapture());
  }

  protected onPreferences() {
    store.dispatch(openPreferences());
  }

  protected onQuit() {
    store.dispatch(quitApplication());
  }

  static forWindows(iconPath: string): AppTray {
    return new WinAppTray(nativeImage.createFromPath(iconPath));
  }

  static forMac(iconPath: string): AppTray {
    const trayImage = nativeImage.createFromPath(iconPath);
    return new MacAppTray(trayImage.resize({ width: 16, height: 16 }));
  }
}

class WinAppTray extends AppTray {
  // eslint-disable-next-line class-methods-use-this
  protected buildContextMenu(): Menu {
    return Menu.buildFromTemplate([
      {
        label: 'Check for &Updates',
        click: super.onCheckForUpdates,
      },
      {
        type: 'separator',
      },
      {
        label: '&About',
        // click: super.onPreferences,
      },
      {
        label: '&Preferences',
        click: super.onPreferences,
      },
      {
        type: 'separator',
      },
      {
        id: 'start-capture',
        label: 'Start &Recording',
        click: super.onStartRecording,
      },
      {
        id: 'stop-capture',
        label: 'Stop &Recording',
        click: super.onStopRecording,
        visible: false,
      },
      {
        type: 'separator',
      },
      {
        label: '&Quit',
        click: super.onQuit,
      },
    ]);
  }
}

class MacAppTray extends AppTray {
  // eslint-disable-next-line class-methods-use-this
  protected buildContextMenu(): Menu {
    return Menu.buildFromTemplate([
      {
        label: 'Check for Updates',
        click: super.onCheckForUpdates,
      },
      {
        type: 'separator',
      },
      {
        label: 'About',
        // click: super.onPreferences,
      },
      {
        label: 'Preferences',
        click: super.onPreferences,
      },
      {
        type: 'separator',
      },
      {
        id: 'start-capture',
        label: 'Start Recording',
        click: super.onStartRecording,
      },
      {
        id: 'stop-capture',
        label: 'Stop Recording',
        click: super.onStopRecording,
        visible: false,
      },
      {
        type: 'separator',
      },
      {
        label: 'Quit',
        click: super.onQuit,
      },
    ]);
  }
}
