import ReactDOM from 'react-dom';

import { getCurWindowCustomData } from '@utils/remote';

import { WindowType } from './types';
import progressDialogCreator from './containers/progressdialog/dom';

type WinCreator = () => JSX.Element;
interface WinFactories {
  [winType: number]: WinCreator;
}

const factories: WinFactories = {
  [WindowType.PROGRESS_DIALOG]: progressDialogCreator,
};

const winType = getCurWindowCustomData<WindowType>('type');
ReactDOM.render(factories[winType](), document.getElementById('root'));
