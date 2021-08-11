/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */

import { isMac } from './process';
import { capitalize } from './strings';

export const INITIAL_SHORTCUT = `Meta + Shift + E`;

export const extractShortcut = (e: any) => {
  const modifierCodes = [16, 17, 18, 91]; // Shift, Ctrl, Alt, Meta
  const pressed = [];
  if (e.metaKey) {
    pressed.push('Meta');
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
  if (!modifierCodes.includes(e.keyCode)) {
    const key = String.fromCharCode(e.keyCode);
    pressed.push(capitalize(key));
  }

  return pressed.join(' + ');
};

export const validateShortcut = (s: string): boolean => {
  const keys = s.split(' + ');
  const modifiers = ['Meta', 'Shift', 'Alt', 'Ctrl'];

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

export const shortcutForDisplay = (s: string): string => {
  return s.replace('Meta', isMac() ? 'Cmd' : 'Win');
};
