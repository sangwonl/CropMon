/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */

import { injectable } from 'inversify';

import { HookType, IHookManager } from '@core/components/hook';

type HookHandler = () => void;

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

  emit(hook: HookType): void {
    const handlers = this.hooks.get(hook);
    if (handlers !== undefined) {
      handlers.forEach((h) => h());
    }
  }
}
