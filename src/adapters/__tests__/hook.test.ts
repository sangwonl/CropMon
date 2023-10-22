/* eslint-disable jest/no-done-callback */
import 'reflect-metadata';

import { CountdownLatch } from '@utils/tests';

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

  it('should get hook handler registered by on chaining', done => {
    const barrier = new CountdownLatch(2);

    let prefsLoadedHookCalled = 0;

    hookMgr
      .on('onPrefsLoaded', () => {
        barrier.countDown();
        prefsLoadedHookCalled += 1;
      })
      .on('onPrefsLoaded', () => {
        barrier.countDown();
        prefsLoadedHookCalled += 1;
      });

    hookMgr.emit('onPrefsLoaded', { loadedPrefs: defaultPrefs });

    barrier.await(() => {
      expect(prefsLoadedHookCalled).toEqual(2);
      done();
    });
  });

  it('should call all registered handlers per hook', done => {
    const barrier = new CountdownLatch(5);

    let prefsLoadedHookCalled = 0;
    let prefsUpdatedHookCalled = 0;

    hookMgr
      .on('onPrefsLoaded', () => {
        prefsLoadedHookCalled += 1;
        barrier.countDown();
      })
      .on('onPrefsLoaded', () => {
        prefsLoadedHookCalled += 1;
        barrier.countDown();
      })
      .on('onPrefsUpdated', () => {
        prefsUpdatedHookCalled += 1;
        barrier.countDown();
      })
      .on('onPrefsUpdated', () => {
        prefsUpdatedHookCalled += 1;
        barrier.countDown();
      })
      .on('onPrefsUpdated', () => {
        prefsUpdatedHookCalled += 1;
        barrier.countDown();
      });

    hookMgr.emit('onPrefsLoaded', { loadedPrefs: defaultPrefs });
    hookMgr.emit('onPrefsUpdated', {
      prevPrefs: defaultPrefs,
      newPrefs: defaultPrefs,
    });

    barrier.await(() => {
      expect(prefsLoadedHookCalled).toEqual(2);
      expect(prefsUpdatedHookCalled).toEqual(3);
      done();
    });
  });

  it('should register the same handler once', done => {
    const barrier = new CountdownLatch(5);

    let prefsLoadedHookCalled = 0;
    const handler = () => {
      prefsLoadedHookCalled += 1;
    };

    hookMgr.on('onPrefsLoaded', handler).on('onPrefsLoaded', handler);

    hookMgr.emit('onPrefsLoaded', { loadedPrefs: defaultPrefs });

    barrier.await(() => {
      expect(prefsLoadedHookCalled).toEqual(1);
      done();
    });
  });
});
