/* eslint-disable jest/expect-expect */

import { CaptureMode } from '@domain/models/common';
import { Preferences } from '@domain/models/preferences';
import HookManager from '@application/services/hook';

describe('HookManager', () => {
  const hookMgr: HookManager = new HookManager();
  const defaultPrefs: Preferences = {
    initialLoaded: false,
    version: '0.0.1',
    runAtStartup: true,
    shortcut: 'Ctrl+Shift+S',
    recordHome: '/var/capture',
    openRecordHomeWhenRecordCompleted: true,
    showCountdown: false,
    recordMicrophone: false,
    outputFormat: 'mp4',
    captureMode: CaptureMode.AREA,
    colors: {
      selectingBackground: '#fefefe',
      selectingText: '#efefef',
      countdownBackground: '#fefefe',
      countdownText: '#efefef',
    },
  };

  it('should get hook handler registered by on chaining', () => {
    let prefsLoadedHookCalled = 0;

    hookMgr
      .on('prefs-loaded', () => {
        prefsLoadedHookCalled += 1;
      })
      .on('prefs-loaded', () => {
        prefsLoadedHookCalled += 1;
      });

    hookMgr.emit('prefs-loaded', { loadedPrefs: defaultPrefs });

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

    hookMgr.emit('prefs-loaded', { loadedPrefs: defaultPrefs });
    hookMgr.emit('prefs-updated', {
      prevPrefs: defaultPrefs,
      newPrefs: defaultPrefs,
    });

    expect(prefsLoadedHookCalled).toEqual(2);
    expect(prefsUpdatedHookCalled).toEqual(3);
  });

  it('should register the same handler once', () => {
    let prefsLoadedHookCalled = 0;
    const handler = () => {
      prefsLoadedHookCalled += 1;
    };

    hookMgr.on('prefs-loaded', handler).on('prefs-loaded', handler);

    hookMgr.emit('prefs-loaded', { loadedPrefs: defaultPrefs });

    expect(prefsLoadedHookCalled).toEqual(1);
  });
});
