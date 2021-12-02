import { remote } from 'electron';

import { Widget } from '@ui/widgets/widget';
import { isMac } from '@utils/process';

export function getCurWidgetCustomData<T>(name: string): T {
  return (remote.getCurrentWindow() as Widget).getCustomData(name);
}

export function getAppPath(
  name:
    | 'home'
    | 'appData'
    | 'userData'
    | 'cache'
    | 'temp'
    | 'exe'
    | 'module'
    | 'desktop'
    | 'documents'
    | 'downloads'
    | 'music'
    | 'pictures'
    | 'videos'
    | 'recent'
    | 'logs'
    | 'crashDumps'
) {
  return remote.app.getPath(name);
}

export function getCursorScreenPoint() {
  if (isMac()) {
    // because mac doesn't support dipToScreenPoint
    return remote.screen.getCursorScreenPoint();
  }
  return remote.screen.dipToScreenPoint(remote.screen.getCursorScreenPoint());
}
