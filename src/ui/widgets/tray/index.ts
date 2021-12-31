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

import { diContainer } from '@di/containers/main';
import { IRecordOptions } from '@core/entities/capture';
import { ActionDispatcher } from '@adapters/actions/dispatcher';
import { assetPathResolver } from '@utils/asset';
import { isMac } from '@utils/process';

const TOOLTIP_GREETING = "Roar! I'm here to help you record the screen";
const TOOLTIP_UPDATE = 'New update available, please make me stronger!';
const TOOLTIP_RECORDING = 'Now recording. Click to stop';

export default abstract class AppTray {
  tray: Tray;
  menu: Menu | null = null;
  isRecording = false;
  isUpdatable = false;
  dispatcher: ActionDispatcher;

  constructor(
    private iconDefault: NativeImage,
    private iconUpdatable: NativeImage,
    private iconRecStop: NativeImage
  ) {
    this.tray = new Tray(this.iconDefault);
    this.tray.setToolTip(TOOLTIP_GREETING);
    this.dispatcher = diContainer.get(ActionDispatcher);

    this.setupClickHandler();
  }

  protected abstract buildMenuTempl(): Array<
    MenuItemConstructorOptions | MenuItem
  >;

  protected abstract setupClickHandler(): void;

  protected onAbout = () => {
    this.dispatcher.showAbout();
  };

  protected onHelp = () => {
    this.dispatcher.showHelp();
  };

  protected onCheckForUpdates = () => {
    this.dispatcher.checkForUpdates();
  };

  protected onDownloadAndInstall = () => {
    this.dispatcher.downloadAndInstall();
  };

  protected onStartRecording = () => {
    this.dispatcher.enableCaptureMode();
  };

  protected onStopRecording = () => {
    this.dispatcher.finishCapture();
  };

  protected onPreferences = () => {
    this.dispatcher.openPreferences();
  };

  protected onToggleLowQual = (m: MenuItem) => {
    this.dispatcher.toggleRecordOptions({
      enableLowQualityMode: m.checked,
    });
  };

  protected onToggleOutGif = (m: MenuItem) => {
    this.dispatcher.toggleRecordOptions({
      enableOutputAsGif: m.checked,
      enableMicrophone: false,
    });
  };

  protected onToggleMic = (m: MenuItem) => {
    this.dispatcher.toggleRecordOptions({
      enableMicrophone: m.checked,
      enableOutputAsGif: false,
    });
  };

  protected onQuit = () => {
    this.dispatcher.quitApplication();
  };

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
    recOptions?: IRecordOptions
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
    micOpt.checked = recOptions?.enableMicrophone ?? false;

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

  refreshRecTime(elapsedTimeInSec?: number) {
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
        click: this.onCheckForUpdates,
      },
      {
        id: 'update',
        label: 'Download and Install',
        click: this.onDownloadAndInstall,
      },
      {
        type: 'separator',
      },
      {
        label: '&About',
        click: this.onAbout,
      },
      {
        label: '&Help',
        click: this.onHelp,
      },
      {
        label: '&Preferences',
        click: this.onPreferences,
      },
      {
        type: 'separator',
      },
      {
        id: 'start-capture',
        label: 'Start &Recording',
        click: this.onStartRecording,
      },
      {
        id: 'stop-capture',
        label: 'Stop &Recording',
        click: this.onStopRecording,
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
            click: this.onToggleLowQual,
          },
          {
            id: 'out-gif',
            type: 'checkbox',
            label: 'Output as GIF',
            click: this.onToggleOutGif,
          },
          {
            id: 'record-mic',
            type: 'checkbox',
            label: 'Record Microphone',
            click: this.onToggleMic,
          },
        ],
      },
      {
        type: 'separator',
      },
      {
        label: '&Quit',
        click: this.onQuit,
      },
    ];
  }

  protected setupClickHandler(): void {
    this.tray.on('click', () => {
      if (this.isRecording) {
        this.dispatcher.finishCapture();
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
        click: this.onCheckForUpdates,
      },
      {
        id: 'update',
        label: 'Download and Install',
        click: this.onDownloadAndInstall,
      },
      {
        type: 'separator',
      },
      {
        label: 'About',
        click: this.onAbout,
      },
      {
        label: 'Help',
        click: this.onHelp,
      },
      {
        label: 'Preferences',
        click: this.onPreferences,
      },
      {
        type: 'separator',
      },
      {
        id: 'start-capture',
        label: 'Start Recording',
        click: this.onStartRecording,
      },
      {
        id: 'stop-capture',
        label: 'Stop Recording',
        click: this.onStopRecording,
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
            click: this.onToggleLowQual,
          },
          {
            id: 'out-gif',
            type: 'checkbox',
            label: 'Output as GIF',
            click: this.onToggleOutGif,
          },
          {
            id: 'record-mic',
            type: 'checkbox',
            label: 'Record Microphone',
            click: this.onToggleMic,
          },
        ],
      },
      {
        type: 'separator',
      },
      {
        label: 'Quit',
        click: this.onQuit,
      },
    ];
  }

  protected setupClickHandler(): void {
    this.tray.on('click', () => {
      if (this.isRecording) {
        this.tray.setContextMenu(null);
        this.dispatcher.finishCapture();
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
