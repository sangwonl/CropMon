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
  willChooseRecordHomeDir,
} from '@presenters/redux/ui/slice';

import './BasicPreferences.css';

export default function BasicPreferences() {
  const dispatch = useDispatch();

  const prefsState: IPreferences = useSelector(
    (state: RootState) => state.ui.preferences
  );

  return (
    <Grid>
      <InputLabel>{prefsState.recordHomeDir}</InputLabel>
      <Button
        color="secondary"
        variant="contained"
        onClick={() => {
          dispatch(willChooseRecordHomeDir());
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
    </Grid>
  );
}
