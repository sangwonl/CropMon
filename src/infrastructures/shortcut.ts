/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */

import { injectable } from 'inversify';
import { globalShortcut } from 'electron';

@injectable()
export class ShortcutManager {
  register(shortcut: string, handler: () => void): void {
    globalShortcut.unregisterAll();
    globalShortcut.register(shortcut, handler);
  }
}
