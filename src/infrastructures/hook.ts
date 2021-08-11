/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */

import { inject, injectable } from 'inversify';
import { app, globalShortcut, systemPreferences } from 'electron';

import { TYPES } from '@di/types';
import { HookType, IHookManager } from '@core/interfaces/hook';
import { ActionDispatcher } from '@adapters/action';
import { IPreferences } from '@core/entities/preferences';
import { IUiDirector } from '@core/interfaces/director';
import { isDebugMode, isMac } from '@utils/process';

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

interface HookArgsAfterPrefsLoaded {
  loadedPrefs: IPreferences;
}

interface HookArgsAfterPrefsUpdated {
  prevPrefs: IPreferences;
  newPrefs: IPreferences;
}

@injectable()
export class BuiltinHooks {
  constructor(
    private actionDispatcher: ActionDispatcher,
    @inject(TYPES.HookManager) private hookManager: IHookManager,
    @inject(TYPES.UiDirector) private uiDirector: IUiDirector
  ) {
    this.hookManager.on('app-updated', this.onAppUpdated);
    this.hookManager.on('initial-prefs-loaded', this.onInitialPrefsLoaded);
    this.hookManager.on('after-prefs-loaded', this.onAfterPrefsLoaded);
    this.hookManager.on('after-prefs-updated', this.onAfterPrefsUpdated);
  }

  onAppUpdated = async (_args: HookArgsAppUpdated) => {
    await this.uiDirector.openReleaseNotesPopup();
  };

  onInitialPrefsLoaded = async (_args: HookArgsInitialPrefsLoaded) => {
    await this.uiDirector.openHelpPagePopup();
  };

  onAfterPrefsLoaded = async (args: HookArgsAfterPrefsLoaded) => {
    await this.handlePrefsHook(args.loadedPrefs);
  };

  onAfterPrefsUpdated = async (args: HookArgsAfterPrefsUpdated) => {
    await this.handlePrefsHook(args.newPrefs, args.prevPrefs);
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
