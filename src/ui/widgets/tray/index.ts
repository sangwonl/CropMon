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

import store from '@ui/redux/store';
import {
  enableCaptureMode,
  finishCapture,
  checkForUpdates,
  openPreferences,
  quitApplication,
  showAbout,
} from '@ui/redux/slice';

export abstract class AppTray {
  tray: Tray;

  constructor(trayImage: NativeImage) {
    this.tray = new Tray(trayImage);
  }

  protected abstract buildMenuTempl(): Array<
    MenuItemConstructorOptions | MenuItem
  >;

  protected onAbout() {
    store.dispatch(showAbout());
  }

  protected onCheckForUpdates() {
    store.dispatch(checkForUpdates());
  }

  protected onStartRecording() {
    store.dispatch(enableCaptureMode());
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

  private getMenuItemTemplById(contextMenuTempl: any, id: string): any {
    return contextMenuTempl.find((m: any) => m.id === id)!;
  }

  async refreshContextMenu(isRecording: boolean, shortcut: string) {
    const templ = this.buildMenuTempl();

    const menuStartCapt = this.getMenuItemTemplById(templ, 'start-capture');
    menuStartCapt.label = menuStartCapt.label.replace('__shortcut__', shortcut);
    menuStartCapt.visible = !isRecording;

    const menuStopCapt = this.getMenuItemTemplById(templ, 'stop-capture');
    menuStopCapt.label = menuStopCapt.label.replace('__shortcut__', shortcut);
    menuStopCapt.visible = isRecording;

    this.tray.setContextMenu(Menu.buildFromTemplate(templ));
  }

  static forWindows(iconPath: string): AppTray {
    return new WinAppTray(nativeImage.createFromPath(iconPath));
  }

  static forMac(iconPath: string): AppTray {
    return new MacAppTray(
      nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
    );
  }
}

class WinAppTray extends AppTray {
  // eslint-disable-next-line class-methods-use-this
  protected buildMenuTempl(): Array<MenuItemConstructorOptions | MenuItem> {
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
  protected buildMenuTempl(): Array<MenuItemConstructorOptions | MenuItem> {
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
