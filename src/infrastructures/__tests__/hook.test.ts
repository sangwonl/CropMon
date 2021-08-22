/* eslint-disable jest/expect-expect */

import 'reflect-metadata';

import { IHookManager } from '@core/interfaces/hook';
import { HookManager } from '@infrastructures/hook';

describe('HookManager', () => {
  let hookMgr: IHookManager;

  beforeEach(() => {
    hookMgr = new HookManager();
  });

  it('should get hook handler registered by on chaining', () => {
    let prefsLoadedHookCalled = 0;

    hookMgr
      .on('prefs-loaded', () => {
        prefsLoadedHookCalled += 1;
      })
      .on('prefs-loaded', () => {
        prefsLoadedHookCalled += 1;
      });

    hookMgr.emit('prefs-loaded', {});

    expect(prefsLoadedHookCalled).toEqual(2);
  });

  it('should call all registered handlers per hook', () => {
    let prefsLoadedHookCalled = 0;
    let prefsUpdatedHookCalled = 0;

    hookMgr
      .on('prefs-loaded', () => {
        prefsLoadedHookCalled += 1;
      })
      .on('prefs-loaded', () => {
        prefsLoadedHookCalled += 1;
      })
      .on('prefs-updated', () => {
        prefsUpdatedHookCalled += 1;
      })
      .on('prefs-updated', () => {
        prefsUpdatedHookCalled += 1;
      })
      .on('prefs-updated', () => {
        prefsUpdatedHookCalled += 1;
      });

    hookMgr.emit('prefs-loaded', {});
    hookMgr.emit('prefs-updated', {});

    expect(prefsLoadedHookCalled).toEqual(2);
    expect(prefsUpdatedHookCalled).toEqual(3);
  });

  it('should register the same handler once', () => {
    let prefsLoadedHookCalled = 0;
    const handler = () => {
      prefsLoadedHookCalled += 1;
    };

    hookMgr.on('prefs-loaded', handler).on('prefs-loaded', handler);

    hookMgr.emit('prefs-loaded', {});

    expect(prefsLoadedHookCalled).toEqual(1);
  });
});
