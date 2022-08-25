/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ipcRenderer } from 'electron';
import { createRoot } from 'react-dom/client';

import { WidgetType } from '@adapters/ui/widgets/types';
import progressDialogCreator from '@adapters/ui/widgets/progressdialog/creator';
import staticPagePopupCreator from '@adapters/ui/widgets/staticpage/creator';
import preferencesModalCreator from '@adapters/ui/widgets/preferences/creator';
import overlaysCreator from '@adapters/ui/widgets/overlays/creator';

type WidgetCreator = (options: any) => JSX.Element;
interface WidgetCreatorMap {
  [widgetType: number]: WidgetCreator;
}

const creators: WidgetCreatorMap = {
  [WidgetType.PROGRESS_DIALOG]: progressDialogCreator,
  [WidgetType.STATIC_PAGE_POPUP]: staticPagePopupCreator,
  [WidgetType.PREFERENECS_MODAL]: preferencesModalCreator,
  [WidgetType.CAPTURE_OVERLAY]: overlaysCreator,
};

ipcRenderer.on('loadWidget', (_event, data) => {
  const { type: widgetType, options } = data;
  const root = createRoot(document.getElementById('root')!);
  root.render(creators[widgetType](options));
});
