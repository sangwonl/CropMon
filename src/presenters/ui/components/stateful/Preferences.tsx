/* eslint-disable import/prefer-default-export */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { IPreferences } from '@core/entities/preferences';
import { RootState } from '@presenters/redux/store';
import {
  chooseRecordHomeDir,
  closePreferences,
  setFlagToOpenRecordHomeDir,
  setShortcut,
} from '@presenters/redux/ui/slice';

import { BasePreferences } from '../stateless/BasePreferences';

export const Preferences = () => {
  const dispatch = useDispatch();

  const prefsState: IPreferences = useSelector(
    (state: RootState) => state.ui.preferencesModal.preferences
  );

  return (
    <BasePreferences
      prefs={prefsState}
      onClose={(shouldSave = false) => dispatch(closePreferences(shouldSave))}
      onChooseRecordHomeDir={() => dispatch(chooseRecordHomeDir())}
      onToggleOpenRecordHomeDir={(shouldOpen) =>
        dispatch(setFlagToOpenRecordHomeDir(shouldOpen))
      }
      onChangeShortcut={(shortcut) => dispatch(setShortcut(shortcut))}
    />
  );
};
