import AppTray from '@adapters/ui/widgets/tray/base';
import WinAppTray from '@adapters/ui/widgets/tray/win';
import MacAppTray from '@adapters/ui/widgets/tray/mac';

import { isMac } from '@utils/process';

export default AppTray;

export function createTray(): AppTray {
  return isMac() ? new MacAppTray() : new WinAppTray();
}
