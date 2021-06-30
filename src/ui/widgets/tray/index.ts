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
import { assetPathResolver } from '@utils/asset';

export abstract class AppTray {
  tray: Tray;
  isRecording = false;

  constructor(
    private iconDefault: NativeImage,
    private iconRecStop: NativeImage
  ) {
    this.tray = new Tray(this.iconDefault);
    this.tray.on('click', () => {
      if (this.isRecording) {
        store.dispatch(finishCapture());
      }
    });
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

  async refreshContextMenu(shortcut: string, isRecording?: boolean) {
    this.isRecording = isRecording ?? false;

    const templ = this.buildMenuTempl();

    const menuStartCapt = this.getMenuItemTemplById(templ, 'start-capture');
    menuStartCapt.label = menuStartCapt.label.replace('__shortcut__', shortcut);
    menuStartCapt.visible = !this.isRecording;

    const menuStopCapt = this.getMenuItemTemplById(templ, 'stop-capture');
    menuStopCapt.label = menuStopCapt.label.replace('__shortcut__', shortcut);
    menuStopCapt.visible = this.isRecording;

    this.tray.setImage(isRecording ? this.iconRecStop : this.iconDefault);
    this.tray.setContextMenu(Menu.buildFromTemplate(templ));
  }

  static forWindows(): AppTray {
    return new WinAppTray();
  }

  static forMac(): AppTray {
    return new MacAppTray();
  }
}

class WinAppTray extends AppTray {
  constructor() {
    super(
      nativeImage.createFromPath(assetPathResolver('icon.png')),
      nativeImage.createFromPath(assetPathResolver('icon-rec-stop.png'))
    );
  }

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
  constructor() {
    super(
      nativeImage
        .createFromPath(assetPathResolver('icon.png'))
        .resize({ width: 16, height: 16 }),
      nativeImage
        .createFromPath(assetPathResolver('icon-rec-stop.png'))
        .resize({ width: 16, height: 16 })
    );
  }

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
