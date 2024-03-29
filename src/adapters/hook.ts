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
  SHORTCUT_OUTPUT_MP4,
  SHORTCUT_OUTPUT_WEBM,
  SHORTCUT_OUTPUT_GIF,
} from '@utils/shortcut';

import { TYPES } from '@di/types';

import { CaptureMode, type OutputFormat } from '@domain/models/common';
import type { Preferences } from '@domain/models/preferences';
import type { PreferencesRepository } from '@domain/repositories/preferences';

import {
  TrayRecordingState,
  TrayUpdaterState,
  type UiDirector,
} from '@application/ports/director';
import type { UseCaseInteractor } from '@application/ports/interactor';
import type{ AnalyticsTracker } from '@application/ports/tracker';
import { HookManager } from '@application/services/hook';
import type {
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
import { CheckUpdateUseCase } from '@application/usecases/CheckUpdate';
import { CheckVersionUseCase } from '@application/usecases/CheckVersion';

const UPDATE_CHECK_DELAY = 5 * 60 * 1000;
const UPDATE_CHECK_INTERVAL = 1 * 60 * 60 * 1000;

@injectable()
export class BuiltinHooks {
  private lastUpdateCheckedAt?: number;

  constructor(
    @inject(TYPES.PreferencesRepository)
    private prefsRepo: PreferencesRepository,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector,
    @inject(TYPES.AnalyticsTracker) private tracker: AnalyticsTracker,
    @inject(TYPES.UseCaseInteractor) private interactor: UseCaseInteractor,
    private hookManager: HookManager,
    private checkVersionUseCase: CheckVersionUseCase,
    private checkUpdateUseCase: CheckUpdateUseCase,
  ) {
    this.hookManager.on('onAppLaunched', this.onAppLaunched);
    this.hookManager.on('onAppQuit', this.onAppQuit);
    this.hookManager.on('onAppUpdateChecked', this.onAppUpdateChecked);
    this.hookManager.on('onAppUpdated', this.onAppUpdated);
    this.hookManager.on('onInitialPrefsLoaded', this.onInitialPrefsLoaded);
    this.hookManager.on('onPrefsLoaded', this.onPrefsLoaded);
    this.hookManager.on('onPrefsUpdated', this.onPrefsUpdated);
    this.hookManager.on('onPrefsModalOpening', this.onPrefsModalOpening);
    this.hookManager.on(
      'onCaptureOptionsChanged',
      this.onCaptureOptionsChanged,
    );
    this.hookManager.on(
      'onCaptureShortcutTriggered',
      this.onCaptureShortcutTriggered,
    );
    this.hookManager.on('onCaptureModeEnabled', this.onCaptureModeEnabled);
    this.hookManager.on('onCaptureModeDisabled', this.onCaptureModeDisabled);
    this.hookManager.on(
      'onCaptureSelectionStarting',
      this.onCaptureSelectionStarting,
    );
    this.hookManager.on(
      'onCaptureSelectionFinished',
      this.onCaptureSelectionFinished,
    );
    this.hookManager.on('onCaptureStarting', this.onCaptureStarting);
    this.hookManager.on('onCaptureFinishing', this.onCaptureFinishing);
    this.hookManager.on('onCaptureFinished', this.onCaptureFinished);
  }

  private onAppLaunched = async () => {
    await this.checkVersionUseCase.execute();

    await this.checkUpdateUseCase.execute();

    const prefs = await this.prefsRepo.fetchPreferences();
    this.uiDirector.updateTrayPrefs(prefs);

    this.tracker.eventL('app-lifecycle', 'launch', getPlatform());
    this.tracker.view('idle');
  };

  private onAppQuit = async () => {
    this.tracker.event('app-lifecycle', 'quit');
  };

  private onAppUpdateChecked = async (args: HookArgsAppUpdateChecked) => {
    if (args.updateAvailable) {
      this.uiDirector.updateTrayUpdater(TrayUpdaterState.Updatable);
    }
    this.lastUpdateCheckedAt = getTimeInSeconds();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onAppUpdated = async (_args: HookArgsAppUpdated) => {
    await this.uiDirector.openReleaseNotes();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onInitialPrefsLoaded = async (_args: HookArgsInitialPrefsLoaded) => {
    await this.uiDirector.openReleaseNotes();
    this.tracker.eventL('app-lifecycle', 'initial-launch', getPlatform());
  };

  private onPrefsLoaded = async (args: HookArgsPrefsLoaded) => {
    await this.handlePrefsHook(args.loadedPrefs);
  };

  private onPrefsUpdated = async (args: HookArgsPrefsUpdated) => {
    await this.handlePrefsHook(args.newPrefs, args.prevPrefs);
  };

  private onPrefsModalOpening = async () => {
    this.tracker.view('preferences-modal');
  };

  private onCaptureOptionsChanged = async (
    args: HookArgsCaptureOptionsChanged,
  ) => {
    await this.setupInSelectionShortcut(true, args.captureMode);

    const prefs = await this.prefsRepo.fetchPreferences();
    this.tracker.eventLVS('capture', 'options-changed', {
      mode: prefs.captureMode,
      outfmt: prefs.outputFormat,
    });
  };

  private onCaptureShortcutTriggered = async () => {
    const prefs = await this.prefsRepo.fetchPreferences();
    this.tracker.eventL('capture', 'shortcut-triggered', prefs.shortcut);
  };

  private onCaptureModeEnabled = async (args: HookArgsCaptureModeEnabled) => {
    await this.setupInSelectionShortcut(true, args.captureMode);
  };

  private onCaptureModeDisabled = async () => {
    await this.setupInSelectionShortcut(false);
  };

  private onCaptureSelectionStarting = async () => {
    this.tracker.view('capture-area-selection');
  };

  private onCaptureSelectionFinished = async () => {};

  private onCaptureStarting = async (args: HookArgsCaptureStarting) => {
    // disable in selection shortcut
    await this.setupInSelectionShortcut(false);

    // refresh tray
    const { error } = args;
    if (!error) {
      this.uiDirector.updateTrayRecording(TrayRecordingState.Recording);
      this.uiDirector.toggleRecordingTime(true);
    }

    // tracking
    if (!error) {
      const { target, outputFormat, audioSources } = args.captureContext;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { width, height } = target.bounds!;
      this.tracker.eventLVS('capture', 'start-capture', {
        mode: target.mode,
        area: `${width}x${height}`,
        outfmt: outputFormat,
        audio: audioSources.map(s => s.name).join(','),
      });
      this.tracker.view('in-recording');
    } else {
      this.tracker.eventL('capture', 'start-capture', 'fail');
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onCaptureFinishing = async (_args: HookArgsCaptureFinishing) => {
    this.uiDirector.updateTrayRecording(TrayRecordingState.Ready);
    this.uiDirector.toggleRecordingTime(false);
  };

  private onCaptureFinished = async (args: HookArgsCaptureFinished) => {
    const now = getTimeInSeconds();
    const lastCheckedAt = this.lastUpdateCheckedAt ?? 0;
    const neverChecked = lastCheckedAt === 0;
    const coolTimePassed = now - lastCheckedAt > UPDATE_CHECK_INTERVAL;

    const shouldCheck = neverChecked || coolTimePassed;
    if (shouldCheck) {
      setTimeout(() => this.checkUpdateUseCase.execute(), UPDATE_CHECK_DELAY);
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
    prevPrefs?: Preferences,
  ): Promise<void> => {
    this.setupCaptureShortcut(newPrefs, prevPrefs);
    this.setupRunAtStartup(newPrefs);
    await this.askMediaAccess(newPrefs);
    this.uiDirector.updateTrayPrefs(newPrefs);
  };

  private handleShortcutCaptureOpts = async (
    mode?: CaptureMode,
    fmt?: OutputFormat,
  ) => {
    const prefs = await this.prefsRepo.fetchPreferences();
    const recOpts = this.prefsRepo.getRecOptionsFromPrefs(prefs);
    this.interactor.changeCaptureOptions({
      target: { mode: mode ?? prefs.captureMode },
      recordOptions: {
        ...recOpts,
        outputFormat: (fmt ?? prefs.outputFormat),
      },
    });
  };

  private setupInSelectionShortcut = async (
    enable: boolean,
    captureMode?: CaptureMode,
  ) => {
    if (enable) {
      if (captureMode === CaptureMode.SCREEN) {
        globalShortcut.register(SHORTCUT_ENTER, () =>
          this.interactor.startCaptureWithCurrentStates(),
        );
      }

      globalShortcut.register(SHORTCUT_ESCAPE, () =>
        this.interactor.disableCaptureMode(),
      );

      globalShortcut.register(SHORTCUT_CAPTURE_MODE_SCREEN, () =>
        this.handleShortcutCaptureOpts(CaptureMode.SCREEN),
      );

      globalShortcut.register(SHORTCUT_CAPTURE_MODE_AREA, () =>
        this.handleShortcutCaptureOpts(CaptureMode.AREA),
      );

      globalShortcut.register(SHORTCUT_OUTPUT_MP4, () =>
        this.handleShortcutCaptureOpts(undefined, 'mp4'),
      );

      globalShortcut.register(SHORTCUT_OUTPUT_WEBM, () =>
        this.handleShortcutCaptureOpts(undefined, 'webm'),
      );

      globalShortcut.register(SHORTCUT_OUTPUT_GIF, () =>
        this.handleShortcutCaptureOpts(undefined, 'gif'),
      );
    } else {
      globalShortcut.unregister(SHORTCUT_ENTER);
      globalShortcut.unregister(SHORTCUT_ESCAPE);
      globalShortcut.unregister(SHORTCUT_CAPTURE_MODE_SCREEN);
      globalShortcut.unregister(SHORTCUT_CAPTURE_MODE_AREA);
      globalShortcut.unregister(SHORTCUT_OUTPUT_MP4);
      globalShortcut.unregister(SHORTCUT_OUTPUT_WEBM);
      globalShortcut.unregister(SHORTCUT_OUTPUT_GIF);
    }
  };

  private setupCaptureShortcut = (
    newPrefs: Preferences,
    prevPrefs?: Preferences,
  ): void => {
    if (!prevPrefs || prevPrefs.shortcut !== newPrefs.shortcut) {
      if (prevPrefs) {
        globalShortcut.unregister(
          prevPrefs.shortcut.replace(/Win|Cmd/, 'Meta'),
        );
      }
      globalShortcut.register(
        newPrefs.shortcut.replace(/Win|Cmd/, 'Meta'),
        this.interactor.onCaptureToggleShortcut,
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
