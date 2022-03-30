/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { injectable } from 'inversify';

import { ICaptureContext } from '@core/entities/capture';
import { IPreferences } from '@core/entities/preferences';

export interface HookArgsAppUpdateChecked {
  updateAvailable: boolean;
}

export interface HookArgsAppUpdated {
  oldVersion: string;
  curVersion: string;
}

export interface HookArgsInitialPrefsLoaded {
  loadedPrefs: IPreferences;
}

export interface HookArgsPrefsLoaded {
  loadedPrefs: IPreferences;
}

export interface HookArgsPrefsUpdated {
  prevPrefs?: IPreferences;
  newPrefs: IPreferences;
}

export interface HookArgsCaptureStarting {
  captureContext: ICaptureContext;
}

export interface HookArgsCaptureFinishing {
  captureContext: ICaptureContext;
}

export interface HookArgsCaptureFinished {
  captureContext: ICaptureContext;
}

interface HookArgsBlank {}

interface HookTypeArgsMap {
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
}

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
