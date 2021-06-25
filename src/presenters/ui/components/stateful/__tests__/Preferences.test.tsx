import React from 'react';
import { Provider } from 'react-redux';

import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';

import { RootState } from '@presenters/redux/store';
import { Preferences } from '@presenters/ui/components/stateful/Preferences';

describe('Preferences', () => {
  const mockStore = configureStore<RootState>();

  it('should render', () => {
    const store = mockStore({
      ui: {
        preferencesModal: {
          show: false,
          preferences: {
            version: '0.0.1',
            recordHomeDir: '/temp/record',
            openRecordHomeDirWhenRecordCompleted: true,
            shortcut: 'Super+Shift+E',
          },
        },
        captureOverlays: {},
        captureArea: {
          screenIdOnSelection: undefined,
          selectedBounds: undefined,
          isRecording: false,
        },
      },
      capture: { curCaptureCtx: undefined },
    });

    expect(
      render(
        <Provider store={store}>
          <Preferences />
        </Provider>
      )
    ).toBeTruthy();
  });
});