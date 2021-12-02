import ReactDOM from 'react-dom';

import { WidgetType } from '@ui/widgets/types';
import progressDialogCreator from '@ui/widgets/progressdialog/creator';
import staticPagePopupCreator from '@ui/widgets/staticpage/creator';
import preferencesModalCreator from '@ui/widgets/preferences/creator';
import overlaysCreator from '@ui/widgets/overlays/creator';
import controlPanelCreator from '@ui/widgets/ctrlpanel/creator';

import { getCurWidgetCustomData } from '@utils/remote';

type WinCreator = () => JSX.Element;
interface WinCreatorMap {
  [winType: number]: WinCreator;
}

const creators: WinCreatorMap = {
  [WidgetType.PROGRESS_DIALOG]: progressDialogCreator,
  [WidgetType.STATIC_PAGE_POPUP]: staticPagePopupCreator,
  [WidgetType.PREFERENECS_MODAL]: preferencesModalCreator,
  [WidgetType.CAPTURE_OVERLAY]: overlaysCreator,
  [WidgetType.CONTROL_PANEL]: controlPanelCreator,
};

const winType = getCurWidgetCustomData<WidgetType>('type');
ReactDOM.render(creators[winType](), document.getElementById('root'));
