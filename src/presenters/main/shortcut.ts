/* eslint-disable import/prefer-default-export */

import { globalShortcut } from 'electron';

import { CaptureStatus } from '@core/entities/capture';
import store, { RootState } from '@presenters/redux/store-main';

import { finishCapture } from '@presenters/redux/capture/slice';
import { enableAreaSelection } from '@presenters/redux/ui/slice';

export const initializeShortcuts = () => {
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
    win32: [{ shortcut: 'Super+Shift+E', handler: handleCaptureShortcut }],
    darwin: [{ shortcut: 'Super+Shift+9', handler: handleCaptureShortcut }],
  };

  if (!Object.keys(platformShortcuts).includes(process.platform)) {
    throw new Error('Not supported platform.');
  }

  platformShortcuts[process.platform].forEach((s) => {
    globalShortcut.register(s.shortcut, s.handler);
  });
};
