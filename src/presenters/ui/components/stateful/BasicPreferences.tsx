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

import styles from './BasicPreferences.css';

export const BasicPreferences = () => {
  const dispatch = useDispatch();

  const prefsState: IPreferences = useSelector(
    (state: RootState) => state.ui.preferencesModal.preferences
  );

  return (
    <Grid container className={styles.mainContainer}>
      <Grid container className={styles.itemRow}>
        <TextField
          className={styles.itemRecordHome}
          label="Record files to:"
          variant="outlined"
          value={prefsState.recordHomeDir}
          InputProps={{ readOnly: true }}
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
      <Grid container className={styles.itemOpenRecordHome}>
        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              name="open-record-home-when-completed"
              checked={prefsState.openRecordHomeDirWhenRecordCompleted}
              onChange={() => {
                dispatch(toggleOpenRecordHomeDir());
              }}
            />
          }
          label="Open the folder when recording complete"
        />
      </Grid>
      <Grid container className={styles.buttonRow}>
        <Button
          className={styles.button}
          color="secondary"
          variant="contained"
          onClick={() => {
            dispatch(closePreferences(true));
          }}
        >
          Save
        </Button>
        <Button
          className={styles.button}
          color="default"
          variant="contained"
          onClick={() => {
            dispatch(closePreferences());
          }}
        >
          Close
        </Button>
      </Grid>
    </Grid>
  );
};
