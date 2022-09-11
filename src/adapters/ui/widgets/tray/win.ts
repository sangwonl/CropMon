import { MenuItem, MenuItemConstructorOptions } from 'electron';

import AppTray from '@adapters/ui/widgets/tray/base';

export default class WinAppTray extends AppTray {
  protected buildMenuTempl(): Array<MenuItemConstructorOptions | MenuItem> {
    return [
      {
        id: 'check-update',
        label: 'Check for &Updates',
        click: this.onCheckForUpdates,
      },
      {
        id: 'update',
        label: 'Download and Install',
        click: this.onDownloadAndInstall,
      },
      {
        type: 'separator',
      },
      {
        label: '&About',
        click: this.onAbout,
      },
      // NOTE: Hiding this item because of nothing in help page for now
      // {
      //   label: '&Help',
      //   click: this.onHelp,
      // },
      {
        label: '&Preferences',
        click: this.onPreferences,
      },
      {
        type: 'separator',
      },
      {
        id: 'start-capture',
        label: 'Start &Recording',
        click: this.onStartRecording,
      },
      {
        id: 'stop-capture',
        label: 'Stop &Recording',
        click: this.onStopRecording,
        visible: false,
      },
      {
        id: 'open-folder',
        label: '&Open Folder',
        click: this.onOpenFolder,
      },
      {
        type: 'separator',
      },
      {
        label: '&Quit',
        click: this.onQuit,
      },
    ];
  }

  protected setupClickHandler(): void {
    this.tray.on('click', () => {
      if (this.isRecording) {
        this.dispatcher.finishCapture();
      }
    });
  }
}
