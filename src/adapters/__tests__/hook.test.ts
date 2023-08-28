import 'reflect-metadata';

import { CaptureMode } from '@domain/models/common';
import { Preferences } from '@domain/models/preferences';

import { HookManager } from '@application/services/hook';

describe('HookManager', () => {
  const hookMgr: HookManager = new HookManager();
  const defaultPrefs: Preferences = {
    initialLoaded: true,
    version: '0.0.1',
    runAtStartup: true,
    shortcut: 'Ctrl+Shift+S',
    recordHome: '/var/capture',
    openRecordHomeWhenRecordCompleted: true,
    showCountdown: false,
    recordAudio: false,
    audioSources: [],
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
      .on('onPrefsLoaded', () => {
        prefsLoadedHookCalled += 1;
      })
      .on('onPrefsLoaded', () => {
        prefsLoadedHookCalled += 1;
      });

    hookMgr.emit('onPrefsLoaded', { loadedPrefs: defaultPrefs });

    expect(prefsLoadedHookCalled).toEqual(2);
  });

  it('should call all registered handlers per hook', () => {
    let prefsLoadedHookCalled = 0;
    let prefsUpdatedHookCalled = 0;

    hookMgr
      .on('onPrefsLoaded', () => {
        prefsLoadedHookCalled += 1;
      })
      .on('onPrefsLoaded', () => {
        prefsLoadedHookCalled += 1;
      })
      .on('onPrefsUpdated', () => {
        prefsUpdatedHookCalled += 1;
      })
      .on('onPrefsUpdated', () => {
        prefsUpdatedHookCalled += 1;
      })
      .on('onPrefsUpdated', () => {
        prefsUpdatedHookCalled += 1;
      });

    hookMgr.emit('onPrefsLoaded', { loadedPrefs: defaultPrefs });
    hookMgr.emit('onPrefsUpdated', {
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

    hookMgr.on('onPrefsLoaded', handler).on('onPrefsLoaded', handler);

    hookMgr.emit('onPrefsLoaded', { loadedPrefs: defaultPrefs });

    expect(prefsLoadedHookCalled).toEqual(1);
  });
});
