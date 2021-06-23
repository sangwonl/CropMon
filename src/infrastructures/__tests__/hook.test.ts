/* eslint-disable jest/expect-expect */

import 'reflect-metadata';

import { IHookManager } from '@core/components/hook';
import { HookManager } from '@infrastructures/hook';

describe('HookManager', () => {
  let hookMgr: IHookManager;

  beforeEach(() => {
    hookMgr = new HookManager();
  });

  it('should get hook handler registered by on chaining', () => {
    let prefsLoadedHookCalled = 0;

    hookMgr
      .on('after-preferences-loaded', () => {
        prefsLoadedHookCalled += 1;
      })
      .on('after-preferences-loaded', () => {
        prefsLoadedHookCalled += 1;
      });

    hookMgr.emit('after-preferences-loaded');

    expect(prefsLoadedHookCalled).toEqual(2);
  });

  it('should call all registered handlers per hook', () => {
    let prefsLoadedHookCalled = 0;
    let prefsUpdatedHookCalled = 0;

    hookMgr
      .on('after-preferences-loaded', () => {
        prefsLoadedHookCalled += 1;
      })
      .on('after-preferences-loaded', () => {
        prefsLoadedHookCalled += 1;
      })
      .on('after-preferences-updated', () => {
        prefsUpdatedHookCalled += 1;
      })
      .on('after-preferences-updated', () => {
        prefsUpdatedHookCalled += 1;
      })
      .on('after-preferences-updated', () => {
        prefsUpdatedHookCalled += 1;
      });

    hookMgr.emit('after-preferences-loaded');
    hookMgr.emit('after-preferences-updated');

    expect(prefsLoadedHookCalled).toEqual(2);
    expect(prefsUpdatedHookCalled).toEqual(3);
  });

  it('should register the same handler once', () => {
    let prefsLoadedHookCalled = 0;
    const handler = () => {
      prefsLoadedHookCalled += 1;
    };

    hookMgr
      .on('after-preferences-loaded', handler)
      .on('after-preferences-loaded', handler);

    hookMgr.emit('after-preferences-loaded');

    expect(prefsLoadedHookCalled).toEqual(1);
  });
});
