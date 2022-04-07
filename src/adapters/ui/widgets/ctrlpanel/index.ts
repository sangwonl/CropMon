import { screen } from 'electron';

import { WidgetType } from '@adapters/ui/widgets/types';
import { Widget } from '@adapters/ui/widgets/widget';

import { assetPathResolver } from '@utils/asset';

const WIDGET_MINIMAL_WIDTH = 420;
const WIDGET_MINIMAL_HEIGHT = 60;
const WIDGET_EXPAND_WIDTH = 800;
const WIDGET_EXPAND_HEIGHT = 600;
const WIDGET_TOP = 16;

export default class ControlPanel extends Widget {
  constructor() {
    super(WidgetType.CONTROL_PANEL, {
      icon: assetPathResolver('icon.png'),
      width: WIDGET_MINIMAL_WIDTH,
      height: WIDGET_MINIMAL_HEIGHT,
      show: false,
      frame: false,
      movable: false,
      resizable: false,
      maximizable: false,
      minimizable: false,
      focusable: true,
      transparent: true,
      skipTaskbar: true,
    });

    this.loadURL(`file://${__dirname}/../ctrlpanel/index.html`);

    // https://github.com/electron/electron/issues/25368
    this.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    this.setAlwaysOnTop(true, 'screen-saver', 1);
  }

  showMinimal() {
    this.setPosAndSize(WIDGET_MINIMAL_WIDTH, WIDGET_MINIMAL_HEIGHT);
    super.show();
  }

  showExpanded() {
    this.setPosAndSize(WIDGET_EXPAND_WIDTH, WIDGET_EXPAND_HEIGHT);
    super.show();
  }

  private setPosAndSize(width: number, height: number) {
    const { bounds: primBounds } = screen.getPrimaryDisplay();
    const widgetPosX = Math.floor((primBounds.width - width) / 2);
    this.setBounds({ x: widgetPosX, y: WIDGET_TOP, width, height }, true);
  }
}
