import CaptureOverlay from '@adapters/ui/widgets/overlays';

import { getAllScreens } from '@utils/bounds';

export default class CaptureOverlayWrap {
  private widgets: { [key: string]: CaptureOverlay } = {};

  constructor() {
    this.syncWidgetsToScreens();
  }

  syncWidgetsToScreens() {
    const curScreenIds: string[] = [];

    getAllScreens().forEach((screen) => {
      const screenId = screen.id.toString();
      curScreenIds.push(screenId);

      let widget = this.widgets[screenId];
      if (!widget) {
        widget = new CaptureOverlay({ screenId: screen.id });
        this.widgets[screenId] = widget;
      }
      widget.setBounds(screen.bounds);
    });

    const staleScreenIds = Object.keys(this.widgets).filter(
      (sId) => !curScreenIds.includes(sId)
    );

    staleScreenIds.forEach((sId) => {
      this.widgets[sId].destroy();
    });
  }

  show() {
    this.syncWidgetsToScreens();

    Object.values(this.widgets).forEach((widget) => {
      widget.setIgnoreMouseEvents(false);
      widget.show();
    });
  }

  hide() {
    // should wait for react component rerender
    setTimeout(() => {
      Object.values(this.widgets).forEach((widget) => {
        widget.hide();
      });
    }, 500);
  }

  close() {
    Object.values(this.widgets).forEach((widget) => {
      widget.close();
    });
  }

  ignoreMouseEvents() {
    Object.values(this.widgets).forEach((widget) => {
      widget.setIgnoreMouseEvents(true);
    });
  }

  blur() {
    Object.values(this.widgets).forEach((widget) => {
      widget.blur();
    });
  }
}
