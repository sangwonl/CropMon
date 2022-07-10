import {
  Tray,
  Menu,
  NativeImage,
  MenuItem,
  MenuItemConstructorOptions,
} from 'electron';

import diContainer from '@di/containers/main';
import TYPES from '@di/types';

import { RecordOptions } from '@domain/models/capture';

import { ActionDispatcher } from '@application/ports/action';

import TrayIconProvider from '@adapters/ui/widgets/tray/icon';

const TOOLTIP_GREETING = "Roar! I'm here to help you record the screen";
const TOOLTIP_UPDATE = 'New update available, please make me stronger!';
const TOOLTIP_RECORDING = 'Now recording. Click to stop';

export default abstract class AppTray {
  iconProvider: TrayIconProvider;

  tray: Tray;
  menu: Menu | null = null;

  isRecording = false;
  isUpdatable = false;

  dispatcher: ActionDispatcher;

  constructor() {
    this.iconProvider = new TrayIconProvider();

    this.tray = new Tray(this.iconProvider.icon('default'));
    this.tray.setToolTip(TOOLTIP_GREETING);

    this.dispatcher = diContainer.get<ActionDispatcher>(TYPES.ActionDispatcher);

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

  protected onOpenFolder = () => {
    this.dispatcher.openCaptureFolder();
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
    recOptions?: RecordOptions
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
      return this.iconProvider.icon('recording');
    }
    if (this.isUpdatable) {
      return this.iconProvider.icon('updatable');
    }
    return this.iconProvider.icon('default');
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
}
