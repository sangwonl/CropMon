import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  Grid,
  Button,
  Checkbox,
  FormControlLabel,
  InputLabel,
} from '@material-ui/core';

import { RootState } from '@presenters/redux/store';
import { IPreferences } from '@presenters/redux/ui/types';
import {
  toggleOpenRecordHomeDir,
  chooseRecordHomeDir,
  closePreferences,
} from '@presenters/redux/ui/slice';

import './BasicPreferences.css';

export default function BasicPreferences() {
  const dispatch = useDispatch();

  const prefsState: IPreferences = useSelector(
    (state: RootState) => state.ui.preferencesWindow.preferences
  );

  return (
    <Grid>
      <InputLabel>{prefsState.recordHomeDir}</InputLabel>
      <Button
        color="secondary"
        variant="contained"
        onClick={() => {
          dispatch(chooseRecordHomeDir());
        }}
      >
        ...
      </Button>
      <FormControlLabel
        control={
          <Checkbox
            name="open-record-home-when-completed"
            checked={prefsState.shouldOpenRecordHomeDir}
            onChange={() => {
              dispatch(toggleOpenRecordHomeDir());
            }}
            color="primary"
          />
        }
        label="Open the folder when recording complete"
      />
      <Button
        color="primary"
        variant="contained"
        onClick={() => {
          dispatch(closePreferences(true));
        }}
      >
        ...
      </Button>
    </Grid>
  );
}
