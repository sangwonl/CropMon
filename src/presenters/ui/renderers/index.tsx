import ReactDOM from 'react-dom';

import progressDialogCreator from '@presenters/ui/renderers/progressdialog/creator';
import staticPagePopupCreator from '@presenters/ui/renderers/staticpage/creator';
import preferencesWindowCreator from '@presenters/ui/renderers/preferences/creator';
import overlaysWindowCreator from '@presenters/ui/renderers/overlays/creator';
import { getCurWindowCustomData } from '@utils/remote';

import { WindowType } from './types';

type WinCreator = () => JSX.Element;
interface WinCreatorMap {
  [winType: number]: WinCreator;
}

const creators: WinCreatorMap = {
  [WindowType.PROGRESS_DIALOG]: progressDialogCreator,
  [WindowType.STATIC_PAGE_POPUP]: staticPagePopupCreator,
  [WindowType.PREFERENECS_WINDOW]: preferencesWindowCreator,
  [WindowType.OVERLAYS_WINDOW]: overlaysWindowCreator,
};

const winType = getCurWindowCustomData<WindowType>('type');
ReactDOM.render(creators[winType](), document.getElementById('root'));
