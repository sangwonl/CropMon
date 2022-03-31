import { screen } from 'electron';

import { WidgetType } from '@adapters/ui/widgets/types';
import { Widget } from '@adapters/ui/widgets/widget';

import { assetPathResolver } from '@utils/asset';

const WIDGET_WIDTH = 354;
const WIDGET_HEIGHT = 60;
const WIDGET_TOP = 16;

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
    });

    this.loadURL(`file://${__dirname}/../ctrlpanel/index.html`);

    // https://github.com/electron/electron/issues/25368
    this.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    this.setAlwaysOnTop(true, 'screen-saver', 1);
  }

  show() {
    const { bounds: primBounds } = screen.getPrimaryDisplay();
    const widgetPosX = Math.floor((primBounds.width - WIDGET_WIDTH) / 2);
    this.setPosition(widgetPosX, WIDGET_TOP);
    super.show();
  }
}