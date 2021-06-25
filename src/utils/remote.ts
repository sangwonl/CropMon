/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */

import { remote } from 'electron';

import { Widget } from '@ui/widgets/widget';

export function setCustomData<T>(widget: Widget, name: string, value: T) {
  (widget as any)[name] = value;
}

export function getCustomData<T>(widget: Widget, name: string): T {
  return (widget as any)[name] as T;
}

export function getCurWidgetCustomData<T>(name: string): T {
  return getCustomData<T>(remote.getCurrentWindow(), name);
}

export function focusCurWidget() {
  const curWin = remote.getCurrentWindow();
  if (!curWin.isFocused()) {
    curWin.focus();
  }
}

export function getApp() {
  return remote.app;
}
