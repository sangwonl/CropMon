/* eslint-disable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line import/order
import {
  Tray,
  Menu,
  MenuItemConstructorOptions,
  MenuItem,
  NativeImage,
} from 'electron';

import { Preferences } from '@domain/models/preferences';

import { UseCaseInteractor } from '@application/ports/interactor';

import TrayIconProvider, { TrayIconType } from '@adapters/ui/widgets/tray/icon';

const TOOLTIP_GREETING = "Roar! I'm here to help you record the screen";
const TOOLTIP_UPDATE = 'New update available, please make me stronger!';
const TOOLTIP_RECORDING = 'Now recording. Click to stop';

export default class AppTrayCore {
  iconProvider: TrayIconProvider;

  tray: Tray;
  menu: Menu | null;

  prefs?: Preferences;
  recording = false;
  checkable = true;
  updatable = false;

  constructor(
    private interactor: UseCaseInteractor,
    private buildMenuTempl: any
  ) {
    this.iconProvider = new TrayIconProvider();
    this.tray = new Tray(this.iconProvider.icon('default'));
    this.menu = null;
    this.updateTray();
  }

  onCheckForUpdates() {
    this.interactor.checkForUpdates();
  }

  onDownloadAndInstall() {
    this.interactor.downloadAndInstall();
  }

  onStartRecording() {
    this.interactor.enableCaptureMode();
  }

  onStopRecording() {
    this.interactor.finishCapture();
  }

  onPreferences() {
    this.interactor.openPreferences();
  }

  onOpenFolder() {
    this.interactor.openCaptureFolder();
  }

  onQuit() {
    this.interactor.quitApplication();
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

  syncPrefs(prefs: Preferences): void {
    this.prefs = prefs;
    this.updateTray();
  }

  setRecording(recording: boolean): void {
    this.recording = recording;
    this.updateTray();
  }

  setUpdater(checkable: boolean, updatable: boolean): void {
    this.checkable = checkable;
    this.updatable = updatable;
    this.updateTray();
  }

  private updateTray(): void {
    this.menu = this.composeContextMenu();
    this.tray.setContextMenu(this.menu);
    this.tray.setToolTip(this.composeTooltip());
    this.tray.setImage(this.getTrayIcon());
  }

  private composeContextMenu(): Menu {
    const menuTmpl = this.buildMenuTempl();

    // update menu for recording state
    const menuStartCapt = this.getMenuItemTemplById(menuTmpl, 'start-capture');
    menuStartCapt.visible = !this.recording;
    menuStartCapt.accelerator = this.prefs?.shortcut;

    const menuStopCapt = this.getMenuItemTemplById(menuTmpl, 'stop-capture');
    menuStopCapt.visible = this.recording;
    menuStopCapt.accelerator = this.prefs?.shortcut;

    // update menu for updater
    const menuCheckUpdate = this.getMenuItemTemplById(menuTmpl, 'check-update');
    const menuUpdate = this.getMenuItemTemplById(menuTmpl, 'update');
    const menuSeparator = this.getMenuItemTemplById(menuTmpl, 'separator1');
    if (!this.checkable && !this.updatable) {
      menuCheckUpdate.visible = false;
      menuUpdate.visible = false;
      menuSeparator.visible = false;
    } else if (this.updatable) {
      menuCheckUpdate.visible = false;
      menuUpdate.visible = true;
      menuSeparator.visible = true;
    } else {
      menuCheckUpdate.visible = true;
      menuUpdate.visible = false;
      menuSeparator.visible = true;
    }

    return Menu.buildFromTemplate(menuTmpl);
  }

  private composeTooltip(): string {
    if (this.recording) {
      return TOOLTIP_RECORDING;
    }
    if (this.updatable) {
      return TOOLTIP_UPDATE;
    }
    return TOOLTIP_GREETING;
  }

  private getTrayIcon(): NativeImage {
    let iconName: TrayIconType = 'default';
    if (this.recording) {
      iconName = 'recording';
    } else if (this.updatable) {
      iconName = 'updatable';
    }
    return this.iconProvider.icon(iconName);
  }

  private getMenuItemTemplById(
    contextMenuTempl: any,
    id: string
  ): MenuItemConstructorOptions | MenuItem {
    return contextMenuTempl.find((m: any) => m.id === id);
  }

  private makeAsTimeString = (h: number, m: number, s: number): string => {
    const hh = `${h}`.padStart(2, '0');
    const mm = `${m}`.padStart(2, '0');
    const ss = `${s}`.padStart(2, '0');
    return h > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
  };
}
