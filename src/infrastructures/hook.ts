/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */

import { inject, injectable } from 'inversify';
import { app, desktopCapturer, globalShortcut, systemPreferences } from 'electron';

import { TYPES } from '@di/types';
import { CaptureStatus, ICaptureContext } from '@core/entities/capture';
import { IPreferences } from '@core/entities/preferences';
import { HookType, IHookManager } from '@core/interfaces/hook';
import { IAnalyticsTracker } from '@core/interfaces/tracker';
import { AppUseCase } from '@core/usecases/app';
import { PreferencesUseCase } from '@core/usecases/preferences';
import { IUiDirector } from '@core/interfaces/director';
import { ActionDispatcher } from '@adapters/action';
import { getPlatform, isDebugMode, isMac } from '@utils/process';
import { getTimeInSeconds } from '@utils/date';

type HookHandler = (args: any) => void;

@injectable()
export class HookManager implements IHookManager {
  private hooks: Map<HookType, Array<HookHandler>> = new Map();

  on(hook: HookType, handler: HookHandler): this {
    let handlers = this.hooks.get(hook);
    if (handlers === undefined) {
      handlers = new Array(0);
      this.hooks.set(hook, handlers);
    }

    if (handlers.find((h) => h === handler) === undefined) {
      handlers.push(handler);
    }

    return this;
  }

  emit(hook: HookType, args: any): void {
    const handlers = this.hooks.get(hook);
    if (handlers !== undefined) {
      handlers.forEach((h) => setTimeout(() => h(args), 0));
    }
  }
}

interface HookArgsAppUpdateChecked {
  updateAvailable: boolean;
}

interface HookArgsAppUpdated {
  oldVersion: string;
  curVersion: string;
}

interface HookArgsInitialPrefsLoaded {
  loadedPrefs: IPreferences;
}

interface HookArgsPrefsLoaded {
  loadedPrefs: IPreferences;
}

interface HookArgsPrefsUpdated {
  prevPrefs: IPreferences;
  newPrefs: IPreferences;
}

interface HookArgsCaptureStarting {
  captureContext: ICaptureContext;
}

interface HookArgsCaptureFinishing {
  captureContext: ICaptureContext;
}

interface HookArgsCaptureFinished {
  captureContext: ICaptureContext;
}

const UPDATE_CHECK_DELAY = 5 * 60 * 1000;
const UPDATE_CHECK_INTERVAL = 4 * 60 * 60 * 1000;

@injectable()
export class BuiltinHooks {
  private lastUpdateCheckedAt?: number;

  constructor(
    @inject(TYPES.HookManager) private hookManager: IHookManager,
    @inject(TYPES.UiDirector) private uiDirector: IUiDirector,
    @inject(TYPES.AnalyticsTracker) private tracker: IAnalyticsTracker,
    private appUseCase: AppUseCase,
    private prefsUseCase: PreferencesUseCase,
    private actionDispatcher: ActionDispatcher
  ) {
    this.hookManager.on('app-launched', this.onAppLaunched);
    this.hookManager.on('app-quit', this.onAppQuit);
    this.hookManager.on('app-update-checked', this.onAppUpdateChecked);
    this.hookManager.on('app-updated', this.onAppUpdated);
    this.hookManager.on('initial-prefs-loaded', this.onInitialPrefsLoaded);
    this.hookManager.on('prefs-loaded', this.onPrefsLoaded);
    this.hookManager.on('prefs-updated', this.onPrefsUpdated);
    this.hookManager.on('prefs-modal-opening', this.onPrefsModalOpening);
    this.hookManager.on('capture-selection-starting', this.onCaptureSelectionStarting);
    this.hookManager.on('capture-selection-finished', this.onCaptureSelectionFinished);
    this.hookManager.on('capture-starting', this.onCaptureStarting);
    this.hookManager.on('capture-finishing', this.onCaptureFinishing);
    this.hookManager.on('capture-finished', this.onCaptureFinished);
  }

  onAppLaunched = async () => {
    await this.appUseCase.checkAppVersions();

    this.uiDirector.refreshTrayState(
      await this.prefsUseCase.fetchUserPreferences()
    );

    this.tracker.eventL('app-lifecycle', 'launch', getPlatform());
    this.tracker.view('idle');
  };

  onAppQuit = async () => {
    this.tracker.event('app-lifecycle', 'quit');
  };

  onAppUpdateChecked = async (args: HookArgsAppUpdateChecked) => {
    this.uiDirector.refreshTrayState(
      await this.prefsUseCase.fetchUserPreferences(),
      args.updateAvailable
    );

    this.lastUpdateCheckedAt = getTimeInSeconds();
  };

  onAppUpdated = async (_args: HookArgsAppUpdated) => {
    await this.uiDirector.openReleaseNotesPopup();
  };

  onInitialPrefsLoaded = async (_args: HookArgsInitialPrefsLoaded) => {
    await this.uiDirector.openHelpPagePopup();

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
  }

  onCaptureSelectionStarting = async () => {
    this.tracker.view('capture-area-selection');
  };

  onCaptureSelectionFinished = async () => {};

  onCaptureStarting = async (args: HookArgsCaptureStarting) => {
    const { status } = args.captureContext;

    // refresh tray
    await this.uiDirector.refreshTrayState(
      await this.prefsUseCase.fetchUserPreferences(),
      undefined,
      status === CaptureStatus.IN_PROGRESS
    );

    if (status === CaptureStatus.IN_PROGRESS) {
      this.uiDirector.toggleRecordingTime(true);
    }

    // tracking
    if (status === CaptureStatus.IN_PROGRESS) {
      const { target, outputFormat, recordMicrophone, lowQualityMode } = args.captureContext;
      const { width, height } = target.bounds!;
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
      await this.prefsUseCase.fetchUserPreferences(),
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
        this.appUseCase.checkForUpdates();
      }, UPDATE_CHECK_DELAY);
    }

    const { status, createdAt, finishedAt } = args.captureContext;
    if (status === CaptureStatus.FINISHED) {
      const duration = finishedAt! - createdAt;
      this.tracker.eventLV('capture', 'finish-capture', 'duration', duration);
    } else if (status === CaptureStatus.ERROR) {
      this.tracker.eventL('capture', 'finish-capture', 'fail');
    }
    this.tracker.view('idle');
  };

  private handlePrefsHook = async (
    newPrefs: IPreferences,
    prevPrefs?: IPreferences
  ): Promise<void> => {
    this.setupShortcut(newPrefs, prevPrefs);
    this.setupRunAtStartup(newPrefs);
    await this.askMediaAccess(newPrefs);
    await this.uiDirector.refreshTrayState(newPrefs);
  };

  private setupShortcut = (
    newPrefs: IPreferences,
    prevPrefs?: IPreferences
  ): void => {
    if (prevPrefs === undefined || prevPrefs.shortcut !== newPrefs.shortcut) {
      globalShortcut.unregisterAll();
      globalShortcut.register(
        newPrefs.shortcut.replace(/Win|Cmd/, 'Meta'),
        this.actionDispatcher.onCaptureToggleShortcut
      );
    }
  };

  private setupRunAtStartup = (prefs: IPreferences): void => {
    if (isDebugMode()) {
      return;
    }

    app.setLoginItemSettings({
      openAtLogin: prefs.runAtStartup,
      path: app.getPath('exe'),
    });
  };

  private askMediaAccess = async (prefs: IPreferences): Promise<void> => {
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
