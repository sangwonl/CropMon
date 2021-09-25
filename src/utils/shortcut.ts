/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */

import { isMac } from './process';
import { capitalize } from './strings';

export const INITIAL_SHORTCUT = `Meta + Shift + E`;

const MODIFIER_CODES = [
  16, // Shift
  17, // Ctrl
  18, // Alt
  91, // Meta
  93, // Meta
];
const FUNCTIONAL_CODES = [
  8, // Backspace
  9, // Tab
  13, // Return (or Enter as alias)
  27, // Escape (or Esc for short)
  32, // Space
  // Capslock
  // Numlock
  // Scrolllock
  46, // Delete
  // Insert
  // Up, Down, Left and Right
  // Home and End
  // PageUp and PageDown
];

export const extractShortcut = (e: any) => {
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
  if (!MODIFIER_CODES.includes(e.keyCode)) {
    let k = '';
    if (FUNCTIONAL_CODES.includes(e.keyCode)) {
      k = e.code;
    } else if (e.keyCode >= 32 && e.keyCode <= 126) {
      k = String.fromCharCode(e.keyCode);
    }
    pressed.push(capitalize(k));
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
