// eslint-disable-next-line max-classes-per-file
import { getAllScreens } from '@utils/bounds';

import ElectronUiStateApplier from '@adapters/state';
import CaptureOverlay from '@adapters/ui/widgets/overlays';

export default class CaptureOverlayWrap {
  private uiStateApplier: ElectronUiStateApplier;
  private widgets: { [screenId: string]: CaptureOverlay } = {};

  constructor(uiStateApplier: ElectronUiStateApplier) {
    this.uiStateApplier = uiStateApplier;
    this.syncWidgetsToScreens();
  }

  show() {
    this.syncWidgetsToScreens();

    Object.values(this.widgets).forEach((widget) => {
      widget.setIgnoreMouseEvents(false);
      widget.show();
    });
  }

  hide() {
    // WORKAROUND: should wait for react component render process done
    // it's trade off between interval of re-entern capture mode and illusion
    setTimeout(() => {
      Object.values(this.widgets).forEach((widget) => {
        widget.hide();
      });
    }, 100);
  }

  focus(screenId: number) {
    const widget = this.widgets[screenId];
    widget?.focus();
  }

  blur() {
    Object.values(this.widgets).forEach((widget) => {
      widget.blur();
    });
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

  private syncWidgetsToScreens() {
    const curScreenIds: string[] = [];

    getAllScreens().forEach((screen) => {
      const screenId = screen.id.toString();
      curScreenIds.push(screenId);

      let widget = this.widgets[screenId];
      if (!widget) {
        widget = new CaptureOverlay({ screenId: screen.id });
        this.widgets[screenId] = widget;
        this.uiStateApplier.joinForSyncStates(widget);
      }

      widget.setBounds(screen.bounds);
      widget.setResizable(false);
    });

    const unpluggedScreenIds = Object.keys(this.widgets).filter(
      (sId) => !curScreenIds.includes(sId)
    );

    unpluggedScreenIds.forEach((sId) => {
      const widget = this.widgets[sId];
      this.uiStateApplier.leaveFromSyncStates(widget);

      widget.destroy();
      delete this.widgets[sId];
    });
  }
}
