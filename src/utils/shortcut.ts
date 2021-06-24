/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */

import { globalShortcut } from 'electron';
import { isMac } from './process';
import { capitalize } from './strings';

export const registerShortcut = (
  shortcut: string,
  handler: () => void
): void => {
  globalShortcut.unregisterAll();
  globalShortcut.register(shortcut.replace(/Win|Cmd/, 'Super'), handler);
};

export const INITIAL_SHORTCUT = `${isMac() ? 'Cmd' : 'Win'} + Shift + E`;

export const iconizeShortcut = (shortcut: string) => {
  return shortcut
    .replace('Win', '❖')
    .replace('Cmd', '⌘')
    .replace('Shift', '⇧')
    .replace('Alt', '⌥')
    .replace('Ctrl', '⌃')
    .replace('Enter', '↩')
    .replace('Backspace', '⌫')
    .replace('Tab', '⇥')
    .replace('ArrowLeft', '←')
    .replace('ArrowRight', '→')
    .replace('ArrowUp', '↑')
    .replace('ArrowDown', '↓');
};

export const textifyShortcut = (e: any) => {
  const modifiers = ['Meta', 'Shift', 'Alt', 'Control'];
  const pressed = [];
  if (e.metaKey) {
    pressed.push(isMac() ? 'Cmd' : 'Win');
  }
  if (e.shiftKey) {
    pressed.push('Shift');
  }
  if (e.altKey) {
    pressed.push('Alt');
  }
  if (e.ctrlKey) {
    pressed.push('Ctrl');
  }
  if (e.key.length > 0 && !modifiers.includes(e.key)) {
    pressed.push(iconizeShortcut(capitalize(e.key)));
  }

  return pressed.join(' + ');
};
