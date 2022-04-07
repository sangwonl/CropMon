import { isMac } from '@utils/process';
import { capitalize } from '@utils/strings';

export const DEFAULT_SHORTCUT_CAPTURE = `Meta + Shift + E`;
export const SHORTCUT_ESCAPE = 'Escape';
export const SHORTCUT_CAPTURE_MODE_SCREEN = isMac() ? 'Meta + 1' : 'Ctrl + 1';
export const SHORTCUT_CAPTURE_MODE_WINDOW = isMac() ? 'Meta + 2' : 'Ctrl + 2';
export const SHORTCUT_CAPTURE_MODE_AREA = isMac() ? 'Meta + 3' : 'Ctrl + 3';
export const SHORTCUT_OUTPUT_MP4 = isMac() ? 'Meta + 4' : 'Ctrl + 4';
export const SHORTCUT_OUTPUT_GIF = isMac() ? 'Meta + 5' : 'Ctrl + 5';

const MODIFIER_KEYCODES = [
  16, // Shift
  17, // Ctrl
  18, // Alt
  91, // Meta
  93, // Meta
];
const CONTROL_KEYCODES = [
  8, // Backspace
  9, // Tab
  13, // Return (or Enter as alias)
  27, // Escape (or Esc for short)
  32, // Space
  20, // Capslock
  33, // PageUp
  34, // PageDown
  35, // End
  36, // Home
  37, // Left
  38, // Up
  39, // Right
  40, // Down
  45, // Insert
  46, // Delete
  144, // Numlock
  145, // Scrolllock
];

const isFunctionKeyCodes = (keyCode: number): boolean => {
  return keyCode >= 112 && keyCode <= 143;
};

const isOthersAllowed = (keyCode: number): boolean => {
  return keyCode >= 32 && keyCode <= 111;
};

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
  if (!MODIFIER_KEYCODES.includes(e.keyCode)) {
    if (CONTROL_KEYCODES.includes(e.keyCode) || isFunctionKeyCodes(e.keyCode)) {
      pressed.push(capitalize(e.code));
    } else if (isOthersAllowed(e.keyCode)) {
      pressed.push(capitalize(String.fromCharCode(e.keyCode)));
    }
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
