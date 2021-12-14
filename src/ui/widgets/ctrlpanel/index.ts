/* eslint-disable import/prefer-default-export */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable max-classes-per-file */

import { screen } from 'electron';

import { assetPathResolver } from '@utils/asset';
import { WidgetType } from '@ui/widgets/types';
import { Widget } from '@ui/widgets/widget';

const WIDGET_WIDTH = 280;
const WIDGET_HEIGHT = 60;

export default class ControlPanel extends Widget {
  constructor() {
    super(WidgetType.CONTROL_PANEL, {
      icon: assetPathResolver('icon.png'),
      width: WIDGET_WIDTH,
      height: WIDGET_HEIGHT,
      show: false,
      frame: false,
      movable: false,
      resizable: false,
      maximizable: false,
      minimizable: false,
      focusable: true,
      skipTaskbar: true,
      hideWhenClose: false,
    });

    this.loadURL(`file://${__dirname}/../ctrlpanel/index.html`);

    // https://github.com/electron/electron/issues/25368
    this.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    this.setAlwaysOnTop(true, 'screen-saver', 1);
  }

  show() {
    const { bounds: primBounds } = screen.getPrimaryDisplay();
    const widgetPosX = Math.floor((primBounds.width - WIDGET_WIDTH) / 2);
    this.setPosition(widgetPosX, 0);
    super.show();
  }
}
