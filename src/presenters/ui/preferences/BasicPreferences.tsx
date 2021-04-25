import React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@presenters/redux/store';

import './BasicPreferences.css';

export default function BasicPreferences() {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const state = useSelector((state: RootState) => state);

  return (
    <div>
      <p>{JSON.stringify(state, null, 2)}</p>
    </div>
  );
}
