/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */

import { inject, injectable } from 'inversify';

import { TYPES } from '@di/types';
import { HookType, IHookManager } from '@core/interfaces/hook';
import { registerShortcut } from '@utils/shortcut';
import { ActionDispatcher } from '@adapters/action';
import { IPreferences } from '@core/entities/preferences';

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
    @inject(TYPES.HookManager) private hookManager: IHookManager
  ) {
    this.hookManager.on('after-prefs-loaded', this.onAfterPrefsLoaded);
    this.hookManager.on('after-prefs-updated', this.onAfterPrefsUpdated);
  }

  onAfterPrefsUpdated = (args: HookArgsAfterPrefsUpdated) => {
    const { prevPrefs, newPrefs } = args;
    if (prevPrefs.shortcut !== newPrefs.shortcut) {
      registerShortcut(
        newPrefs.shortcut,
        this.actionDispatcher.onCaptureToggleShortcut
      );
    }
  };

  onAfterPrefsLoaded = (args: HookArgsAfterPrefsLoaded) => {
    const { loadedPrefs } = args;
    registerShortcut(
      loadedPrefs.shortcut,
      this.actionDispatcher.onCaptureToggleShortcut
    );
  };
}
