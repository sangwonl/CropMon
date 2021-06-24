/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable max-classes-per-file */
/* eslint-disable import/prefer-default-export */

import {
  Tray,
  nativeImage,
  Menu,
  NativeImage,
  MenuItem,
  MenuItemConstructorOptions,
} from 'electron';

import { GlobalRegistry } from '@core/components/registry';
import { CaptureStatus } from '@core/entities/capture';
import store from '@presenters/redux/store';
import {
  checkForUpdates,
  enableAreaSelection,
  openPreferences,
  quitApplication,
  showAbout,
} from '@presenters/redux/ui/slice';
import { finishCapture } from '@presenters/redux/capture/slice';
import { iconizeShortcut, INITIAL_SHORTCUT } from '@utils/shortcut';

export abstract class AppTray {
  tray: Tray;

  constructor(
    trayImage: NativeImage,
    protected globalRegistry: GlobalRegistry
  ) {
    this.tray = new Tray(trayImage);

    this.refreshContextMenu();
  }

  protected abstract buildContextMenuTempl(): Array<
    MenuItemConstructorOptions | MenuItem
  >;

  protected onAbout() {
    store.dispatch(showAbout());
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

  protected getShortcut(): string {
    const prefs = this.globalRegistry.getUserPreferences();
    return iconizeShortcut(prefs?.shortcut ?? INITIAL_SHORTCUT);
  }

  private getMenuItemTemplById(contextMenuTempl: any, id: string): any {
    return contextMenuTempl.find((m: any) => m.id === id)!;
  }

  refreshContextMenu() {
    const templ = this.buildContextMenuTempl();

    const menuStartCapt = this.getMenuItemTemplById(templ, 'start-capture');
    const menuStopCapt = this.getMenuItemTemplById(templ, 'stop-capture');

    const shortcut = this.getShortcut();
    menuStartCapt.label = menuStartCapt.label.replace('__shortcut__', shortcut);
    menuStopCapt.label = menuStopCapt.label.replace('__shortcut__', shortcut);

    const captCtx = this.globalRegistry.getCaptureContext();
    const isRecording = captCtx?.status === CaptureStatus.IN_PROGRESS;
    menuStartCapt.visible = !isRecording;
    menuStopCapt.visible = isRecording;

    this.tray.setContextMenu(Menu.buildFromTemplate(templ));
  }

  static forWindows(iconPath: string, globalRegistry: GlobalRegistry): AppTray {
    return new WinAppTray(nativeImage.createFromPath(iconPath), globalRegistry);
  }

  static forMac(iconPath: string, globalRegistry: GlobalRegistry): AppTray {
    const trayImage = nativeImage
      .createFromPath(iconPath)
      .resize({ width: 16, height: 16 });
    return new MacAppTray(trayImage, globalRegistry);
  }
}

class WinAppTray extends AppTray {
  // eslint-disable-next-line class-methods-use-this
  protected buildContextMenuTempl(): Array<
    MenuItemConstructorOptions | MenuItem
  > {
    return [
      {
        label: 'Check for &Updates',
        click: super.onCheckForUpdates,
      },
      {
        type: 'separator',
      },
      {
        label: '&About',
        click: super.onAbout,
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
        label: 'Start &Recording  __shortcut__',
        click: super.onStartRecording,
      },
      {
        id: 'stop-capture',
        label: 'Stop &Recording  __shortcut__',
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
    ];
  }
}

class MacAppTray extends AppTray {
  // eslint-disable-next-line class-methods-use-this
  protected buildContextMenuTempl(): Array<
    MenuItemConstructorOptions | MenuItem
  > {
    return [
      {
        label: 'Check for Updates',
        click: super.onCheckForUpdates,
      },
      {
        type: 'separator',
      },
      {
        label: 'About',
        click: super.onAbout,
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
        label: 'Start Recording  __shortcut__',
        click: super.onStartRecording,
      },
      {
        id: 'stop-capture',
        label: 'Stop Recording  __shortcut__',
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
    ];
  }
}
