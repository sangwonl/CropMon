/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable max-classes-per-file */
/* eslint-disable import/prefer-default-export */

import { Tray, nativeImage, Menu, NativeImage } from 'electron';

import { CaptureStatus } from '@core/entities/capture';
import store, { RootState } from '@presenters/redux/store';
import {
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

  private onStateChanged(state: RootState): void {
    const updateRecordMenuItemVisibility = () => {
      const isRecording =
        state.capture.curCaptureCtx?.status === CaptureStatus.IN_PROGRESS;

      this.contextMenu.items[0].visible = !isRecording;
      this.contextMenu.items[1].visible = isRecording;
    };

    updateRecordMenuItemVisibility();
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
        label: 'Start &Recording',
        click: super.onStartRecording,
      },
      {
        label: 'Stop &Recording',
        click: super.onStopRecording,
        visible: false,
      },
      {
        label: '&Preferences',
        click: super.onPreferences,
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
        label: 'Start Recording',
        click: super.onStartRecording,
      },
      {
        label: 'Stop Recording',
        click: super.onStopRecording,
        visible: false,
      },
      {
        label: 'Preferences',
        click: super.onPreferences,
      },
      {
        label: 'Quit',
        click: super.onQuit,
      },
    ]);
  }
}
