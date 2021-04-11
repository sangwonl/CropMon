import React from 'react';
import { Provider } from 'react-redux';

import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

import configureStore from 'redux-mock-store';

import App from '../App';
import { RootState } from '../../../redux/store';

describe('App', () => {
  const mockStore = configureStore<RootState>();

  it('should render', () => {
    const store = mockStore({ capture: { curCaptureCtx: undefined } });

    expect(
      render(
        <Provider store={store}>
          <App />
        </Provider>
      )
    ).toBeTruthy();
  });
});
