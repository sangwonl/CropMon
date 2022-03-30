import fs from 'fs';
import { injectable } from 'inversify';
import { app, shell } from 'electron';

import { CaptureMode } from '@core/entities/common';
import { IBounds } from '@core/entities/screen';
import { IPreferences } from '@core/entities/preferences';
import { IUiDirector } from '@core/services/director';

import CaptureOverlayWrap from '@infrastructures/director/overlay';
import AppTray, { createTray } from '@ui/widgets/tray';
import ControlPanel from '@ui/widgets/ctrlpanel';
import ProgressDialog from '@ui/widgets/progressdialog';
import StaticPageModal from '@ui/widgets/staticpage';
import PreferencesModal from '@ui/widgets/preferences';

import { assetPathResolver } from '@utils/asset';
import { getScreenOfCursor, getWholeScreenBounds } from '@utils/bounds';
import { shortcutForDisplay } from '@utils/shortcut';
import { isMac } from '@utils/process';
import { getTimeInSeconds } from '@utils/date';

import { version as curVersion } from '../../package.json';

@injectable()
export default class UiDirector implements IUiDirector {
  private appTray?: AppTray;
  private controlPanel?: ControlPanel;
  private captureOverlay?: CaptureOverlayWrap;

  private aboutModal?: StaticPageModal;
  private helpModal?: StaticPageModal;
  private relNoteModal?: StaticPageModal;
  private prefsModal?: PreferencesModal;
  private updateProgressDialog?: ProgressDialog;

  private recTimeHandle?: NodeJS.Timer;
  private recTimeStart?: number;
  private screenBoundsDetector?: NodeJS.Timer;

  initialize(): void {
    this.appTray = createTray();
    this.controlPanel = new ControlPanel();
    this.captureOverlay = new CaptureOverlayWrap();
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
        enableMicrophone: prefs.recordMicrophone,
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
        if (this.recTimeStart) {
          const now = getTimeInSeconds();
          this.appTray?.refreshRecTime(now - this.recTimeStart);
        }
      }, 1000);
      this.appTray?.refreshRecTime(0);
    } else if (this.recTimeHandle) {
      clearInterval(this.recTimeHandle);
      this.recTimeHandle = undefined;
      this.recTimeStart = undefined;
      this.appTray?.refreshRecTime();
    }
  }

  quitApplication(): void {
    app.quit();
  }

  async openAboutPageModal(prefs: IPreferences): Promise<void> {
    if (this.aboutModal) {
      this.aboutModal.focus();
      return;
    }

    const aboutHtmlPath = assetPathResolver('docs/about.html');
    const aboutContent = (await fs.promises.readFile(aboutHtmlPath, 'utf-8'))
      .replace('__shortcut__', shortcutForDisplay(prefs.shortcut))
      .replace('__version__', curVersion);

    this.aboutModal = StaticPageModal.create({
      width: 300,
      height: 240,
      html: aboutContent,
    });

    await this.aboutModal.doModal();

    this.aboutModal = undefined;
  }

  async openReleaseNotesModal(): Promise<void> {
    if (this.relNoteModal) {
      this.relNoteModal.focus();
      return;
    }

    const relNotePath = assetPathResolver('docs/relnote.md');
    const relNoteContent = await fs.promises.readFile(relNotePath, 'utf-8');

    this.relNoteModal = StaticPageModal.create({
      width: 440,
      height: 480,
      markdown: relNoteContent,
    });

    await this.relNoteModal.doModal();

    this.relNoteModal = undefined;
  }

  async openHelpPageModal(): Promise<void> {
    if (this.helpModal) {
      this.helpModal.focus();
      return;
    }

    const helpHtmlPath = assetPathResolver('docs/help.html');
    const helpContent = (
      await fs.promises.readFile(helpHtmlPath, 'utf-8')
    ).replace('__assets__', assetPathResolver(''));

    this.helpModal = StaticPageModal.create({
      width: 600,
      height: 800,
      html: helpContent,
    });

    await this.helpModal.doModal();

    this.helpModal = undefined;
  }

  async openPreferencesModal(
    preferences: IPreferences,
    onSave: (updatedPrefs: IPreferences) => void
  ): Promise<void> {
    if (this.prefsModal) {
      this.prefsModal.focus();
      return;
    }

    this.prefsModal = PreferencesModal.create({ preferences });

    await this.prefsModal.doModal(onSave);

    this.prefsModal = undefined;
  }

  enableCaptureMode(
    mode: CaptureMode,
    onActiveScreenBoundsChange: (bounds: IBounds, screenId?: number) => void
  ): void {
    this.resetScreenBoundsDetector();

    if (mode === CaptureMode.AREA) {
      const screenBounds = getWholeScreenBounds();

      onActiveScreenBoundsChange(screenBounds);

      this.captureOverlay?.show(screenBounds);
      this.controlPanel?.show();

      return;
    }

    if (mode === CaptureMode.SCREEN) {
      let lastScreenId: number;
      this.screenBoundsDetector = setInterval(() => {
        const screen = getScreenOfCursor();
        if (lastScreenId && lastScreenId === screen.id) {
          return;
        }

        onActiveScreenBoundsChange(screen.bounds, screen.id);

        this.captureOverlay?.show(screen.bounds);
        this.controlPanel?.show();

        lastScreenId = screen.id;
      }, 100);
    }
  }

  disableCaptureMode(): void {
    this.resetScreenBoundsDetector();
    this.controlPanel?.hide();
    this.captureOverlay?.hide();
  }

  startTargetSelection(): void {
    this.resetScreenBoundsDetector();
    this.controlPanel?.hide();
  }

  resetScreenBoundsDetector(): void {
    if (this.screenBoundsDetector) {
      clearInterval(this.screenBoundsDetector);
      this.screenBoundsDetector = undefined;
    }
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
