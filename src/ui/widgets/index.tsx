/* eslint-disable @typescript-eslint/no-explicit-any */

import ReactDOM from 'react-dom';

import { WidgetType } from '@ui/widgets/types';
import progressDialogCreator from '@ui/widgets/progressdialog/creator';
import staticPagePopupCreator from '@ui/widgets/staticpage/creator';
import preferencesModalCreator from '@ui/widgets/preferences/creator';
import overlaysCreator from '@ui/widgets/overlays/creator';
import controlPanelCreator from '@ui/widgets/ctrlpanel/creator';

import { ipcRenderer } from 'electron';

type WidgetCreator = (options: any) => JSX.Element;
interface WidgetCreatorMap {
  [widgetType: number]: WidgetCreator;
}

const creators: WidgetCreatorMap = {
  [WidgetType.PROGRESS_DIALOG]: progressDialogCreator,
  [WidgetType.STATIC_PAGE_POPUP]: staticPagePopupCreator,
  [WidgetType.PREFERENECS_MODAL]: preferencesModalCreator,
  [WidgetType.CAPTURE_OVERLAY]: overlaysCreator,
  [WidgetType.CONTROL_PANEL]: controlPanelCreator,
};

ipcRenderer.on('loadWidget', (_event, data) => {
  const { type: widgetType, options } = data;
  ReactDOM.render(
    creators[widgetType](options),
    document.getElementById('root')
  );
});
