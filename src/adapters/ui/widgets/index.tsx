import { ipcRenderer } from 'electron';
import React from 'react';
import { createRoot } from 'react-dom/client';

import '@di/containers/renderer';

import { CaptureOverlayCreator } from '@adapters/ui/widgets/overlays/creator';
import { PreferencesDialogCreator } from '@adapters/ui/widgets/preferences/creator';
import { ProgressDialogCreator } from '@adapters/ui/widgets/progressdialog/creator';
import { StaticPageDialogCreator } from '@adapters/ui/widgets/staticpage/creator';
import { WidgetType } from '@adapters/ui/widgets/types';

type ReactWidgetCreatorMap = {
  [widgetType: number]:
    | typeof CaptureOverlayCreator
    | typeof PreferencesDialogCreator
    | typeof ProgressDialogCreator
    | typeof StaticPageDialogCreator;
};

const reactWidgetCreators: ReactWidgetCreatorMap = {
  [WidgetType.PROGRESS_DIALOG]: ProgressDialogCreator,
  [WidgetType.STATIC_PAGE_DIALOG]: StaticPageDialogCreator,
  [WidgetType.PREFERENECS_DIALOG]: PreferencesDialogCreator,
  [WidgetType.CAPTURE_OVERLAY]: CaptureOverlayCreator,
};

ipcRenderer.on('loadWidget', (_event, data) => {
  const { type: widgetType, options } = data;
  const ReactWidget = reactWidgetCreators[widgetType];
  const root = createRoot(document.getElementById('root')!);
  root.render(<ReactWidget {...options} />);
});
