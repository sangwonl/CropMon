/* eslint-disable import/prefer-default-export */

import { globalShortcut } from 'electron';

import { CaptureStatus } from '@core/entities/capture';
import store, { RootState } from '@presenters/redux/store-main';

import { finishCapture } from '@presenters/redux/capture/slice';
import {
  openPreferences,
  enableAreaSelection,
  disableAreaSelection,
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

  const handleEscapeInput = () => {
    const state: RootState = store.getState();
    if (state.ui.captureArea.screenIdOnSelection) {
      store.dispatch(disableAreaSelection());
    }
  };

  const platformShortcuts: PlatformShortcuts = {
    win32: [
      { shortcut: 'Super+Shift+R', handler: handleCaptureShortcut },
      { shortcut: 'Escape', handler: handleEscapeInput },
    ],
    darwin: [
      { shortcut: 'Super+Shift+7', handler: handleCaptureShortcut },
      { shortcut: 'Escape', handler: handleEscapeInput },
    ],
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
