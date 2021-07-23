/* eslint-disable @typescript-eslint/no-explicit-any */

export type HookType =
  | 'app-updated'
  | 'initial-prefs-loaded'
  | 'after-prefs-loaded'
  | 'after-prefs-updated';

export interface IHookManager {
  on(hook: HookType, handler: (args: any) => void): this;
  emit(hook: HookType, args: any): void;
}
