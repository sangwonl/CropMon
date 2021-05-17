/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */

import { BrowserWindow, remote } from 'electron';

export function setCustomData<T>(
  window: BrowserWindow,
  name: string,
  value: T
) {
  (window as any)[name] = value;
}

export function getCustomData<T>(window: BrowserWindow, name: string): T {
  return (window as any)[name] as T;
}

export function getCurWindowCustomData<T>(name: string): T {
  return getCustomData<T>(remote.getCurrentWindow(), name);
}

export function focusCurWindow() {
  remote.getCurrentWindow().focus();
}
