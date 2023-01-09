/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ipcRenderer } from 'electron';
import React from 'react';
import { createRoot } from 'react-dom/client';

import '@di/containers/renderer';

import OverlaysCreator from '@adapters/ui/widgets/overlays/creator';
import PreferencesModalCreator from '@adapters/ui/widgets/preferences/creator';
import ProgressDialogCreator from '@adapters/ui/widgets/progressdialog/creator';
import StaticPagePopupCreator from '@adapters/ui/widgets/staticpage/creator';
import { WidgetType } from '@adapters/ui/widgets/types';

type WidgetCreator = (options: any) => JSX.Element;
interface WidgetCreatorMap {
  [widgetType: number]: WidgetCreator;
}

const creators: WidgetCreatorMap = {
  [WidgetType.PROGRESS_DIALOG]: ProgressDialogCreator,
  [WidgetType.STATIC_PAGE_POPUP]: StaticPagePopupCreator,
  [WidgetType.PREFERENECS_MODAL]: PreferencesModalCreator,
  [WidgetType.CAPTURE_OVERLAY]: OverlaysCreator,
};

ipcRenderer.on('loadWidget', (_event, data) => {
  const { type: widgetType, options } = data;
  const root = createRoot(document.getElementById('root')!);

  const Widget = creators[widgetType];
  // eslint-disable-next-line react/jsx-props-no-spreading
  root.render(<Widget {...options} />);
});
