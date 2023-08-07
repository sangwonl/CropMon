import { injectable } from 'inversify';

import type { ValueOf } from '@utils/types';

import { CaptureContext } from '@domain/models/capture';
import { CaptureMode } from '@domain/models/common';
import type { License } from '@domain/models/license';
import type { Preferences } from '@domain/models/preferences';

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

export type HookArgsCaptureOptionsChanged = {
  captureMode: CaptureMode;
};

export type HookArgsCaptureModeEnabled = {
  captureMode: CaptureMode;
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

export type HookArgsLicenseRegistered = {
  license: License;
};

interface HookArgsBlank {}

type HookTypeArgsMap = {
  onAppLaunched: HookArgsBlank;
  onAppQuit: HookArgsBlank;
  onAppUpdated: HookArgsAppUpdated;
  onAppUpdateChecked: HookArgsAppUpdateChecked;
  onInitialPrefsLoaded: HookArgsInitialPrefsLoaded;
  onPrefsLoaded: HookArgsPrefsLoaded;
  onPrefsUpdated: HookArgsPrefsUpdated;
  onPrefsModalOpening: HookArgsBlank;
  onCaptureOptionsChanged: HookArgsCaptureOptionsChanged;
  onCaptureShortcutTriggered: HookArgsBlank;
  onCaptureModeEnabled: HookArgsCaptureModeEnabled;
  onCaptureModeDisabled: HookArgsBlank;
  onCaptureSelectionStarting: HookArgsBlank;
  onCaptureSelectionFinished: HookArgsBlank;
  onCaptureStarting: HookArgsCaptureStarting;
  onCaptureFinishing: HookArgsCaptureFinishing;
  onCaptureFinished: HookArgsCaptureFinished;
  onLicenseRegistered: HookArgsLicenseRegistered;
};

export type HookType = keyof HookTypeArgsMap;

type HookHandler = (args: ValueOf<HookTypeArgsMap>) => void;

@injectable()
export default class HookManager {
  private hooks: Map<HookType, Array<HookHandler>> = new Map();

  on<K extends HookType>(
    hook: K,
    handler: (args: HookTypeArgsMap[K]) => void,
  ): this {
    let handlers = this.hooks.get(hook);
    if (!handlers) {
      handlers = new Array(0);
      this.hooks.set(hook, handlers);
    }

    if (!handlers.find(h => h === handler)) {
      handlers.push(handler as HookHandler);
    }

    return this;
  }

  emit<K extends HookType>(hook: K, args: HookTypeArgsMap[K]): void {
    const handlers = this.hooks.get(hook);
    if (handlers) {
      handlers.forEach(h => setTimeout(() => h(args), 0));
    }
  }
}
