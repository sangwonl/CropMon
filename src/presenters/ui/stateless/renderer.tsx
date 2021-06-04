/* eslint-disable import/no-named-as-default */

import ReactDOM from 'react-dom';

import { getCurWindowCustomData } from '@utils/remote';

import { WindowType } from './types';
import progressDialogCreator from './containers/progressdialog/creator';
import staticPagePopupCreator from './containers/staticpage/creator';

type WinCreator = () => JSX.Element;
interface WinCreatorMap {
  [winType: number]: WinCreator;
}

const creators: WinCreatorMap = {
  [WindowType.PROGRESS_DIALOG]: progressDialogCreator,
  [WindowType.STATIC_PAGE_POPUP]: staticPagePopupCreator,
};

const winType = getCurWindowCustomData<WindowType>('type');
ReactDOM.render(creators[winType](), document.getElementById('root'));
