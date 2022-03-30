import AppTray from '@ui/widgets/tray/base';
import WinAppTray from '@ui/widgets/tray/win';
import MacAppTray from '@ui/widgets/tray/mac';
import { isMac } from '@utils/process';

export default AppTray;

export function createTray(): AppTray {
  return isMac() ? new MacAppTray() : new WinAppTray();
}
