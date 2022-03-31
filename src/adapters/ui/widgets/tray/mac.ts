import { MenuItem, MenuItemConstructorOptions } from 'electron';

import AppTray from '@adapters/ui/widgets/tray/base';

export default class MacAppTray extends AppTray {
  protected buildMenuTempl(): Array<MenuItemConstructorOptions | MenuItem> {
    return [
      {
        id: 'check-update',
        label: 'Check for Updates',
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
        label: 'About',
        click: this.onAbout,
      },
      {
        label: 'Help',
        click: this.onHelp,
      },
      {
        label: 'Preferences',
        click: this.onPreferences,
      },
      {
        type: 'separator',
      },
      {
        id: 'start-capture',
        label: 'Start Recording',
        click: this.onStartRecording,
      },
      {
        id: 'stop-capture',
        label: 'Stop Recording',
        click: this.onStopRecording,
        visible: false,
      },
      {
        id: 'recording-options',
        label: 'Options',
        submenu: [
          {
            id: 'low-qual',
            type: 'checkbox',
            label: 'Low Quality Mode',
            click: this.onToggleLowQual,
          },
          {
            id: 'out-gif',
            type: 'checkbox',
            label: 'Output as GIF',
            click: this.onToggleOutGif,
          },
          {
            id: 'record-mic',
            type: 'checkbox',
            label: 'Record Microphone',
            click: this.onToggleMic,
          },
        ],
      },
      {
        type: 'separator',
      },
      {
        label: 'Quit',
        click: this.onQuit,
      },
    ];
  }

  protected setupClickHandler(): void {
    this.tray.on('click', () => {
      if (this.isRecording) {
        this.tray.setContextMenu(null);
        this.dispatcher.finishCapture();
      } else {
        this.tray.setContextMenu(this.menu);
        this.tray.popUpContextMenu();
      }
    });

    this.tray.on('right-click', () => {
      this.tray.setContextMenu(this.menu);
      this.tray.popUpContextMenu();
    });
  }
}
