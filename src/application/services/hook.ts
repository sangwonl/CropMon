/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { injectable } from 'inversify';

import { CaptureContext } from '@domain/models/capture';
import { Preferences } from '@domain/models/preferences';

export type HookArgsAppUpdateChecked = {
  updateAvailable: boolean;
};

export type HookArgsAppUpdated = {
  oldVersion: string;
  curVersion: string;
};

export type HookArgsInitialPrefsLoaded = {
  loadedPrefs: Preferences;
};

export type HookArgsPrefsLoaded = {
  loadedPrefs: Preferences;
};

export type HookArgsPrefsUpdated = {
  prevPrefs?: Preferences;
  newPrefs: Preferences;
};

export type HookArgsCaptureStarting = {
  captureContext: CaptureContext;
  error: boolean;
};

export type HookArgsCaptureFinishing = {
  captureContext: CaptureContext;
};

export type HookArgsCaptureFinished = {
  captureContext: CaptureContext;
  error: boolean;
};

interface HookArgsBlank {}

type HookTypeArgsMap = {
  'app-launched': HookArgsBlank;
  'app-quit': HookArgsBlank;
  'app-updated': HookArgsAppUpdated;
  'app-update-checked': HookArgsAppUpdateChecked;
  'initial-prefs-loaded': HookArgsInitialPrefsLoaded;
  'prefs-loaded': HookArgsPrefsLoaded;
  'prefs-updated': HookArgsPrefsUpdated;
  'prefs-modal-opening': HookArgsBlank;
  'capture-options-changed': HookArgsBlank;
  'capture-shortcut-triggered': HookArgsBlank;
  'capture-mode-enabled': HookArgsBlank;
  'capture-mode-disabled': HookArgsBlank;
  'capture-selection-starting': HookArgsBlank;
  'capture-selection-finished': HookArgsBlank;
  'capture-starting': HookArgsCaptureStarting;
  'capture-finishing': HookArgsCaptureFinishing;
  'capture-finished': HookArgsCaptureFinished;
};

export type HookType = keyof HookTypeArgsMap;

@injectable()
export default class HookManager {
  private hooks: Map<HookType, Array<(args: any) => void>> = new Map();

  on<K extends HookType>(
    hook: K,
    handler: (args: HookTypeArgsMap[K]) => void
  ): this {
    let handlers = this.hooks.get(hook);
    if (!handlers) {
      handlers = new Array(0);
      this.hooks.set(hook, handlers);
    }

    if (!handlers.find((h) => h === handler)) {
      handlers.push(handler);
    }

    return this;
  }

  emit<K extends HookType>(hook: K, args: HookTypeArgsMap[K]): void {
    const handlers = this.hooks.get(hook);
    if (handlers) {
      handlers.forEach((h) => setTimeout(() => h(args), 0));
    }
  }
}
