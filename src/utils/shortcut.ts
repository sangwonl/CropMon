/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */

import { isMac } from './process';
import { capitalize } from './strings';

export const INITIAL_SHORTCUT = `${isMac() ? 'Cmd' : 'Win'} + Shift + E`;

export const iconizeShortcut = (shortcut: string) => {
  return shortcut
    .replace('Enter', '↩')
    .replace('Backspace', '⌫')
    .replace('ArrowLeft', '←')
    .replace('ArrowRight', '→')
    .replace('ArrowUp', '↑')
    .replace('ArrowDown', '↓');
  // .replace('Win', '❖')
  // .replace('Cmd', '⌘')
  // .replace('Shift', '⇧')
  // .replace('Alt', '⌥')
  // .replace('Ctrl', '⌃')
  // .replace('Tab', '⇥')
};

export const textifyShortcut = (e: any) => {
  const key = String.fromCharCode(e.keyCode);
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
  if (key.length > 0 && !modifiers.includes(key)) {
    pressed.push(iconizeShortcut(capitalize(key)));
  }

  return pressed.join(' + ');
};

export const validateShortcut = (s: string): boolean => {
  const keys = s.split(' + ');
  const modifiers = ['Cmd', 'Win', 'Shift', 'Alt', 'Ctrl'];

  let validateModifier = false;
  modifiers.forEach((m) => {
    const idx = keys.indexOf(m, 0);
    if (idx > -1) {
      validateModifier = true;
      keys.splice(idx, 1);
    }
  });

  const validateKey = keys.length === 1;

  return validateModifier && validateKey;
};
