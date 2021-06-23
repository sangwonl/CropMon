/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-empty-interface */

export type HookType = 'after-preferences-loaded' | 'after-preferences-updated';

export interface IHookManager {
  on(hook: HookType, handler: () => void): this;
  emit(hook: HookType): void;
}
