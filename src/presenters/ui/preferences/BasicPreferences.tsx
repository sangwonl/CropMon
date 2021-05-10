/* eslint-disable import/prefer-default-export */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  Grid,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
} from '@material-ui/core';

import { IPreferences } from '@core/entities/preferences';
import { RootState } from '@presenters/redux/store';
import {
  toggleOpenRecordHomeDir,
  chooseRecordHomeDir,
  closePreferences,
} from '@presenters/redux/ui/slice';

import './BasicPreferences.css';

export const BasicPreferences = () => {
  const dispatch = useDispatch();

  const prefsState: IPreferences = useSelector(
    (state: RootState) => state.ui.preferencesWindow.preferences
  );

  return (
    <Grid
      container
      direction="column"
      justify="flex-start"
      alignItems="flex-start"
      style={{ padding: 20 }}
    >
      <Grid container direction="row" justify="flex-start" alignItems="stretch">
        <TextField
          label="Record files to:"
          variant="outlined"
          value={prefsState.recordHomeDir}
          InputProps={{
            readOnly: true,
          }}
          style={{
            flexGrow: 1,
            marginRight: 10,
          }}
        />
        <Button
          variant="outlined"
          onClick={() => {
            dispatch(chooseRecordHomeDir());
          }}
        >
          ...
        </Button>
      </Grid>
      <Grid>
        <FormControlLabel
          control={
            <Checkbox
              name="open-record-home-when-completed"
              checked={prefsState.openRecordHomeDirWhenRecordCompleted}
              onChange={() => {
                dispatch(toggleOpenRecordHomeDir());
              }}
              color="primary"
            />
          }
          label="Open the folder when recording complete"
        />
      </Grid>
      <Grid
        container
        direction="row"
        justify="flex-end"
        alignItems="stretch"
        style={{
          marginTop: 30,
          height: 44,
        }}
      >
        <Button
          color="secondary"
          variant="contained"
          style={{
            width: 80,
            marginLeft: 10,
          }}
          onClick={() => {
            dispatch(closePreferences(true));
          }}
        >
          Save
        </Button>
        <Button
          color="primary"
          variant="contained"
          style={{
            width: 80,
            marginLeft: 10,
          }}
          onClick={() => {
            dispatch(closePreferences());
          }}
        >
          Cancel
        </Button>
      </Grid>
    </Grid>
  );
};
