import React from 'react';
import { Provider } from 'react-redux';

import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';

import { RootState } from '@presenters/redux/store';

import App from '@presenters/ui/preference/Preference';

describe('App', () => {
  const mockStore = configureStore<RootState>();

  it('should render', () => {
    const store = mockStore({
      ui: { preference: { show: false } },
      capture: { curCaptureCtx: undefined },
    });

    expect(
      render(
        <Provider store={store}>
          <App />
        </Provider>
      )
    ).toBeTruthy();
  });
});
