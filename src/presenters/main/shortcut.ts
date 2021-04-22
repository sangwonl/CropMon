/* eslint-disable import/prefer-default-export */

import { globalShortcut } from 'electron';

import { CaptureStatus } from '@core/entities';
import store, { RootState } from '@presenters/redux/store-main';

import {
  configureCaptureParams,
  finishCapture,
} from '@presenters/redux/capture/slice';

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
      store.dispatch(configureCaptureParams());
    }
  };

  const platformShortcuts: PlatformShortcuts = {
    win32: [{ shortcut: 'Super+Shift+R', handler: handleCaptureShortcut }],
    darwin: [{ shortcut: 'Control+Shift+6', handler: handleCaptureShortcut }],
  };

  if (!Object.keys(platformShortcuts).includes(process.platform)) {
    throw new Error('Not supported platform.');
  }

  platformShortcuts[process.platform].forEach((s) => {
    globalShortcut.register(s.shortcut, s.handler);
  });
};
