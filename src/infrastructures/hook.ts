/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */

import { inject, injectable } from 'inversify';
import { app, globalShortcut, systemPreferences } from 'electron';

import { TYPES } from '@di/types';
import { CaptureStatus, ICaptureContext } from '@core/entities/capture';
import { IPreferences } from '@core/entities/preferences';
import { HookType, IHookManager } from '@core/interfaces/hook';
import { IAnalyticsTracker } from '@core/interfaces/tracker';
import { PreferencesUseCase } from '@core/usecases/preferences';
import { IUiDirector } from '@core/interfaces/director';
import { ActionDispatcher } from '@adapters/action';
import { getPlatform, isDebugMode, isMac } from '@utils/process';

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
      handlers.forEach((h) => h(args));
    }
  }
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

interface HookArgsCaptureFinished {
  captureContext: ICaptureContext;
}

@injectable()
export class BuiltinHooks {
  constructor(
    @inject(TYPES.HookManager) private hookManager: IHookManager,
    @inject(TYPES.UiDirector) private uiDirector: IUiDirector,
    @inject(TYPES.AnalyticsTracker) private tracker: IAnalyticsTracker,
    private prefsUseCase: PreferencesUseCase,
    private actionDispatcher: ActionDispatcher
  ) {
    this.hookManager.on('app-updated', this.onAppUpdated);
    this.hookManager.on('app-launched', this.onAppLaunched);
    this.hookManager.on('initial-prefs-loaded', this.onInitialPrefsLoaded);
    this.hookManager.on('prefs-loaded', this.onAfterPrefsLoaded);
    this.hookManager.on('prefs-updated', this.onAfterPrefsUpdated);
    this.hookManager.on('capture-starting', this.onCaptureStarting);
    this.hookManager.on('capture-finished', this.onCaptureFinished);
  }

  onAppUpdated = async (_args: HookArgsAppUpdated) => {
    await this.uiDirector.openReleaseNotesPopup();
  };

  onAppLaunched = async () => {
    this.uiDirector.refreshTrayState(
      await this.prefsUseCase.fetchUserPreferences(),
      false
    );

    this.tracker.eventL('app-lifecycle', 'launch', getPlatform());
    this.tracker.view('idle');
  };

  onInitialPrefsLoaded = async (_args: HookArgsInitialPrefsLoaded) => {
    await this.uiDirector.openHelpPagePopup();

    this.tracker.eventL('app-lifecycle', 'initial-launch', getPlatform());
  };

  onAfterPrefsLoaded = async (args: HookArgsPrefsLoaded) => {
    await this.handlePrefsHook(args.loadedPrefs);
  };

  onAfterPrefsUpdated = async (args: HookArgsPrefsUpdated) => {
    await this.handlePrefsHook(args.newPrefs, args.prevPrefs);
  };

  onCaptureStarting = (args: HookArgsCaptureStarting) => {
    const { status } = args.captureContext;
    if (status === CaptureStatus.IN_PROGRESS) {
      this.tracker.eventL('capture', 'start-capture', 'success');
    } else if (status === CaptureStatus.ERROR) {
      this.tracker.eventL('capture', 'start-capture', 'fail');
    }
  };

  onCaptureFinished = (args: HookArgsCaptureFinished) => {
    const { status, createdAt, finishedAt } = args.captureContext;
    if (status === CaptureStatus.FINISHED) {
      const duration = finishedAt! - createdAt;
      this.tracker.eventLV('capture', 'finish-capture', 'duration', duration);
    } else if (status === CaptureStatus.ERROR) {
      this.tracker.eventL('capture', 'finish-capture', 'fail');
    }
  };

  private handlePrefsHook = async (
    newPrefs: IPreferences,
    prevPrefs?: IPreferences
  ): Promise<void> => {
    this.setupShortcut(newPrefs, prevPrefs);
    this.setupRunAtStartup(newPrefs);
    this.askMediaAccess(newPrefs);
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

  private askMediaAccess = (prefs: IPreferences): void => {
    if (prefs.recordMicrophone && isMac()) {
      systemPreferences.askForMediaAccess('microphone');
    }
  };
}
