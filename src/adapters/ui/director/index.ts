import fs from 'fs';

import { app, shell } from 'electron';
import { injectable } from 'inversify';

import { assetPathResolver } from '@utils/asset';
import { getAllScreens, getScreenCursorOn } from '@utils/bounds';
import { getTimeInSeconds } from '@utils/date';
import { isMac } from '@utils/process';
import { shortcutForDisplay } from '@utils/shortcut';

import diContainer from '@di/containers';
import TYPES from '@di/types';

import { CaptureMode } from '@domain/models/common';
import { Preferences } from '@domain/models/preferences';
import { Screen } from '@domain/models/screen';

import { UiDirector } from '@application/ports/director';
import { AppTray } from '@application/ports/tray';

import ElectronUiStateApplier from '@adapters/state';
import CaptureOverlayWrap from '@adapters/ui/director/overlay';
import PreferencesModal from '@adapters/ui/widgets/preferences';
import ProgressDialog from '@adapters/ui/widgets/progressdialog';
import StaticPageModal from '@adapters/ui/widgets/staticpage';

import { version as curVersion } from '../../../package.json';

@injectable()
export default class ElectronUiDirector implements UiDirector {
  private appTray?: AppTray;
  private captureOverlay?: CaptureOverlayWrap;

  private aboutModal?: StaticPageModal;
  private helpModal?: StaticPageModal;
  private relNoteModal?: StaticPageModal;
  private prefsModal?: PreferencesModal;
  private updateProgressDialog?: ProgressDialog;
  private postProcessDialog?: ProgressDialog;

  private screenBoundsDetector?: ReturnType<typeof setInterval>;
  private recTimeHandle?: ReturnType<typeof setInterval>;
  private recTimeStart?: number;

  // eslint-disable-next-line no-useless-constructor
  constructor(private uiStateApplier: ElectronUiStateApplier) {}

  initialize(): void {
    this.appTray = diContainer.get<AppTray>(TYPES.AppTray);

    this.captureOverlay = new CaptureOverlayWrap(this.uiStateApplier);

    this.postProcessDialog = new ProgressDialog({
      title: 'Processing',
      message: '',
      buttons: {
        cancelTitle: 'Abort',
      },
      timeout: 300,
      width: 400,
      height: 200,
    });
  }

  async refreshTrayState(
    prefs: Preferences,
    updatable?: boolean,
    recording?: boolean
  ): Promise<void> {
    await this.appTray?.refreshContextMenu(
      prefs.shortcut,
      updatable,
      recording
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

  async openAboutPageModal(prefs: Preferences): Promise<void> {
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
    preferences: Preferences,
    onSave: (updatedPrefs: Preferences) => void
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
    onActiveScreenBoundsChange: (
      screens: Screen[],
      screenCursorOn?: Screen
    ) => void
  ): void {
    this.resetScreenBoundsDetector();

    const screens = getAllScreens();
    let lastScreenId: number;

    this.captureOverlay?.show();
    this.screenBoundsDetector = setInterval(() => {
      const screenCursorOn = getScreenCursorOn();
      this.captureOverlay?.focus(lastScreenId);

      if (!lastScreenId || lastScreenId !== screenCursorOn.id) {
        lastScreenId = screenCursorOn.id;
        if (mode === CaptureMode.AREA) {
          onActiveScreenBoundsChange(screens);
        } else {
          onActiveScreenBoundsChange(screens, screenCursorOn);
        }
      }
    }, 100);
  }

  disableCaptureMode(): void {
    this.resetScreenBoundsDetector();
    this.captureOverlay?.blur();
    this.captureOverlay?.hide();
  }

  startTargetSelection(): void {
    this.resetScreenBoundsDetector();
  }

  resetScreenBoundsDetector(): void {
    if (this.screenBoundsDetector) {
      clearInterval(this.screenBoundsDetector);
      this.screenBoundsDetector = undefined;
    }
  }

  enableUserInteraction(): void {
    this.captureOverlay?.blur();
    this.captureOverlay?.ignoreMouseEvents();
  }

  revealItemInFolder(path: string): void {
    shell.showItemInFolder(path);
  }

  revealFolder(path: string): void {
    shell.openPath(path);
  }

  async startDownloadAndInstall(
    onReady: () => void,
    onCancel: () => void,
    onQuitAndInstall: () => void
  ): Promise<void> {
    this.updateProgressDialog = new ProgressDialog(
      {
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
      },
      onReady
    );

    const shouldUpdate = await this.updateProgressDialog?.open();
    this.updateProgressDialog?.destroy();
    this.updateProgressDialog = undefined;

    if (shouldUpdate) {
      onQuitAndInstall();
      // WORKAROUND: to make sure app quits completely
      setTimeout(() => this.quitApplication(), 2000);
    } else {
      onCancel();
    }
  }

  progressUpdateDownload(percent: number): void {
    this.updateProgressDialog?.setProgress(percent);
  }

  async openPostProcessDialog(): Promise<boolean> {
    if (!this.postProcessDialog) {
      return false;
    }
    return this.postProcessDialog.open();
  }

  closePostProcessDialog(): void {
    this.postProcessDialog?.close();
  }

  progressPostProcess(percent: number): void {
    this.postProcessDialog?.setProgress(percent);
  }

  updatePostProcessMsg(message: string): void {
    this.postProcessDialog?.setMessage(message);
  }
}
