import { isMac } from '@utils/process';

import AppTray from '@adapters/ui/widgets/tray/base';
import MacAppTray from '@adapters/ui/widgets/tray/mac';
import WinAppTray from '@adapters/ui/widgets/tray/win';

export default AppTray;

export function createTray(): AppTray {
  return isMac() ? new MacAppTray() : new WinAppTray();
}
