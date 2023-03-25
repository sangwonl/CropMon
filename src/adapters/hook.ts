/* eslint-disable prettier/prettier */

import {
  app,
  desktopCapturer,
  globalShortcut,
  systemPreferences,
} from 'electron';
import { inject, injectable } from 'inversify';

import { getTimeInSeconds } from '@utils/date';
import { getPlatform, isDebugMode, isMac } from '@utils/process';
import {
  SHORTCUT_CAPTURE_MODE_AREA,
  SHORTCUT_CAPTURE_MODE_SCREEN,
  SHORTCUT_ENTER,
  SHORTCUT_ESCAPE,
  SHORTCUT_OUTPUT_GIF,
  SHORTCUT_OUTPUT_MP4,
} from '@utils/shortcut';

import TYPES from '@di/types';

import {
  CaptureMode,
  OutputFormat,
} from '@domain/models/common';
import { Preferences } from '@domain/models/preferences';

import { ActionDispatcher } from '@application/ports/action';
import { UiDirector } from '@application/ports/director';
import { AnalyticsTracker } from '@application/ports/tracker';
import HookManager, {
  HookArgsAppUpdateChecked,
  HookArgsAppUpdated,
  HookArgsInitialPrefsLoaded,
  HookArgsPrefsLoaded,
  HookArgsPrefsUpdated,
  HookArgsCaptureModeEnabled,
  HookArgsCaptureStarting,
  HookArgsCaptureFinishing,
  HookArgsCaptureFinished,
  HookArgsCaptureOptionsChanged,
} from '@application/services/hook';
import CheckUpdateUseCase from '@application/usecases/CheckUpdate';
import CheckVersionUseCase from '@application/usecases/CheckVersion';

import PreferencesRepository from '@adapters/repositories/preferences';


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
    this.hookManager.on('onAppLaunched', this.onAppLaunched);
    this.hookManager.on('onAppQuit', this.onAppQuit);
    this.hookManager.on('onAppUpdateChecked', this.onAppUpdateChecked);
    this.hookManager.on('onAppUpdated', this.onAppUpdated);
    this.hookManager.on('onInitialPrefsLoaded', this.onInitialPrefsLoaded);
    this.hookManager.on('onPrefsLoaded', this.onPrefsLoaded);
    this.hookManager.on('onPrefsUpdated', this.onPrefsUpdated);
    this.hookManager.on('onPrefsModalOpening', this.onPrefsModalOpening);
    this.hookManager.on('onCaptureOptionsChanged', this.onCaptureOptionsChanged);
    this.hookManager.on('onCaptureShortcutTriggered', this.onCaptureShortcutTriggered);
    this.hookManager.on('onCaptureModeEnabled', this.onCaptureModeEnabled);
    this.hookManager.on('onCaptureModeDisabled', this.onCaptureModeDisabled);
    this.hookManager.on('onCaptureSelectionStarting', this.onCaptureSelectionStarting);
    this.hookManager.on('onCaptureSelectionFinished', this.onCaptureSelectionFinished);
    this.hookManager.on('onCaptureStarting', this.onCaptureStarting);
    this.hookManager.on('onCaptureFinishing', this.onCaptureFinishing);
    this.hookManager.on('onCaptureFinished', this.onCaptureFinished);
  }

  onAppLaunched = async () => {
    await this.checkVersionUseCase.execute();

    this.uiDirector.refreshTrayState(
      await this.prefsRepo.fetchPreferences()
    );

    this.tracker.eventL('app-lifecycle', 'launch', getPlatform());
    this.tracker.view('idle');
  };

  onAppQuit = async () => {
    this.tracker.event('app-lifecycle', 'quit');
  };

  onAppUpdateChecked = async (args: HookArgsAppUpdateChecked) => {
    this.uiDirector.refreshTrayState(
      await this.prefsRepo.fetchPreferences(),
      args.updateAvailable
    );

    this.lastUpdateCheckedAt = getTimeInSeconds();
  };

  onAppUpdated = async (_args: HookArgsAppUpdated) => {
    await this.uiDirector.openReleaseNotes();
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

  onCaptureOptionsChanged = async (args: HookArgsCaptureOptionsChanged) => {
    await this.setupInSelectionShortcut(true, args.captureMode);

    const prefs = await this.prefsRepo.fetchPreferences();
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
    const prefs = await this.prefsRepo.fetchPreferences();
    this.tracker.eventL('capture', 'shortcut-triggered', prefs.shortcut);
  };

  onCaptureModeEnabled = async (args: HookArgsCaptureModeEnabled) => {
    await this.setupInSelectionShortcut(true, args.captureMode);
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
    const { error } = args;

    await this.uiDirector.refreshTrayState(
      await this.prefsRepo.fetchPreferences(),
      undefined,
      !error
    );

    if (!error) {
      this.uiDirector.toggleRecordingTime(true);
    }

    // tracking
    if (!error) {
      const { target, outputFormat, audioSources } =
        args.captureContext;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { width, height } = target.bounds!;
      this.tracker.eventL('capture', 'start-capture', `mode:${target.mode}`);
      this.tracker.eventL('capture', 'start-capture', `area:${width}x${height}`);
      this.tracker.eventL('capture', 'start-capture', `outfmt:${outputFormat}`);
      this.tracker.eventL('capture', 'start-capture', `audio:${audioSources.map((s) => s.name).join(',')}`);
      this.tracker.view('in-recording');
    } else {
      this.tracker.eventL('capture', 'start-capture', 'fail');
    }
  };

  onCaptureFinishing = async (_args: HookArgsCaptureFinishing) => {
    await this.uiDirector.refreshTrayState(
      await this.prefsRepo.fetchPreferences(),
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

    const { captureContext, error } = args;

    if (!error) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const duration = captureContext.finishedAt! - captureContext.createdAt;
      this.tracker.eventLV('capture', 'finish-capture', 'duration', duration);
    } else {
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
    const prefs = await this.prefsRepo.fetchPreferences();
    const recOpts = this.prefsRepo.getRecOptionsFromPrefs(prefs);
    this.actionDispatcher.changeCaptureOptions({
      target: { mode: mode ?? prefs.captureMode },
      recordOptions: {
        ...recOpts,
        outputAsGif: (fmt ?? prefs.outputFormat) === 'gif',
      },
    });
  };

  private setupInSelectionShortcut = async (enable: boolean, captureMode?: CaptureMode) => {
    if (enable) {
      if (captureMode === CaptureMode.SCREEN) {
        globalShortcut.register(SHORTCUT_ENTER, () =>
          this.actionDispatcher.startCaptureWithCurrentStates()
        );
      }

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

    const needMic = prefs.audioSources.length > 0;
    if (needMic && isMac()) {
      const micAccess = systemPreferences.getMediaAccessStatus('microphone');
      if (micAccess !== 'granted') {
        systemPreferences.askForMediaAccess('microphone');
      }
    }
  };
}
