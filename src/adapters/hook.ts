/* eslint-disable prettier/prettier */

import { inject, injectable } from 'inversify';
import {
  app,
  desktopCapturer,
  globalShortcut,
  systemPreferences,
} from 'electron';

import TYPES from '@di/types';

import {
  CaptureMode,
  CaptureStatus,
  OutputFormat,
} from '@domain/models/common';
import { Preferences } from '@domain/models/preferences';

import CheckUpdateUseCase from '@application/usecases/CheckUpdate';
import CheckVersionUseCase from '@application/usecases/CheckVersion';

import HookManager, {
  HookArgsAppUpdateChecked,
  HookArgsAppUpdated,
  HookArgsInitialPrefsLoaded,
  HookArgsPrefsLoaded,
  HookArgsPrefsUpdated,
  HookArgsCaptureStarting,
  HookArgsCaptureFinishing,
  HookArgsCaptureFinished,
} from '@application/services/hook';
import PreferencesRepository from '@adapters/repositories/preferences';
import { AnalyticsTracker } from '@application/ports/tracker';
import { UiDirector } from '@application/ports/director';
import { ActionDispatcher } from '@application/ports/action';

import { getPlatform, isDebugMode, isMac } from '@utils/process';
import { getTimeInSeconds } from '@utils/date';
import {
  SHORTCUT_CAPTURE_MODE_AREA,
  SHORTCUT_CAPTURE_MODE_SCREEN,
  SHORTCUT_ENTER,
  SHORTCUT_ESCAPE,
  SHORTCUT_OUTPUT_GIF,
  SHORTCUT_OUTPUT_MP4,
} from '@utils/shortcut';

const UPDATE_CHECK_DELAY = 5 * 60 * 1000;
const UPDATE_CHECK_INTERVAL = 4 * 60 * 60 * 1000;

@injectable()
export default class BuiltinHooks {
  private lastUpdateCheckedAt?: number;

  constructor(
    @inject(TYPES.PreferencesRepository) private prefsRepo: PreferencesRepository,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector,
    @inject(TYPES.AnalyticsTracker) private tracker: AnalyticsTracker,
    @inject(TYPES.ActionDispatcher) private actionDispatcher: ActionDispatcher,
    private hookManager: HookManager,
    private checkUpdateUseCase: CheckUpdateUseCase,
    private checkVersionUseCase: CheckVersionUseCase
  ) {
    this.hookManager.on('app-launched', this.onAppLaunched);
    this.hookManager.on('app-quit', this.onAppQuit);
    this.hookManager.on('app-update-checked', this.onAppUpdateChecked);
    this.hookManager.on('app-updated', this.onAppUpdated);
    this.hookManager.on('initial-prefs-loaded', this.onInitialPrefsLoaded);
    this.hookManager.on('prefs-loaded', this.onPrefsLoaded);
    this.hookManager.on('prefs-updated', this.onPrefsUpdated);
    this.hookManager.on('prefs-modal-opening', this.onPrefsModalOpening);
    this.hookManager.on('capture-options-changed', this.onCaptureOptionsChanged);
    this.hookManager.on('capture-shortcut-triggered', this.onCaptureShortcutTriggered);
    this.hookManager.on('capture-mode-enabled', this.onCaptureModeEnabled);
    this.hookManager.on('capture-mode-disabled', this.onCaptureModeDisabled);
    this.hookManager.on('capture-selection-starting', this.onCaptureSelectionStarting);
    this.hookManager.on('capture-selection-finished', this.onCaptureSelectionFinished);
    this.hookManager.on('capture-starting', this.onCaptureStarting);
    this.hookManager.on('capture-finishing', this.onCaptureFinishing);
    this.hookManager.on('capture-finished', this.onCaptureFinished);
  }

  onAppLaunched = async () => {
    await this.checkVersionUseCase.execute();

    this.uiDirector.refreshTrayState(
      await this.prefsRepo.fetchUserPreferences()
    );

    this.tracker.eventL('app-lifecycle', 'launch', getPlatform());
    this.tracker.view('idle');
  };

  onAppQuit = async () => {
    this.tracker.event('app-lifecycle', 'quit');
  };

  onAppUpdateChecked = async (args: HookArgsAppUpdateChecked) => {
    this.uiDirector.refreshTrayState(
      await this.prefsRepo.fetchUserPreferences(),
      args.updateAvailable
    );

    this.lastUpdateCheckedAt = getTimeInSeconds();
  };

  onAppUpdated = async (_args: HookArgsAppUpdated) => {
    await this.uiDirector.openReleaseNotesModal();
  };

  onInitialPrefsLoaded = async (_args: HookArgsInitialPrefsLoaded) => {
    this.tracker.eventL('app-lifecycle', 'initial-launch', getPlatform());
  };

  onPrefsLoaded = async (args: HookArgsPrefsLoaded) => {
    await this.handlePrefsHook(args.loadedPrefs);
  };

  onPrefsUpdated = async (args: HookArgsPrefsUpdated) => {
    await this.handlePrefsHook(args.newPrefs, args.prevPrefs);
  };

  onPrefsModalOpening = async () => {
    this.tracker.view('preferences-modal');
  };

  onCaptureOptionsChanged = async () => {
    const prefs = await this.prefsRepo.fetchUserPreferences();
    this.tracker.eventL(
      'capture',
      'options-changed',
      `mode:${prefs.captureMode}`
    );
    this.tracker.eventL(
      'capture',
      'options-changed',
      `outfmt:${prefs.outputFormat}`
    );
  };

  onCaptureShortcutTriggered = async () => {
    const prefs = await this.prefsRepo.fetchUserPreferences();
    this.tracker.eventL('capture', 'shortcut-triggered', prefs.shortcut);
  };

  onCaptureModeEnabled = async () => {
    await this.setupInSelectionShortcut(true);
  };

  onCaptureModeDisabled = async () => {
    await this.setupInSelectionShortcut(false);
  };

  onCaptureSelectionStarting = async () => {
    this.tracker.view('capture-area-selection');
  };

  onCaptureSelectionFinished = async () => {};

  onCaptureStarting = async (args: HookArgsCaptureStarting) => {
    // disable in selection shortcut
    await this.setupInSelectionShortcut(false);

    // refresh tray
    const { status } = args.captureContext;
    await this.uiDirector.refreshTrayState(
      await this.prefsRepo.fetchUserPreferences(),
      undefined,
      status === CaptureStatus.IN_PROGRESS
    );

    if (status === CaptureStatus.IN_PROGRESS) {
      this.uiDirector.toggleRecordingTime(true);
    }

    // tracking
    if (status === CaptureStatus.IN_PROGRESS) {
      const { target, outputFormat, recordMicrophone, lowQualityMode } =
        args.captureContext;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { width, height } = target.bounds!;
      this.tracker.eventL('capture', 'start-capture', `mode:${target.mode}`);
      this.tracker.eventL('capture', 'start-capture', `area:${width}x${height}`);
      this.tracker.eventL('capture', 'start-capture', `outfmt:${outputFormat}`);
      this.tracker.eventL('capture', 'start-capture', `mic:${String(recordMicrophone)}`);
      this.tracker.eventL('capture', 'start-capture', `lowqual:${String(lowQualityMode)}`);
      this.tracker.view('in-recording');
    } else if (status === CaptureStatus.ERROR) {
      this.tracker.eventL('capture', 'start-capture', 'fail');
    }
  };

  onCaptureFinishing = async (_args: HookArgsCaptureFinishing) => {
    await this.uiDirector.refreshTrayState(
      await this.prefsRepo.fetchUserPreferences(),
      undefined,
      false
    );

    this.uiDirector.toggleRecordingTime(false);
  };

  onCaptureFinished = async (args: HookArgsCaptureFinished) => {
    const now = getTimeInSeconds();
    if (
      this.lastUpdateCheckedAt === undefined ||
      now - this.lastUpdateCheckedAt > UPDATE_CHECK_INTERVAL
    ) {
      setTimeout(() => {
        this.checkUpdateUseCase.execute();
      }, UPDATE_CHECK_DELAY);
    }

    const { status, createdAt, finishedAt } = args.captureContext;
    if (status === CaptureStatus.FINISHED) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const duration = finishedAt! - createdAt;
      this.tracker.eventLV('capture', 'finish-capture', 'duration', duration);
    } else if (status === CaptureStatus.ERROR) {
      this.tracker.eventL('capture', 'finish-capture', 'fail');
    }
    this.tracker.view('idle');
  };

  private handlePrefsHook = async (
    newPrefs: Preferences,
    prevPrefs?: Preferences
  ): Promise<void> => {
    this.setupCaptureShortcut(newPrefs, prevPrefs);
    this.setupRunAtStartup(newPrefs);
    await this.askMediaAccess(newPrefs);
    await this.uiDirector.refreshTrayState(newPrefs);
  };

  private handleShortcutCaptureOpts = async (
    mode?: CaptureMode,
    fmt?: OutputFormat
  ) => {
    const prefs = await this.prefsRepo.fetchUserPreferences();
    const recOpts = this.prefsRepo.getRecOptionsFromPrefs(prefs);
    this.actionDispatcher.changeCaptureOptions({
      target: { mode: mode ?? prefs.captureMode },
      recordOptions: {
        ...recOpts,
        enableOutputAsGif: (fmt ?? prefs.outputFormat) === 'gif',
      },
    });
  };

  private setupInSelectionShortcut = async (enable: boolean) => {
    if (enable) {
      globalShortcut.register(SHORTCUT_ENTER, () =>
        this.actionDispatcher.startCaptureWithCurrentStates()
      );

      globalShortcut.register(SHORTCUT_ESCAPE, () =>
        this.actionDispatcher.disableCaptureMode()
      );

      globalShortcut.register(SHORTCUT_CAPTURE_MODE_SCREEN, () =>
        this.handleShortcutCaptureOpts(CaptureMode.SCREEN)
      );

      globalShortcut.register(SHORTCUT_CAPTURE_MODE_AREA, () =>
        this.handleShortcutCaptureOpts(CaptureMode.AREA)
      );

      globalShortcut.register(SHORTCUT_OUTPUT_MP4, () =>
        this.handleShortcutCaptureOpts(undefined, 'mp4')
      );

      globalShortcut.register(SHORTCUT_OUTPUT_GIF, () =>
        this.handleShortcutCaptureOpts(undefined, 'gif')
      );
    } else {
      globalShortcut.unregister(SHORTCUT_ENTER);
      globalShortcut.unregister(SHORTCUT_ESCAPE);
      globalShortcut.unregister(SHORTCUT_CAPTURE_MODE_SCREEN);
      globalShortcut.unregister(SHORTCUT_CAPTURE_MODE_AREA);
      globalShortcut.unregister(SHORTCUT_OUTPUT_MP4);
      globalShortcut.unregister(SHORTCUT_OUTPUT_GIF);
    }
  };

  private setupCaptureShortcut = (
    newPrefs: Preferences,
    prevPrefs?: Preferences
  ): void => {
    if (!prevPrefs || prevPrefs.shortcut !== newPrefs.shortcut) {
      if (prevPrefs) {
        globalShortcut.unregister(
          prevPrefs.shortcut.replace(/Win|Cmd/, 'Meta')
        );
      }
      globalShortcut.register(
        newPrefs.shortcut.replace(/Win|Cmd/, 'Meta'),
        this.actionDispatcher.onCaptureToggleShortcut
      );
    }
  };

  private setupRunAtStartup = (prefs: Preferences): void => {
    if (isDebugMode()) {
      return;
    }

    app.setLoginItemSettings({
      openAtLogin: prefs.runAtStartup,
      path: app.getPath('exe'),
    });
  };

  private askMediaAccess = async (prefs: Preferences): Promise<void> => {
    const screenAccess = systemPreferences.getMediaAccessStatus('screen');
    if (screenAccess !== 'granted') {
      await desktopCapturer.getSources({ types: ['screen'] });
    }

    if (prefs.recordMicrophone && isMac()) {
      const micAccess = systemPreferences.getMediaAccessStatus('microphone');
      if (micAccess !== 'granted') {
        systemPreferences.askForMediaAccess('microphone');
      }
    }
  };
}
