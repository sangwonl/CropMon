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
  toggleRecOptions,
  quitApplication,
  showAbout,
  showHelp,
} from '@ui/redux/slice';
import { assetPathResolver } from '@utils/asset';
import { IRecordingOptions } from '@core/entities/ui';

const TOOLTIP_GREETING = "Roar! I'm here to help you record the screen";
const TOOLTIP_RECORDING = 'Now recording.. Click to stop';

export abstract class AppTray {
  tray: Tray;
  menu: Menu | undefined;
  isRecording = false;

  constructor(
    private iconDefault: NativeImage,
    private iconRecStop: NativeImage
  ) {
    this.tray = new Tray(this.iconDefault);
    this.tray.setToolTip(TOOLTIP_GREETING);

    this.setupClickHandler();
  }

  protected abstract buildMenuTempl(): Array<
    MenuItemConstructorOptions | MenuItem
  >;

  protected abstract setupClickHandler(): void;

  protected onAbout() {
    store.dispatch(showAbout());
  }

  protected onHelp() {
    store.dispatch(showHelp());
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

  protected onToggleLowQual(m: MenuItem) {
    store.dispatch(toggleRecOptions({ enableLowQualityMode: m.checked }));
  }

  protected onToggleOutGif(m: MenuItem) {
    store.dispatch(toggleRecOptions({ enableOutputAsGif: m.checked }));
  }

  protected onToggleMic(m: MenuItem) {
    store.dispatch(toggleRecOptions({ enableRecordMicrophone: m.checked }));
  }

  protected onQuit() {
    store.dispatch(quitApplication());
  }

  private getMenuItemTemplById(
    contextMenuTempl: any,
    id: string
  ): MenuItemConstructorOptions | MenuItem {
    return contextMenuTempl.find((m: any) => m.id === id)!;
  }

  async refreshContextMenu(
    shortcut: string,
    isRecording?: boolean,
    recOptions?: IRecordingOptions
  ) {
    this.isRecording = isRecording ?? false;

    const templ = this.buildMenuTempl();

    // update recording operation
    const menuStartCapt = this.getMenuItemTemplById(templ, 'start-capture');
    menuStartCapt.accelerator = shortcut;
    menuStartCapt.visible = !this.isRecording;

    const menuStopCapt = this.getMenuItemTemplById(templ, 'stop-capture');
    menuStopCapt.accelerator = shortcut;
    menuStopCapt.visible = this.isRecording;

    // update recording options
    const recOpts = this.getMenuItemTemplById(templ, 'recording-options');
    const micOpt = this.getMenuItemTemplById(recOpts.submenu, 'record-mic');
    micOpt.checked = recOptions?.enableRecordMicrophone ?? false;

    const gifOpt = this.getMenuItemTemplById(recOpts.submenu, 'out-gif');
    gifOpt.checked = recOptions?.enableOutputAsGif ?? false;

    const reduceOpt = this.getMenuItemTemplById(recOpts.submenu, 'low-qual');
    reduceOpt.checked = recOptions?.enableLowQualityMode ?? false;

    // update tray properties
    this.menu = Menu.buildFromTemplate(templ);
    this.tray.setContextMenu(this.menu);
    this.tray.setImage(isRecording ? this.iconRecStop : this.iconDefault);
    this.tray.setToolTip(isRecording ? TOOLTIP_RECORDING : TOOLTIP_GREETING);
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
        label: '&Help',
        click: super.onHelp,
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
        id: 'recording-options',
        label: 'Options',
        submenu: [
          {
            id: 'low-qual',
            type: 'checkbox',
            label: 'Low Quality Mode',
            click: super.onToggleLowQual,
          },
          {
            id: 'out-gif',
            type: 'checkbox',
            label: 'Output as GIF',
            click: super.onToggleOutGif,
          },
          {
            id: 'record-mic',
            type: 'checkbox',
            label: 'Record Microphone',
            click: super.onToggleMic,
          },
        ],
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

  protected setupClickHandler(): void {
    this.tray.on('click', () => {
      if (this.isRecording) {
        store.dispatch(finishCapture());
      }
    });
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
        label: 'Help',
        click: super.onHelp,
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
        id: 'recording-options',
        label: 'Options',
        submenu: [
          {
            id: 'low-qual',
            type: 'checkbox',
            label: 'Low Quality Mode',
            click: super.onToggleLowQual,
          },
          {
            id: 'out-gif',
            type: 'checkbox',
            label: 'Output as GIF',
            click: super.onToggleOutGif,
          },
          {
            id: 'record-mic',
            type: 'checkbox',
            label: 'Record Microphone',
            click: super.onToggleMic,
          },
        ],
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

  protected setupClickHandler(): void {
    this.tray.on('click', () => {
      if (this.isRecording) {
        this.tray.setContextMenu(null);
        store.dispatch(finishCapture());
      } else {
        this.tray.setContextMenu(this.menu!);
        this.tray.popUpContextMenu();
      }
    });

    this.tray.on('right-click', () => {
      this.tray.setContextMenu(this.menu!);
      this.tray.popUpContextMenu();
    });
  }
}
