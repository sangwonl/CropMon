/* eslint-disable import/prefer-default-export */

import { globalShortcut } from 'electron';

import { CaptureStatus } from '@core/entities/capture';
import store, { RootState } from '@presenters/redux/store-main';

import { finishCapture } from '@presenters/redux/capture/slice';
import {
  openPreferences,
  enableAreaSelection,
} from '@presenters/redux/ui/slice';

export const configureShortcuts = () => {
  interface ShortcutHandler {
    shortcut: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: any;
  }

  interface PlatformShortcuts {
    [platform: string]: Array<ShortcutHandler>;
  }

  const handleCaptureShortcut = () => {
    const state: RootState = store.getState();
    if (state.capture.curCaptureCtx?.status === CaptureStatus.IN_PROGRESS) {
      store.dispatch(finishCapture());
    } else {
      store.dispatch(enableAreaSelection());
    }
  };

  const platformShortcuts: PlatformShortcuts = {
    win32: [{ shortcut: 'Super+Shift+R', handler: handleCaptureShortcut }],
    darwin: [{ shortcut: 'Super+Shift+7', handler: handleCaptureShortcut }],
  };

  // FIXME: it's just for dev convenient
  if (process.env.NODE_ENV === 'development') {
    platformShortcuts.win32.push({
      shortcut: 'Ctrl+Alt+E',
      handler: () => {
        store.dispatch(openPreferences());
      },
    });
  }

  if (!Object.keys(platformShortcuts).includes(process.platform)) {
    throw new Error('Not supported platform.');
  }

  platformShortcuts[process.platform].forEach((s) => {
    globalShortcut.register(s.shortcut, s.handler);
  });
};
