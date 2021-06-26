import ReactDOM from 'react-dom';

import progressDialogCreator from '@ui/widgets/progressdialog/creator';
import staticPagePopupCreator from '@ui/widgets/staticpage/creator';
import preferencesWindowCreator from '@ui/widgets/preferences/creator';
import overlaysWindowCreator from '@ui/widgets/overlays/creator';
import { getCurWidgetCustomData } from '@utils/remote';

import { WidgetType } from './types';

type WinCreator = () => JSX.Element;
interface WinCreatorMap {
  [winType: number]: WinCreator;
}

const creators: WinCreatorMap = {
  [WidgetType.PROGRESS_DIALOG]: progressDialogCreator,
  [WidgetType.STATIC_PAGE_POPUP]: staticPagePopupCreator,
  [WidgetType.PREFERENECS_MODAL]: preferencesWindowCreator,
  [WidgetType.CAPTURE_OVERLAY]: overlaysWindowCreator,
};

const winType = getCurWidgetCustomData<WidgetType>('type');
ReactDOM.render(creators[winType](), document.getElementById('root'));