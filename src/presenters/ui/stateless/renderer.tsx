import React from 'react';
import ReactDOM from 'react-dom';

import { getCurWindowCustomData } from '@utils/remote';

import { WindowType } from './types';
import ProgressBar from './progress/dom';

const winType = getCurWindowCustomData<WindowType>('winType');

if (winType === WindowType.PROGRESS_DIALOG) {
  ReactDOM.render(<ProgressBar />, document.getElementById('root'));
}
