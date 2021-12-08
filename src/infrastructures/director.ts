/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable no-plusplus */
/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-return-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import fs from 'fs';
import { injectable } from 'inversify';
import { app, shell } from 'electron';

import { IBounds } from '@core/entities/screen';
import { IPreferences } from '@core/entities/preferences';
import { IUiDirector } from '@core/interfaces/director';

import { StaticPagePopupOptions } from '@ui/widgets/staticpage/shared';
import CachedWidget from '@ui/widgets/cached';
import AppTray from '@ui/widgets/tray';
import ControlPanel from '@ui/widgets/ctrlpanel';
import CaptureOverlay from '@ui/widgets/overlays';
import PreferencesModal from '@ui/widgets/preferences';
import ProgressDialog from '@ui/widgets/progressdialog';
import StaticPagePopup from '@ui/widgets/staticpage';

import { assetPathResolver } from '@utils/asset';
import { getOverlayScreenBounds, SPARE_PIXELS } from '@utils/bounds';
import { shortcutForDisplay } from '@utils/shortcut';
import { isMac } from '@utils/process';
import { getTimeInSeconds } from '@utils/date';

import { version as curVersion } from '../package.json';

class CaptureOverlayWrap {
  private widget?: CaptureOverlay;

  constructor() {
    this.widget = new CaptureOverlay();
  }

  show(screenBounds: IBounds) {
    this.widget?.setIgnoreMouseEvents(false);
    this.widget?.show();

    // WORKAROUND: https://github.com/electron/electron/issues/10862
    const sparedBounds = this.addSparePixels(screenBounds);
    for (let i = 0; i < 5; i++) {
      this.widget?.setBounds(sparedBounds);
    }
  }

  hide() {
    // should wait for react component rerender
    setTimeout(() => {
      this.widget?.hide();
    }, 500);
  }

  close() {
    this.widget?.close();
  }

  ignoreMouseEvents() {
    this.widget?.setIgnoreMouseEvents(true);
  }

  blur() {
    this.widget?.blur();
  }

  // WORKAROUND: to fix non-clickable area at the nearest borders
  // Same issue here: https://github.com/electron/electron/issues/21929
  private addSparePixels(bounds: IBounds): IBounds {
    return {
      x: bounds.x - SPARE_PIXELS,
      y: bounds.y - SPARE_PIXELS,
      width: bounds.width + SPARE_PIXELS * 2,
      height: bounds.height + SPARE_PIXELS * 2,
    };
  }
}

class CachedStaticPagePopup extends CachedWidget<
  StaticPagePopup,
  StaticPagePopupOptions,
  void
> {}

class CachedPreferencesModal extends CachedWidget<
  PreferencesModal,
  IPreferences,
  IPreferences
> {}

@injectable()
export class UiDirector implements IUiDirector {
  private appTray?: AppTray;
  private controlPanel?: ControlPanel;
  private captureOverlay?: CaptureOverlayWrap;
  private updateProgressDialog?: ProgressDialog;
  private preferencesModal?: CachedPreferencesModal;
  private aboutPopup?: CachedStaticPagePopup;
  private aboutContent?: string;
  private relNotePopup?: CachedStaticPagePopup;
  private relNoteContent?: string;
  private helpPopup?: CachedStaticPagePopup;
  private helpContent?: string;
  private recTimeHandle?: NodeJS.Timer;
  private recTimeStart?: number;

  initialize(): void {
    this.appTray = AppTray.create();
    this.controlPanel = new ControlPanel();
    this.captureOverlay = new CaptureOverlayWrap();
    this.preferencesModal = new CachedPreferencesModal(PreferencesModal, 600);
    this.aboutPopup = new CachedStaticPagePopup(StaticPagePopup, 300);
    this.relNotePopup = new CachedStaticPagePopup(StaticPagePopup, 300);
    this.helpPopup = new CachedStaticPagePopup(StaticPagePopup, 300);
  }

  async refreshTrayState(
    prefs: IPreferences,
    updatable?: boolean,
    recording?: boolean
  ): Promise<void> {
    await this.appTray?.refreshContextMenu(
      prefs.shortcut,
      updatable,
      recording,
      {
        enableLowQualityMode: prefs.recordQualityMode === 'low',
        enableOutputAsGif: prefs.outputFormat === 'gif',
        enableRecordMicrophone: prefs.recordMicrophone,
      }
    );
  }

  toggleRecordingTime(activate: boolean): void {
    if (!isMac()) {
      return;
    }

    if (activate) {
      this.recTimeStart = getTimeInSeconds();
      this.recTimeHandle = setInterval(() => {
        if (this.recTimeStart !== undefined) {
          const now = getTimeInSeconds();
          this.appTray?.refreshRecTime(now - this.recTimeStart);
        }
      }, 1000);
      this.appTray?.refreshRecTime(0);
    } else if (this.recTimeHandle) {
      clearInterval(this.recTimeHandle);
      this.recTimeHandle = undefined;
      this.recTimeStart = undefined;
      this.appTray?.refreshRecTime(undefined);
    }
  }

  quitApplication(): void {
    this.captureOverlay?.close();
    this.preferencesModal?.close();
    this.aboutPopup?.close();
    this.relNotePopup?.close();
    this.helpPopup?.close();

    app.quit();
  }

  async openAboutPagePopup(prefs: IPreferences): Promise<void> {
    if (this.aboutContent === undefined) {
      const aboutHtmlPath = assetPathResolver('docs/about.html');
      this.aboutContent = (await fs.promises.readFile(aboutHtmlPath, 'utf-8'))
        .replace('__shortcut__', shortcutForDisplay(prefs.shortcut))
        .replace('__version__', curVersion);
    }

    this.aboutPopup?.open({
      width: 300,
      height: 240,
      html: this.aboutContent,
    });
  }

  async openReleaseNotesPopup(): Promise<void> {
    if (this.relNoteContent === undefined) {
      const relNotePath = assetPathResolver('docs/relnote.md');
      this.relNoteContent = await fs.promises.readFile(relNotePath, 'utf-8');
    }

    this.relNotePopup?.open({
      width: 440,
      height: 480,
      markdown: this.relNoteContent,
    });
  }

  async openHelpPagePopup(): Promise<void> {
    if (this.helpContent === undefined) {
      const helpHtmlPath = assetPathResolver('docs/help.html');
      this.helpContent = (
        await fs.promises.readFile(helpHtmlPath, 'utf-8')
      ).replace('__assets__', assetPathResolver(''));
    }

    this.helpPopup?.open({
      width: 600,
      height: 800,
      html: this.helpContent,
    });
  }

  async openPreferencesModal(
    prefs: IPreferences,
    onSave: (updatedPrefs: IPreferences) => void
  ): Promise<void> {
    await this.preferencesModal?.openAsModal(prefs, onSave);
  }

  enableCaptureSelectionMode(): IBounds {
    const screenBounds = getOverlayScreenBounds();
    this.controlPanel?.show();
    this.captureOverlay?.show(screenBounds);
    return screenBounds;
  }

  disableCaptureSelectionMode(): void {
    this.controlPanel?.hide();
    this.captureOverlay?.hide();
  }

  enableRecordingMode(): void {
    this.captureOverlay?.ignoreMouseEvents();
    this.captureOverlay?.blur();
  }

  showItemInFolder(path: string): void {
    shell.showItemInFolder(path);
  }

  async startDownloadAndInstall(
    onReady: () => void,
    onCancel: () => void,
    onQuitAndInstall: () => void
  ): Promise<void> {
    this.updateProgressDialog = new ProgressDialog({
      title: 'Update Download',
      message: 'Downloading a new update...',
      buttons: {
        cancelTitle: 'Cancel',
        actionTitle: 'Quit & Install',
        actionHideInProgress: true,
      },
      timeout: 300,
      width: 400,
      height: 200,
    });

    this.updateProgressDialog?.on('ready-to-show', () => {
      onReady();
    });

    const shouldUpdate = await this.updateProgressDialog?.open();
    this.updateProgressDialog?.destroy();
    this.updateProgressDialog = undefined;

    if (shouldUpdate) {
      onQuitAndInstall();
      // WORKAROUND: to make sure app quits completely
      setTimeout(() => this.quitApplication(), 500);
    } else {
      onCancel();
    }
  }

  setUpdateDownloadProgress(percent: number): void {
    this.updateProgressDialog?.setProgress(percent);
  }
}
