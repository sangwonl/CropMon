/* eslint-disable @typescript-eslint/no-explicit-any */

export type HookType =
  | 'app-launched'
  | 'app-quit'
  | 'app-update-checked'
  | 'app-updated'
  | 'initial-prefs-loaded'
  | 'prefs-loaded'
  | 'prefs-updated'
  | 'capture-selection-starting'
  | 'capture-selection-finished'
  | 'capture-starting'
  | 'capture-finishing'
  | 'capture-finished';

export interface IHookManager {
  on(hook: HookType, handler: (args: any) => void): this;
  emit(hook: HookType, args: any): void;
}
