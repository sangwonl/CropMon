/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable import/prefer-default-export */
/* eslint-disable max-classes-per-file */

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
  showAbout,
  showHelp,
  openPreferences,
  quitApplication,
  checkForUpdates,
  downloadAndInstall,
  enableCaptureMode,
  finishCapture,
  toggleRecOptions,
} from '@ui/redux/slice';
import { assetPathResolver } from '@utils/asset';
import { IRecordingOptions } from '@core/entities/capture';
import { isMac } from '@utils/process';

const TOOLTIP_GREETING = "Roar! I'm here to help you record the screen";
const TOOLTIP_UPDATE = 'New update available, please make me stronger!';
const TOOLTIP_RECORDING = 'Now recording.. Click to stop';

export default abstract class AppTray {
  tray: Tray;
  menu: Menu | null = null;
  isRecording = false;
  isUpdatable = false;

  constructor(
    private iconDefault: NativeImage,
    private iconUpdatable: NativeImage,
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

  protected onDownloadAndInstall() {
    store.dispatch(downloadAndInstall());
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
    return contextMenuTempl.find((m: any) => m.id === id);
  }

  async refreshContextMenu(
    shortcut?: string,
    isUpdatable?: boolean,
    isRecording?: boolean,
    recOptions?: IRecordingOptions
  ) {
    if (isRecording !== undefined) {
      this.isRecording = isRecording;
    }
    if (isUpdatable !== undefined) {
      this.isUpdatable = isUpdatable;
    }

    const templ = this.buildMenuTempl();

    // update app update or install menu items
    const menuCheckUpdate = this.getMenuItemTemplById(templ, 'check-update');
    menuCheckUpdate.visible = !this.isUpdatable;

    const menuUpdate = this.getMenuItemTemplById(templ, 'update');
    menuUpdate.visible = this.isUpdatable;

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
    this.tray.setImage(this.chooseTrayIcon());
    this.tray.setToolTip(this.chooseTrayTooltip());
  }

  refreshRecTime(elapsedTimeInSec: number | undefined) {
    if (elapsedTimeInSec === undefined) {
      this.tray.setTitle('');
    } else {
      const h = Math.floor(elapsedTimeInSec / 3600);
      const m = Math.floor(elapsedTimeInSec / 60);
      const s = elapsedTimeInSec % 60;
      this.tray.setTitle(this.makeAsTimeString(h, m, s), {
        fontType: 'monospacedDigit',
      });
    }
  }

  private chooseTrayIcon = (): NativeImage => {
    if (this.isRecording) {
      return this.iconRecStop;
    }
    if (this.isUpdatable) {
      return this.iconUpdatable;
    }
    return this.iconDefault;
  };

  private chooseTrayTooltip = (): string => {
    if (this.isRecording) {
      return TOOLTIP_RECORDING;
    }
    if (this.isUpdatable) {
      return TOOLTIP_UPDATE;
    }
    return TOOLTIP_GREETING;
  };

  private makeAsTimeString = (h: number, m: number, s: number): string => {
    const hh = `${h}`.padStart(2, '0');
    const mm = `${m}`.padStart(2, '0');
    const ss = `${s}`.padStart(2, '0');
    return h > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
  };

  static create(): AppTray {
    return isMac() ? new MacAppTray() : new WinAppTray();
  }
}

class WinAppTray extends AppTray {
  constructor() {
    super(
      nativeImage.createFromPath(assetPathResolver('icon-tray-default.png')),
      nativeImage.createFromPath(assetPathResolver('icon-tray-updatable.png')),
      nativeImage.createFromPath(assetPathResolver('icon-tray-recstop.png'))
    );
  }

  // eslint-disable-next-line class-methods-use-this
  protected buildMenuTempl(): Array<MenuItemConstructorOptions | MenuItem> {
    return [
      {
        id: 'check-update',
        label: 'Check for &Updates',
        click: super.onCheckForUpdates,
      },
      {
        id: 'update',
        label: 'Download and Install',
        click: super.onDownloadAndInstall,
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
        .createFromPath(assetPathResolver('icon-tray-default.png'))
        .resize({ width: 18, height: 16 }),
      nativeImage
        .createFromPath(assetPathResolver('icon-tray-updatable.png'))
        .resize({ width: 18, height: 16 }),
      nativeImage
        .createFromPath(assetPathResolver('icon-tray-recstop.png'))
        .resize({ width: 18, height: 16 })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  protected buildMenuTempl(): Array<MenuItemConstructorOptions | MenuItem> {
    return [
      {
        id: 'check-update',
        label: 'Check for Updates',
        click: super.onCheckForUpdates,
      },
      {
        id: 'update',
        label: 'Download and Install',
        click: super.onDownloadAndInstall,
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
        this.tray.setContextMenu(this.menu);
        this.tray.popUpContextMenu();
      }
    });

    this.tray.on('right-click', () => {
      this.tray.setContextMenu(this.menu);
      this.tray.popUpContextMenu();
    });
  }
}
