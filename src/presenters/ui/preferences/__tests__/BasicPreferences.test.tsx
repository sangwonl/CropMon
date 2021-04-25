import React from 'react';
import { Provider } from 'react-redux';

import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';

import { RootState } from '@presenters/redux/store';
import BasicPreferences from '@presenters/ui/preferences/BasicPreferences';

describe('BasicPreferences', () => {
  const mockStore = configureStore<RootState>();

  it('should render', () => {
    const store = mockStore({
      ui: { preferences: { show: false } },
      capture: { curCaptureCtx: undefined },
    });

    expect(
      render(
        <Provider store={store}>
          <BasicPreferences />
        </Provider>
      )
    ).toBeTruthy();
  });
});