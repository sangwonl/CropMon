/* eslint-disable @typescript-eslint/no-explicit-any */

export type HookType =
  | 'app-launched'
  | 'app-update-checked'
  | 'app-updated'
  | 'initial-prefs-loaded'
  | 'prefs-loaded'
  | 'prefs-updated'
  | 'capture-starting'
  | 'capture-finished';

export interface IHookManager {
  on(hook: HookType, handler: (args: any) => void): this;
  emit(hook: HookType, args: any): void;
}
