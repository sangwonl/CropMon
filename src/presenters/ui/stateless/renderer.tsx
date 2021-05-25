import React from 'react';
import ReactDOM from 'react-dom';

import { getCurWindowCustomData } from '@utils/remote';

import { StatelessWindowType } from './types';
import ProgressBar from './progress/dom';

const winType = getCurWindowCustomData<StatelessWindowType>('statelessWinType');

if (winType === StatelessWindowType.PROGRESS_BAR) {
  ReactDOM.render(<ProgressBar />, document.getElementById('root'));
}
